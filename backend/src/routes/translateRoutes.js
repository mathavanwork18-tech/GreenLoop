import express from 'express'
import { GeminiService } from '../services/geminiService.js'

const router = express.Router()

/**
 * POST /api/translate
 * Multilingual Translation Endpoint for Green Loop Circular Marketplace
 *
 * Supports single text:
 * { "text": "...", "sourceLanguage": "ta", "targetLanguage": "hi" }
 *
 * Supports batched fields:
 * { "title": "...", "description": "...", "targetLanguage": "hi" }
 * OR
 * { "texts": { "title": "...", "description": "..." }, "targetLanguage": "hi" }
 */
router.post('/', async (req, res) => {
  try {
    const { text, texts, title, description, sourceLanguage, targetLanguage = 'en' } = req.body

    let fields = texts || {}
    if (typeof text === 'string' && text.trim()) {
      fields.text = text.trim()
    }
    if (typeof title === 'string' && title.trim()) {
      fields.title = title.trim()
    }
    if (typeof description === 'string' && description.trim()) {
      fields.description = description.trim()
    }

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No text or fields provided for translation',
      })
    }

    const result = await GeminiService.translateContent({
      texts: fields,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage: targetLanguage || 'en',
    })

    return res.json({
      success: true,
      translatedText: result.translatedText,
      translations: result.translations,
      detectedSourceLanguage: result.detectedSourceLanguage,
      targetLanguage: result.targetLanguage,
    })
  } catch (error) {
    console.error('[Translation API Route Error]:', error.message)
    return res.status(500).json({
      success: false,
      error: error.message || 'Translation service is temporarily unavailable',
    })
  }
})

export default router
