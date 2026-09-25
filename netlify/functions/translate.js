import dns from 'dns'

try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

const TRANSLATION_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-3.8-flash',
  'gemini-flash-latest',
]

const LANG_NAME_MAP = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  ml: 'Malayalam',
  kn: 'Kannada',
  te: 'Telugu',
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' }),
    }
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'GEMINI_API_KEY is not configured in server environment' }),
    }
  }

  try {
    const payload = JSON.parse(event.body || '{}')
    const { text, texts, title, description, sourceLanguage = 'auto', targetLanguage = 'en' } = payload

    let fields = texts || {}
    if (typeof text === 'string' && text.trim()) fields.text = text.trim()
    if (typeof title === 'string' && title.trim()) fields.title = title.trim()
    if (typeof description === 'string' && description.trim()) fields.description = description.trim()

    const entries = Object.entries(fields).filter(([_, val]) => typeof val === 'string' && val.trim().length > 0)
    if (entries.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          translations: fields,
          translatedText: text || '',
          detectedSourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
          targetLanguage,
        }),
      }
    }

    const targetLangName = LANG_NAME_MAP[targetLanguage.toLowerCase()] || targetLanguage
    const sourceLangName = sourceLanguage !== 'auto' && LANG_NAME_MAP[sourceLanguage.toLowerCase()]
      ? LANG_NAME_MAP[sourceLanguage.toLowerCase()]
      : 'the detected language (e.g. Tamil, Hindi, Malayalam, Kannada, Telugu, English, or Tanglish/Hinglish)'

    const systemPrompt = `You are a multilingual translation engine for an e-waste marketplace.

Translate the supplied user-generated content from ${sourceLangName} to ${targetLangName} (language code: ${targetLanguage.toLowerCase()}).

Rules:
- Preserve the original meaning.
- Do not add information.
- Do not remove information.
- Do not invent product specifications.
- Preserve numbers, prices, model numbers and units.
- Preserve brand names.
- Preserve names and IDs.
- Keep the translation natural for a marketplace.
- Return only the translated content as a valid JSON object matching the exact input field keys, plus "detectedSourceLanguage".
- Never translate database IDs or technical identifiers.`

    const prompt = `${systemPrompt}\n\nFields to translate:\n${JSON.stringify(fields, null, 2)}\n\nRespond ONLY with valid JSON.`

    let lastError = null

    for (const model of TRANSLATION_MODELS) {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 12000)

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        const res = await fetch(endpoint, {
          method: 'POST',
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
              maxOutputTokens: 1000,
            },
          }),
        })

        clearTimeout(timeoutId)

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          lastError = new Error(errData.error?.message || `HTTP ${res.status}`)
          continue
        }

        const data = await res.json()
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!rawText) continue

        let parsed
        try {
          parsed = JSON.parse(rawText)
        } catch {
          const m = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
          if (m) parsed = JSON.parse(m[1])
          else continue
        }

        const detected = parsed.detectedSourceLanguage || (sourceLanguage !== 'auto' ? sourceLanguage : 'en')
        delete parsed.detectedSourceLanguage

        const translations = {}
        for (const [k, v] of Object.entries(fields)) {
          translations[k] = parsed[k] || v
        }

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            success: true,
            translatedText: translations.text || translations.title || Object.values(translations)[0] || '',
            translations,
            detectedSourceLanguage: detected,
            targetLanguage,
          }),
        }
      } catch (err) {
        clearTimeout(timeoutId)
        lastError = err
      }
    }

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: lastError?.message || 'Translation failed across all models',
      }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: err.message }),
    }
  }
}
