import dns from 'dns'

try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

const TRANSLATION_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
]

const LANG_NAME_MAP = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  ml: 'Malayalam',
  kn: 'Kannada',
  te: 'Telugu',
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your deployment environment variables.' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { text, texts, title, description, sourceLanguage = 'auto', targetLanguage = 'en' } = payload;

    let fields = texts || {};
    if (typeof text === 'string' && text.trim()) fields.text = text.trim();
    if (typeof title === 'string' && title.trim()) fields.title = title.trim();
    if (typeof description === 'string' && description.trim()) fields.description = description.trim();

    const entries = Object.entries(fields).filter(([_, val]) => typeof val === 'string' && val.trim().length > 0);
    if (entries.length === 0) {
      return res.status(200).json({
        success: true,
        translations: fields,
        translatedText: text || '',
        detectedSourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
        targetLanguage,
      });
    }

    const targetLangName = LANG_NAME_MAP[targetLanguage.toLowerCase()] || targetLanguage;
    const sourceLangName = sourceLanguage !== 'auto' && LANG_NAME_MAP[sourceLanguage.toLowerCase()]
      ? LANG_NAME_MAP[sourceLanguage.toLowerCase()]
      : 'the detected language (e.g. Tamil, Hindi, Malayalam, Kannada, Telugu, English)';

    const systemPrompt = `You are a multilingual translation engine for the Green Loop circular e-waste platform.
Translate the supplied user-generated content from ${sourceLangName} to ${targetLangName} (language code: ${targetLanguage.toLowerCase()}).
Rules:
- Preserve original meaning.
- Keep model numbers, brand names, prices, numbers, and tech specs unchanged.
- Return ONLY a valid JSON object matching the exact input field keys, plus "detectedSourceLanguage".`;

    const prompt = `${systemPrompt}\n\nFields to translate:\n${JSON.stringify(fields, null, 2)}\n\nRespond ONLY with valid JSON.`;

    const geminiPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    let rawText = '';
    let lastError = null;

    for (const model of TRANSLATION_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload),
        });

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Model ${model} failed (${response.status}): ${errBody}`);
        }

        const data = await response.json();
        rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (rawText) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!rawText) {
      // Fallback: return original text without breaking
      return res.status(200).json({
        success: true,
        translations: fields,
        translatedText: text || Object.values(fields).join(' '),
        detectedSourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
        targetLanguage,
      });
    }

    let parsed = {};
    try {
      parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    const detected = parsed.detectedSourceLanguage || (sourceLanguage === 'auto' ? 'en' : sourceLanguage);
    const cleanedTranslations = {};
    for (const [key, val] of Object.entries(fields)) {
      cleanedTranslations[key] = (parsed[key] && typeof parsed[key] === 'string') ? parsed[key] : val;
    }

    return res.status(200).json({
      success: true,
      translations: cleanedTranslations,
      translatedText: cleanedTranslations.text || cleanedTranslations.title || text || '',
      detectedSourceLanguage: detected,
      targetLanguage,
    });
  } catch (error) {
    console.error('[Translation API Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Translation service error',
    });
  }
}
