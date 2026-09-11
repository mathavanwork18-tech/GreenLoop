import dns from 'dns'

// Prevent IPv6 DNS connection timeouts on Node.js / serverless environments
try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

const DEFAULT_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.7-flash'
]

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
])

// Maximum 7MB payload (approx 5MB unencoded image)
const MAX_PAYLOAD_SIZE = 7 * 1024 * 1024

/**
 * Normalizes and validates input image string to mimeType and raw base64 data.
 */
function parseImageData(imageInput) {
  if (typeof imageInput !== 'string' || !imageInput.trim()) {
    throw new Error('Product image is required (base64 data URI or string)')
  }

  if (imageInput.length > MAX_PAYLOAD_SIZE) {
    throw new Error('Image size exceeds 5MB limit. Please upload a compressed photo.')
  }

  // Check for Data URL format e.g. "data:image/jpeg;base64,..."
  const match = imageInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/)
  if (match) {
    const mimeType = match[1].toLowerCase()
    if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Unsupported image format: ${mimeType}. Please upload a JPEG, PNG, or WebP image.`)
    }
    const data = match[2].trim()
    if (!data) {
      throw new Error('Base64 image payload is empty.')
    }
    return { mimeType, data }
  }

  // If raw base64 string without data URI prefix
  const cleaned = imageInput.trim()
  if (!/^[A-Za-z0-9+/=]+$/.test(cleaned.slice(0, 100))) {
    throw new Error('Invalid image format: Not a recognized data URI or base64 image string.')
  }

  return {
    mimeType: 'image/jpeg',
    data: cleaned
  }
}

/**
 * Validates and ensures structured fields have expected types and fallbacks.
 */
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

/**
 * Redacts any accidental leakage of API key from error strings.
 */
function sanitizeErrorMessage(msg, apiKey) {
  if (!msg || typeof msg !== 'string') return 'An error occurred while analyzing the product.'
  let sanitized = msg
  if (apiKey && apiKey.length > 5) {
    sanitized = sanitized.split(apiKey).join('[REDACTED_API_KEY]')
  }
  return sanitized.replace(/key=[a-zA-Z0-9_\-.]+/gi, 'key=[REDACTED]')
}

export const handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed. Only POST requests are supported.' })
    }
  }

  // 1. Secure Server-Side API Key verification
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'GEMINI_API_KEY is not configured in Netlify environment variables. Please add GEMINI_API_KEY in your Netlify site settings (Site configuration > Environment variables) and trigger a new deploy.'
      })
    }
  }

  try {
    // 2. Parse & validate request payload
    let payload = {}
    try {
      payload = JSON.parse(event.body || '{}')
    } catch {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Invalid JSON body in request' })
      }
    }

    const { image, description = '', language = 'en' } = payload

    if (!image) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Product image is required (base64 data URI or string)' })
      }
    }

    let parsedImage
    try {
      parsedImage = parseImageData(image)
    } catch (parseErr) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: parseErr.message })
      }
    }

    const { mimeType, data: base64Data } = parsedImage

    // 3. Grounded e-waste cataloging prompt
    const systemPrompt = `You are an AI assistant helping users create an e-waste marketplace catalog.
Analyze the supplied product image carefully.
Identify only information that can reasonably be determined from the image.
Do not invent brand, model, specifications, condition, age, or value.
If information cannot be determined, return "Unknown".

Valuation Guidelines:
- Estimate resale/scrap value range in Indian Rupees (INR, ₹).
- If non-functional or pure scrap, set realistic materials/scrap valuation.
- If it is a dangerous swollen battery, flag hazardous condition and set value to 0.

Language:
- Provide all user-facing strings (product_name, description, condition, damage) in ${language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English'}.

Return ONLY valid JSON matching this schema:
{
  "product_name": "Clear descriptive name e.g. Dell Inspiron 15 or Unknown Laptop",
  "category": "One of: Mobile Phone, Laptop, Tablet, Desktop / PC, Battery & Power Bank, Audio & Headphones, Circuit Board / Scrap, Cables & Adapters, Home Appliance, Other Electronics",
  "subcategory": "Specific type e.g. Smartphone, Li-ion Battery, LCD Monitor, Motherboard",
  "brand": "Manufacturer name if clearly visible, otherwise Unknown",
  "model": "Model identifier if clearly visible, otherwise Unknown",
  "condition": "One of: Brand New, Like New, Good, Used - Acceptable, For Parts / Faulty, Hazmat (Swollen Battery)",
  "damage": "Observable physical damage e.g. cracked screen, missing keys, cosmetic wear, or None visible",
  "estimated_age": "e.g. 3-5 years or Unknown",
  "description": "Concise 2-3 sentence description highlighting visible features, condition, and potential for reuse or material recycling.",
  "reusability": "High, Moderate, Low, or None",
  "recyclability": "High, Moderate, or Low",
  "estimated_value_min": 500,
  "estimated_value_max": 1500,
  "materials": ["e.g. Aluminum", "Copper", "Lithium", "ABS Plastic"],
  "components": ["e.g. Display Panel", "Motherboard", "Battery"],
  "keywords": ["tag1", "tag2", "tag3"],
  "confidence": 0.95
}${description ? `\n\nUser Context/Notes: "${description}"` : ''}`

    let lastError = null

    // 4. Resilient multi-model fallback chain
    for (const model of DEFAULT_MODELS) {
      const abortController = new AbortController()
      // 18s per-model timeout to avoid hanging serverless functions
      const timeoutId = setTimeout(() => abortController.abort(), 18000)

      try {
        // Use x-goog-api-key header so secret key is never in the URL or query string
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

        const response = await fetch(endpoint, {
          method: 'POST',
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
              maxOutputTokens: 1400
            }
          })
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          const rawError = errData.error?.message || `HTTP ${response.status} ${response.statusText}`
          const cleanError = sanitizeErrorMessage(rawError, apiKey)
          console.warn(`[Netlify Function] Model ${model} returned error status ${response.status}: ${cleanError}`)

          // Distinguish rate limit vs general failure
          if (response.status === 429) {
            lastError = new Error('Gemini API rate limit reached. Retrying alternative model...')
          } else {
            lastError = new Error(cleanError)
          }
          continue
        }

        const data = await response.json()
        const candidate = data.candidates?.[0]

        if (!candidate) {
          const promptFeedback = data.promptFeedback
          if (promptFeedback?.blockReason) {
            throw new Error(`Image could not be processed due to content filter: ${promptFeedback.blockReason}`)
          }
          throw new Error('Gemini returned an empty response with no candidates.')
        }

        const rawText = candidate.content?.parts?.[0]?.text
        if (!rawText || !rawText.trim()) {
          throw new Error('Empty text content received from Gemini model candidate.')
        }

        let parsedJson
        try {
          parsedJson = JSON.parse(rawText)
        } catch (jsonErr) {
          const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
          if (jsonMatch) {
            parsedJson = JSON.parse(jsonMatch[1])
          } else {
            throw new Error('Failed to parse structured catalog JSON from Gemini response.')
          }
        }

        const sanitized = sanitizeProductData(parsedJson)
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: true, data: sanitized })
        }
      } catch (err) {
        clearTimeout(timeoutId)
        const isTimeout = err.name === 'AbortError'
        const errMsg = isTimeout
          ? `Analysis with model ${model} timed out after 18s.`
          : sanitizeErrorMessage(err.message, apiKey)

        console.warn(`[Netlify Function] Attempt with model ${model} failed:`, errMsg)
        lastError = new Error(errMsg)
      }
    }

    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: lastError?.message || 'All Gemini models were unable to analyze the product image. Please try again or enter details manually.'
      })
    }
  } catch (err) {
    const cleanError = sanitizeErrorMessage(err.message, apiKey)
    console.error('[Netlify Function Unhandled Error]:', cleanError)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: cleanError || 'Internal server error while analyzing product image.'
      })
    }
  }
}

export default handler
