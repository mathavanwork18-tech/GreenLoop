import dns from 'dns'

// Prevent IPv6 DNS connection timeouts on Node.js/Windows environments
try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

// Verified active Gemini model IDs for multimodal analysis & chat
const DEFAULT_MODELS = [
  'gemini-3-flash-preview',  // Fast and highly available vision model
  'gemini-flash-lite-latest', // High availability lite model
  'gemini-3.6-flash',        // Google's flagship flash model
  'gemini-flash-latest',     // General fallback
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

  const cleaned = imageInput.trim()
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
  const confidence = isNaN(confidenceNum) ? 0.85 : Math.max(0, Math.min(1, confidenceNum))

  // Swollen battery / hazardous check
  const isHazardous =
    cleanStr(d.hazard_level).toUpperCase() === 'CRITICAL' ||
    cleanStr(d.condition).toLowerCase().includes('hazmat') ||
    cleanStr(d.condition).toLowerCase().includes('swoll') ||
    cleanStr(d.damage).toLowerCase().includes('swoll') ||
    cleanStr(d.damage).toLowerCase().includes('leak')

  const minVal = isHazardous ? 0 : clampNumber(d.estimated_value_min, 0)
  const maxVal = isHazardous ? 0 : clampNumber(d.estimated_value_max, 0)

  let suggestedAction = cleanStr(d.suggested_action, 'Sell')
  if (isHazardous) {
    suggestedAction = 'Recycle'
  } else if (!['Sell', 'Repair', 'Donate', 'Recycle'].includes(suggestedAction)) {
    if (maxVal <= 500 && maxVal > 0) suggestedAction = 'Donate'
    else if (maxVal === 0) suggestedAction = 'Recycle'
    else suggestedAction = 'Sell'
  }

  const co2Offset = clampNumber(
    d.co2_offset_kg,
    Math.round((maxVal > 0 ? maxVal * 0.005 + 5.0 : 8.0) * 10) / 10
  )

  return {
    product_name: cleanStr(d.product_name, 'Unknown E-Waste Device'),
    category: cleanStr(d.category, 'Other Electronics'),
    subcategory: cleanStr(d.subcategory, 'Electronics'),
    brand: cleanStr(d.brand, 'Unknown'),
    model: cleanStr(d.model, 'Unknown'),
    condition: isHazardous ? 'Hazmat (Swollen Battery)' : cleanStr(d.condition, 'Used - Acceptable'),
    damage: cleanStr(d.damage, 'None visible'),
    estimated_age: cleanStr(d.estimated_age, 'Unknown'),
    description: cleanStr(d.description, 'Electronic device scanned for circular e-waste recycling or reuse.'),
    reusability: isHazardous ? 'None' : cleanStr(d.reusability, 'Moderate'),
    recyclability: cleanStr(d.recyclability, 'High'),
    suggested_action: suggestedAction,
    hazard_level: isHazardous ? 'CRITICAL' : cleanStr(d.hazard_level, 'NONE'),
    hazard_alert: isHazardous
      ? cleanStr(d.hazard_alert, 'DANGER: Swollen or damaged lithium battery detected. Risk of fire/toxic gas. Keep isolated in a fire-safe container and route immediately to a certified TNPCB recycler.')
      : (d.hazard_alert ? cleanStr(d.hazard_alert) : null),
    estimated_value_min: minVal,
    estimated_value_max: maxVal,
    co2_offset_kg: co2Offset,
    materials: cleanArr(d.materials),
    components: cleanArr(d.components),
    keywords: cleanArr(d.keywords),
    confidence: Math.round(confidence * 100) / 100
  }
}

function sanitizeErrorMessage(msg, apiKey) {
  if (!msg || typeof msg !== 'string') return 'An error occurred during AI analysis.'
  let sanitized = msg
  if (apiKey && apiKey.length > 5) {
    sanitized = sanitized.split(apiKey).join('[REDACTED_API_KEY]')
  }
  return sanitized.replace(/key=[a-zA-Z0-9_\-.]+/gi, 'key=[REDACTED]')
}

export class GeminiService {
  /**
   * Domain-Trained Multimodal Product Analyzer:
   * Analyzes an e-waste product photo and returns structured circular catalog data.
   *
   * @param {Object} options
   * @param {string} options.image - Base64 or Data URI of product image
   * @param {string} [options.description] - Optional user context or notes
   * @param {string} [options.language] - Preferred language ('en', 'ta', 'hi')
   * @returns {Promise<Object>} Structured catalog information
   */
  static async analyzeProduct({ image, description = '', language = 'en' }) {
    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please set it in backend/.env with a key from https://aistudio.google.com/app/apikey')
    }

    // Validate key format (supports both new AQ. and legacy AIza formats)
    if (!apiKey.startsWith('AIza') && !apiKey.startsWith('AQ.')) {
      if (apiKey.length < 20) {
        throw new Error(
          'Invalid GEMINI_API_KEY format. Please check your key at https://aistudio.google.com/app/apikey and update backend/.env'
        )
      }
    }

    const { mimeType, data: base64Data } = parseImageData(image)

    const systemPrompt = `You are Green Loop AI, an expert computer vision intelligence trained in electronic waste (e-waste) classification, circular economy triage, hazardous materials safety, and fair secondary-market valuation in India.

TRAINED DOMAIN KNOWLEDGE & INSTRUCTIONS:
1. Battery Safety & Hazardous Breach (CRITICAL PRIORITY):
   - Inspect carefully for swollen, bloated, leaking, punctured, dented, or overheating lithium-ion / lithium-polymer pouch cells.
   - If ANY battery swelling, electrolyte odor, or thermal scorch is detected:
     * Set condition to "Hazmat (Swollen Battery)"
     * Set hazard_level to "CRITICAL"
     * Set hazard_alert to "DANGER: Swollen or damaged lithium battery detected. Risk of thermal runaway and fire. Do not charge, pierce, or dispose in regular trash. Place in a fireproof or sand-filled container and hand over immediately to an authorized TNPCB/CPCB e-waste recycler."
     * Set reusability to "None"
     * Set suggested_action to "Recycle"
     * Set estimated_value_min and estimated_value_max to 0 (safety over profit).

2. Circular Economy Action Hierarchy:
   - "Sell": Intact, operational, or easily refurbished hardware (Laptops, Phones, Displays, PC components).
   - "Repair": Display cracked, battery degraded, or easily repairable faults.
   - "Donate": Functional hardware with low monetary resale (< ₹500) but high utility for students/non-profits.
   - "Recycle": Obsolete hardware, crushed frames, dead motherboards, or hazardous scrap (Zero Landfill).

3. Valuation Guidance in Indian Rupees (INR, ₹):
   - Baseline secondary market and scrap price benchmarks:
     * Working Laptops: ₹4,000 - ₹18,000; Scrap/Broken laptop for parts: ₹500 - ₹1,500
     * Working Smartphones: ₹1,500 - ₹12,000; Dead/Cracked scrap phone: ₹100 - ₹350
     * LCD/LED Monitors: ₹400 - ₹2,000; CRT Monitors: ₹50 - ₹150 (salvage glass/copper)
     * Desktop Motherboards & Circuit Boards: Scrap ₹150 - ₹400/kg
     * RAM & Solid State Drives (SSDs): ₹250 - ₹2,500
     * Copper Wires & Adapters: ₹50 - ₹200
     * Obsolete / Non-functional scrap: Fair scrap recovery value based on precious metal content.

4. Material Recovery & Environmental Impact:
   - Identify recoverable elements: Gold (Au), Silver (Ag), Palladium (Pd), Copper (Cu), Aluminum (Al), Cobalt (Co), Lithium (Li), Neodymium (Nd), ABS Plastic, Polycarbonate.
   - Estimate CO2 diversion impact in kilograms (typically 5 to 50 kg CO2e saved from landfill).

5. Accuracy & Output Constraints:
   - Identify only what is visually verifiable or stated in the user notes. Do not hallucinate fake brands.
   - Language for text fields: ${language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English'}.

Return ONLY a valid JSON object matching this schema:
{
  "product_name": "Clear descriptive name e.g. Dell Inspiron 15 or Unknown Laptop",
  "category": "One of: Mobile Phone, Laptop, Tablet, Desktop / PC, Battery & Power Bank, Audio & Headphones, Circuit Board / Scrap, Cables & Adapters, Home Appliance, Other Electronics",
  "subcategory": "Specific type e.g. Smartphone, Li-ion Battery, LCD Monitor, Motherboard",
  "brand": "Manufacturer name if visible, otherwise Unknown",
  "model": "Model name/number if visible, otherwise Unknown",
  "condition": "One of: Brand New, Like New, Good, Used - Acceptable, For Parts / Faulty, Hazmat (Swollen Battery)",
  "damage": "Observable physical damage e.g. cracked screen, swollen pouch, missing keys, or None visible",
  "estimated_age": "e.g. 2-4 years or Unknown",
  "description": "Concise 2-3 sentence description highlighting visible features, condition, and circular reuse/recycling potential.",
  "reusability": "High, Moderate, Low, or None",
  "recyclability": "High, Moderate, or Low",
  "suggested_action": "Sell, Repair, Donate, or Recycle",
  "hazard_level": "NONE, LOW, or CRITICAL",
  "hazard_alert": "Safety warning string if hazardous, else null",
  "estimated_value_min": 500,
  "estimated_value_max": 1500,
  "co2_offset_kg": 14.5,
  "materials": ["e.g. Copper", "Aluminum", "Gold", "ABS Plastic"],
  "components": ["e.g. Motherboard", "Display Panel", "Battery"],
  "keywords": ["tag1", "tag2", "tag3"],
  "confidence": 0.90
}${description ? `\n\nUser Context/Notes: "${description}"` : ''}`

    let lastError = null

    for (const model of DEFAULT_MODELS) {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 25000)

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

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
          console.warn(`[GeminiService] Model ${model} returned error: ${cleanError}`)

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
          throw new Error('Empty response received from Gemini')
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

        return sanitizeProductData(parsedJson)
      } catch (err) {
        clearTimeout(timeoutId)
        const isTimeout = err.name === 'AbortError'
        const errMsg = isTimeout
          ? `Analysis with model ${model} timed out after 18s.`
          : sanitizeErrorMessage(err.message, apiKey)

        console.warn(`[GeminiService] Attempt with ${model} failed:`, errMsg)
        lastError = new Error(errMsg)
      }
    }

    throw lastError || new Error('All Gemini models failed to analyze the product image')
  }

  /**
   * Domain-Trained Conversational AI:
   * Provides real-time guidance on electronics reuse, repair, battery safety, and recycling.
   *
   * @param {Object} options
   * @param {string} options.message - User prompt
   * @param {Array} [options.history] - Optional conversation history
   * @param {Object} [options.context] - Contextual metadata (location, active page, user role)
   * @param {string} [options.language] - Preferred language ('en', 'ta', 'hi')
   * @returns {Promise<Object>} Formatted AI reply with action recommendations
   */
  static async chat({ message, history = [], context = {}, language = 'en' }) {
    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the server environment.')
    }

    const cleanMessage = String(message || '').trim()
    if (!cleanMessage) {
      throw new Error('Message is required')
    }

    const systemInstruction = `You are Green Loop AI, an expert circular economy advisor and technical specialist for electronic waste (e-waste) management in India (Tamil Nadu and national coverage).
Your mission is to maximize device life, promote responsible certified recycling under Central Pollution Control Board (CPCB) and Tamil Nadu Pollution Control Board (TNPCB) regulations, ensure hazardous battery safety, and help users repair, sell, or safely dispose of electronics.

CORE KNOWLEDGE & RULES:
1. Battery Safety (HIGHEST PRIORITY):
   If the user asks about swollen, bulging, hot, leaking, or damaged batteries:
   - IMMEDIATELY state the fire risk.
   - Do NOT pierce, bend, crush, or plug into a charger.
   - Store in a non-flammable container (or dry sand bucket).
   - Hand over only to an authorized CPCB/TNPCB certified e-waste recycler.
2. Circular Economy Hierarchy:
   - Always encourage: Repair / Refurbish > Harvest Working Spare Parts (RAM, SSD, screen) > Material Recovery (smelting precious metals) > Safe Disposal (Zero Landfill).
3. Indian Secondary Market & Pricing:
   - Give realistic valuation ranges in Indian Rupees (₹ INR).
   - Explain secure data sanitization (DBAN, Android factory reset with device encryption, iOS Erase All Content and Settings) before handing over hardware.
4. Format:
   - Clean, friendly, actionable markdown with bullet points and bold highlights.
   - Conclude with 1-2 actionable recommendations.
${context?.userCity ? `User Location: ${context.userCity}` : ''}
${context?.currentPath ? `Current App View: ${context.currentPath}` : ''}
Language: Respond in ${language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English'}.`

    // Format conversation history for Gemini API
    const contents = []

    // Inject system instruction in contents or dedicated config
    contents.push({
      role: 'user',
      parts: [{ text: `[System Instruction]\n${systemInstruction}` }]
    })
    contents.push({
      role: 'model',
      parts: [{ text: 'Understood. I am Green Loop AI, trained in circular e-waste management, Indian market pricing, and hazardous safety. How can I assist?' }]
    })

    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.sender === 'user' || item.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: String(item.text || item.content || '').slice(0, 1000) }] })
        } else if (item.sender === 'ai' || item.role === 'model') {
          contents.push({ role: 'model', parts: [{ text: String(item.text || item.content || '').slice(0, 1000) }] })
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: cleanMessage.slice(0, 1500) }]
    })

    let lastError = null

    for (const model of DEFAULT_MODELS) {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 16000)

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

        const response = await fetch(endpoint, {
          method: 'POST',
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 900
            }
          })
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          const rawError = errData.error?.message || `HTTP ${response.status}`
          console.warn(`[GeminiService Chat] Model ${model} returned error:`, sanitizeErrorMessage(rawError, apiKey))
          lastError = new Error(sanitizeErrorMessage(rawError, apiKey))
          continue
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text || !text.trim()) {
          throw new Error('Empty response received from Gemini')
        }

        // Detect if reply contains hazardous battery warnings
        const isHazard = text.toLowerCase().includes('swollen') || text.toLowerCase().includes('thermal runaway')

        return {
          text: text.trim(),
          modelUsed: model,
          hazardAlert: isHazard
            ? 'Battery safety warning: handle with caution, avoid puncturing or charging.'
            : undefined
        }
      } catch (err) {
        clearTimeout(timeoutId)
        lastError = err
      }
    }

    throw lastError || new Error('All Gemini models failed to generate response')
  }

  /**
   * Generates a semantic vector embedding using Gemini gemini-embedding-001.
   */
  static async generateEmbedding(text) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || !apiKey.trim()) {
      throw new Error('GEMINI_API_KEY is not configured on the server')
    }

    const cleanText = String(text || '').trim().slice(0, 2048)
    if (!cleanText) {
      throw new Error('Text is required to generate an embedding')
    }

    const model = 'models/gemini-embedding-001'
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:embedContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        content: {
          parts: [{ text: cleanText }]
        }
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error?.message || `Gemini embedding request failed with HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.embedding?.values || []
  }

  /**
   * Domain-Trained Multilingual Translation Engine:
   * Translates user-generated e-waste marketplace content into the viewer's target language.
   * Preserves specifications, numbers, prices, model names, and brand names.
   */
  static async translateContent({ texts, text, sourceLanguage = 'auto', targetLanguage = 'en' }) {
    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in backend environment')
    }

    // Prepare dictionary of fields to translate
    let fieldsToTranslate = {}
    if (texts && typeof texts === 'object' && !Array.isArray(texts)) {
      fieldsToTranslate = { ...texts }
    } else if (typeof text === 'string' && text.trim()) {
      fieldsToTranslate = { text: text.trim() }
    }

    // Filter out empty or whitespace-only values
    const entries = Object.entries(fieldsToTranslate).filter(([_, val]) => typeof val === 'string' && val.trim().length > 0)
    if (entries.length === 0) {
      return {
        translations: fieldsToTranslate,
        translatedText: text || '',
        detectedSourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
        targetLanguage,
      }
    }

    const LANG_NAME_MAP = {
      en: 'English',
      ta: 'Tamil',
      hi: 'Hindi',
      ml: 'Malayalam',
      kn: 'Kannada',
      te: 'Telugu',
    }

    const targetLangName = LANG_NAME_MAP[targetLanguage.toLowerCase()] || targetLanguage
    const sourceLangName = sourceLanguage !== 'auto' && LANG_NAME_MAP[sourceLanguage.toLowerCase()]
      ? LANG_NAME_MAP[sourceLanguage.toLowerCase()]
      : 'the detected language (which may be Tamil, Hindi, Malayalam, Kannada, Telugu, English, or mixed Tanglish/Hinglish)'

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
- Return only the translated content as a valid JSON object matching the exact input field keys, plus "detectedSourceLanguage" (ISO 639-1 code like "ta", "hi", "en", "ml", "kn", "te").
- Never translate database IDs or technical identifiers.`

    const userPayload = JSON.stringify(fieldsToTranslate, null, 2)
    const prompt = `${systemPrompt}\n\nFields to translate:\n${userPayload}\n\nRespond ONLY with valid JSON.`

    const translationModels = [
      'gemini-3.5-flash-lite',
      'gemini-3-flash-preview',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ]

    let lastError = null

    for (const model of translationModels) {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 12000)

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        const response = await fetch(endpoint, {
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

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          const rawError = errData.error?.message || `HTTP ${response.status}`
          console.warn(`[GeminiService Translation] Model ${model} returned error:`, sanitizeErrorMessage(rawError, apiKey))
          lastError = new Error(sanitizeErrorMessage(rawError, apiKey))
          continue
        }

        const data = await response.json()
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!candidate || !candidate.trim()) {
          throw new Error('Empty translation response received from Gemini')
        }

        let parsedJson
        try {
          parsedJson = JSON.parse(candidate)
        } catch {
          const match = candidate.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
          if (match) parsedJson = JSON.parse(match[1])
          else throw new Error('Could not parse JSON from translation response')
        }

        const detectedLang = parsedJson.detectedSourceLanguage || (sourceLanguage !== 'auto' ? sourceLanguage : 'en')
        delete parsedJson.detectedSourceLanguage

        const translations = {}
        for (const [key, origVal] of Object.entries(fieldsToTranslate)) {
          translations[key] = parsedJson[key] || origVal
        }

        const translatedText = translations.text || translations.title || Object.values(translations)[0] || text || ''

        return {
          translations,
          translatedText,
          detectedSourceLanguage: detectedLang,
          targetLanguage,
          modelUsed: model,
        }
      } catch (err) {
        clearTimeout(timeoutId)
        lastError = err
      }
    }

    throw lastError || new Error('All Gemini translation models failed')
  }
}

export default GeminiService
