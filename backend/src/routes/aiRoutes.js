import express from 'express'
import { GeminiService } from '../services/geminiService.js'

const router = express.Router()

/**
 * GET /api/ai/status
 * Health and readiness check for the Gemini AI service.
 */
router.get('/status', (req, res) => {
  const isConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0)
  res.json({
    success: true,
    service: 'Green Loop Gemini AI Analysis Service',
    status: isConfigured ? 'ready' : 'missing_api_key',
    configured: isConfigured,
    modelStrategy: [
      'gemini-3.5-flash-lite',
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-3.7-flash'
    ]
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

export default router
