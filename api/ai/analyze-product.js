import dns from 'dns'

try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

const DEFAULT_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
]

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
])

const MAX_PAYLOAD_SIZE = 7 * 1024 * 1024

function parseImageData(imageInput) {
  if (!imageInput || typeof imageInput !== 'string' || !imageInput.trim()) {
    throw new Error('Product image is required (base64 data URI or string)')
  }

  if (imageInput.length > MAX_PAYLOAD_SIZE) {
    throw new Error('Image size exceeds 5MB limit. Please upload a compressed photo.')
  }

  const match = imageInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/)
  if (match) {
    const mimeType = match[1].toLowerCase()
    if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Unsupported image format: ${mimeType}. Please upload a JPEG, PNG, or WebP image.`)
    }
    const data = match[2].trim()
    if (!data) throw new Error('Base64 image payload is empty.')
    return { mimeType, data }
  }

  const cleaned = imageInput.trim()
  return {
    mimeType: 'image/jpeg',
    data: cleaned
  }
}

function sanitizeProductData(raw) {
  const isObj = raw && typeof raw === 'object' && !Array.isArray(raw)
  const d = isObj ? raw : {}

  const clampNumber = (val, def = 0) => {
    const num = Number(val)
    return isNaN(num) || num < 0 ? def : Math.round(num)
  }

  const cleanStr = (val, fallback = 'Unknown') => {
    if (!val || typeof val !== 'string' || val.trim() === '') return fallback
    return val.trim()
  }

  const cleanArr = (val) => {
    if (!Array.isArray(val)) return []
    return val.map((x) => String(x).trim()).filter(Boolean)
  }

  const confidenceNum = Number(d.confidence)
  const confidence = isNaN(confidenceNum) ? 0.75 : Math.max(0, Math.min(1, confidenceNum))

  return {
    product_name: cleanStr(d.product_name, 'Unknown E-Waste Device'),
    category: cleanStr(d.category, 'Other Electronics'),
    subcategory: cleanStr(d.subcategory, 'Electronics'),
    brand: cleanStr(d.brand, 'Unknown'),
    model: cleanStr(d.model, 'Unknown'),
    condition: cleanStr(d.condition, 'Used - Acceptable'),
    damage: cleanStr(d.damage, 'None visible'),
    estimated_age: cleanStr(d.estimated_age, 'Unknown'),
    description: cleanStr(d.description, 'Electronic device scanned for circular e-waste recycling or reuse.'),
    reusability: cleanStr(d.reusability, 'Moderate'),
    recyclability: cleanStr(d.recyclability, 'High'),
    estimated_value_min: clampNumber(d.estimated_value_min, 0),
    estimated_value_max: clampNumber(d.estimated_value_max, 0),
    materials: cleanArr(d.materials),
    components: cleanArr(d.components),
    keywords: cleanArr(d.keywords),
    confidence: Math.round(confidence * 100) / 100
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Only POST is supported.' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your deployment environment variables.' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { image, description = '', language = 'en' } = payload;

    const { mimeType, data: base64Data } = parseImageData(image);

    const systemPrompt = `You are the Green Loop Multimodal Circular Electronics Inspector.
Analyze this photo of an electronic item or component.
Respond ONLY with a valid, clean JSON object matching this exact schema:
{
  "product_name": "string",
  "category": "Mobile Phone | Laptop | Tablet | Battery & Power Bank | Audio & Accessories | Other Electronics",
  "subcategory": "string",
  "brand": "string",
  "model": "string",
  "condition": "Like New | Good | Fair | Scrap",
  "damage": "string (note swollen battery or chemical leak if visible)",
  "estimated_age": "string",
  "description": "string",
  "reusability": "High | Moderate | Low | None",
  "recyclability": "High | Moderate | Low",
  "estimated_value_min": number,
  "estimated_value_max": number,
  "materials": ["string"],
  "components": ["string"],
  "keywords": ["string"],
  "confidence": number
}`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: systemPrompt + (description ? `\nUser note: "${description}"` : '') },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    };

    let lastError = null;
    let rawText = '';

    for (const model of DEFAULT_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload),
        });

        if (!resp.ok) {
          const errBody = await resp.text();
          throw new Error(`Model ${model} returned ${resp.status}: ${errBody}`);
        }

        const data = await resp.json();
        rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (rawText) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!rawText) {
      throw lastError || new Error('No analysis text generated by Gemini models');
    }

    let parsed = {};
    try {
      parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    const sanitized = sanitizeProductData(parsed);

    return res.status(200).json({
      success: true,
      data: sanitized
    });
  } catch (error) {
    console.error('[AI Analyze Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Product image analysis failed.'
    });
  }
}
