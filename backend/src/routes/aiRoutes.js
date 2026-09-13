import express from 'express'
import { GeminiService } from '../services/geminiService.js'

const router = express.Router()

/**
 * GET /api/ai/status
 * Health, capability, and model check for the Gemini AI service.
 */
router.get('/status', (req, res) => {
  const isConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0)
  res.json({
    success: true,
    service: 'Green Loop Gemini Circular AI Engine',
    status: isConfigured ? 'ready' : 'missing_api_key',
    configured: isConfigured,
    capabilities: [
      'multimodal_image_analysis',
      'circular_valuation_inr',
      'swollen_battery_safety_detection',
      'conversational_ewaste_advisory',
      'vector_embeddings'
    ],
    domainTrained: {
      regulations: ['CPCB', 'TNPCB', 'E-Waste Management Rules 2022', 'EPR'],
      currency: 'INR (₹)',
      safetyTriage: 'Lithium battery swelling, hazardous chemicals, zero landfill'
    },
    modelStrategy: [
      'gemini-3.5-flash-lite',
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-3.7-flash'
    ],
    embeddingModel: 'models/gemini-embedding-001'
  })
})

/**
 * POST /api/ai/analyze-product
 * Analyzes e-waste image via multimodal Gemini and returns structured catalog data.
 */
router.post('/analyze-product', async (req, res) => {
  try {
    const { image, description, language } = req.body

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Product image is required (must provide base64 data URI or image string)'
      })
    }

    console.log(`[AI Route] Received product image for analysis (payload size: ~${Math.round(image.length / 1024)} KB)`)

    const analysis = await GeminiService.analyzeProduct({
      image,
      description,
      language: language || 'en'
    })

    console.log(`[AI Route] Analysis completed successfully: "${analysis.product_name}" (Confidence: ${analysis.confidence})`)

    return res.json({
      success: true,
      data: analysis
    })
  } catch (error) {
    console.error('[AI Route Error] Failed to analyze product:', error.message)
    return res.status(500).json({
      success: false,
      error: error.message || 'Unable to analyze product image right now. Please try again or enter details manually.'
    })
  }
})

/**
 * POST /api/ai/chat
 * Interactive conversational AI grounded in circular economy, repairs, and battery safety.
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history, context, language } = req.body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required'
      })
    }

    const reply = await GeminiService.chat({
      message,
      history,
      context,
      language: language || 'en'
    })

    return res.json({
      success: true,
      data: reply
    })
  } catch (error) {
    console.error('[AI Chat Route Error]:', error.message)
    return res.status(500).json({
      success: false,
      error: error.message || 'AI Chat service is temporarily unavailable'
    })
  }
})

/**
 * POST /api/ai/embed
 * Generates vector embedding for post semantic understanding & query personalization.
 */
router.post('/embed', async (req, res) => {
  try {
    const { text, texts } = req.body
    if (Array.isArray(texts)) {
      const embeddings = await Promise.all(
        texts.slice(0, 10).map((t) => GeminiService.generateEmbedding(t).catch(() => []))
      )
      return res.json({ success: true, embeddings })
    }

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text string is required' })
    }

    const embedding = await GeminiService.generateEmbedding(text)
    return res.json({ success: true, embedding })
  } catch (error) {
    console.error('[AI Embed Error]:', error.message)
    return res.status(500).json({
      success: false,
      error: error.message || 'Embedding generation failed'
    })
  }
})

export default router
