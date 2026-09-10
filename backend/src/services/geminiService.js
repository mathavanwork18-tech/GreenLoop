import dns from 'dns'

// Prevent IPv6 DNS connection timeouts on Node.js/Windows environments
try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

const DEFAULT_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-flash'
]

/**
 * Normalizes input image string to mimeType and raw base64 data.
 */
function parseImageData(imageInput) {
  if (typeof imageInput !== 'string') {
    throw new Error('Image data must be a base64 encoded data URI or base64 string')
  }

  // Check for Data URL format e.g. "data:image/jpeg;base64,..."
  const match = imageInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/)
  if (match) {
    return {
      mimeType: match[1],
      data: match[2]
    }
  }

  // Default to JPEG if raw base64
  return {
    mimeType: 'image/jpeg',
    data: imageInput.trim()
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

export class GeminiService {
  /**
   * Analyze an e-waste product photo and return structured catalog data.
   *
   * @param {Object} options
   * @param {string} options.image - Base64 or Data URI of product image
   * @param {string} [options.description] - Optional user context or notes
   * @param {string} [options.language] - Optional preferred language (e.g. 'ta', 'hi', 'en')
   * @returns {Promise<Object>} Structured catalog information
   */
  static async analyzeProduct({ image, description = '', language = 'en' }) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the server environment')
    }

    const { mimeType, data: base64Data } = parseImageData(image)

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

    // Attempt through fallback model chain
    for (const model of DEFAULT_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
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
              maxOutputTokens: 1200
            }
          })
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          const errorMsg = errData.error?.message || `HTTP ${response.status}`
          console.warn(`[GeminiService] Model ${model} returned error: ${errorMsg}`)
          lastError = new Error(errorMsg)
          continue // Try next model in chain
        }

        const data = await response.json()
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!rawText) {
          throw new Error('Empty response received from Gemini')
        }

        let parsedJson
        try {
          parsedJson = JSON.parse(rawText)
        } catch (jsonErr) {
          // Attempt markdown fence extraction if present
          const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
          if (jsonMatch) {
            parsedJson = JSON.parse(jsonMatch[1])
          } else {
            throw jsonErr
          }
        }

        return sanitizeProductData(parsedJson)
      } catch (err) {
        console.warn(`[GeminiService] Attempt with ${model} failed:`, err.message)
        lastError = err
      }
    }

    // If all models failed, throw controlled error
    throw lastError || new Error('All Gemini models failed to analyze the product image')
  }
}

export default GeminiService
