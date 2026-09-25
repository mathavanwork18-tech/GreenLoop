import type { AIAnalysisResult } from '../../types/post.types'
import { GreenAiEngine } from './aiEngine'
import { aiTools } from './aiTools'
import type { ProcessQueryOptions } from './aiEngine'
import type { AIMessage, AIConversationState } from '../../types/ai.types'

/**
 * Optimizes an image data URL on a hidden HTML5 canvas to prevent sending massive uncompressed photos over network.
 */
async function optimizeImageForAnalysis(dataUrl: string, maxDimension = 1280, quality = 0.85): Promise<string> {
  if (typeof window === 'undefined' || !dataUrl.startsWith('data:image')) return dataUrl

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      let { width, height } = img
      if (width <= maxDimension && height <= maxDimension && dataUrl.length < 600000) {
        return resolve(dataUrl)
      }

      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width)
        width = maxDimension
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height)
        height = maxDimension
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve(dataUrl)

      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export const aiApi = {
  /**
   * Real Multimodal Gemini Analysis via Green Loop Backend Service.
   */
  async analyzeDeviceImage(
    imageDataUrl: string,
    language: string = 'en',
    description: string = ''
  ): Promise<AIAnalysisResult> {
    const optimizedImage = await optimizeImageForAnalysis(imageDataUrl)

    const response = await fetch('/api/ai/analyze-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: optimizedImage,
        language,
        description
      })
    })

    if (!response.ok) {
      let errorMsg = `Server returned error status ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData?.error) errorMsg = errorData.error
      } catch {}
      throw new Error(errorMsg)
    }

    let payload: any = null
    try {
      payload = await response.json()
    } catch {
      throw new Error('Invalid response received from AI service.')
    }

    if (!payload?.success || !payload?.data) {
      throw new Error(payload?.error || 'Failed to analyze product image')
    }

    const d = payload.data

    const isHazardous =
      String(d.condition).toLowerCase().includes('hazmat') ||
      String(d.condition).toLowerCase().includes('swoll') ||
      String(d.damage).toLowerCase().includes('swoll') ||
      String(d.damage).toLowerCase().includes('leak')

    let suggestedAction: 'Sell' | 'Repair' | 'Donate' | 'Recycle' = 'Sell'
    if (isHazardous) {
      suggestedAction = 'Recycle'
    } else if (String(d.reusability).toLowerCase() === 'none') {
      suggestedAction = 'Recycle'
    } else if (String(d.damage).toLowerCase().includes('cracked') || String(d.damage).toLowerCase().includes('broken')) {
      suggestedAction = 'Repair'
    } else if (d.estimated_value_max <= 500) {
      suggestedAction = 'Donate'
    }

    return {
      productName: d.product_name,
      detectedBrand: d.brand,
      detectedModel: d.model,
      detectedCategory: d.category,
      confidence: Math.round(Number(d.confidence || 0.75) * 100),
      condition: d.condition,
      estimatedValuation: {
        min: d.estimated_value_min || 0,
        max: d.estimated_value_max || 0,
        currency: 'INR'
      },
      suggestedAction,
      description: d.description,
      damage: d.damage,
      estimatedAge: d.estimated_age,
      reusability: d.reusability,
      recyclability: d.recyclability,
      materials: d.materials || [],
      components: d.components || [],
      keywords: d.keywords || [],
      hazardAlert: isHazardous
        ? 'Hazardous battery / chemical hazard detected. Keep isolated from flammable items and route directly to authorized hazardous recycling.'
        : undefined,
      recyclingImpact: {
        co2OffsetKg: Math.round((d.estimated_value_max > 0 ? d.estimated_value_max * 0.005 : 5.0) * 10) / 10,
        materials: d.materials?.length ? d.materials : ['Recoverable Materials', 'ABS Polymer', 'Copper Wiring']
      }
    }
  },

  /**
   * Conversational e-waste advisory directly from trained Gemini service.
   */
  async chatWithGemini(options: {
    message: string
    history?: Array<{ role?: string; sender?: string; text?: string; content?: string }>
    context?: {
      userCity?: string
      currentPath?: string
      role?: string
    }
    language?: string
  }): Promise<{ text: string; hazardAlert?: string; modelUsed?: string }> {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    })

    if (!response.ok) {
      let errorMsg = `Server error ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData?.error) errorMsg = errorData.error
      } catch {}
      throw new Error(errorMsg)
    }

    let payload: any = null
    try {
      payload = await response.json()
    } catch {
      throw new Error('Invalid response received from chat service')
    }

    if (!payload?.success || !payload?.data) {
      throw new Error(payload?.error || 'Failed to get AI response')
    }

    return payload.data
  },

  /**
   * Process interactive chat assistant message grounded in real application data.
   */
  async processAssistantQuery(options: ProcessQueryOptions): Promise<{
    message: AIMessage
    updatedState: AIConversationState
  }> {
    await new Promise((r) => setTimeout(r, 350))
    return GreenAiEngine.processMessage(options)
  },

  /**
   * Exposes raw tools directly for programmatic use.
   */
  tools: aiTools
}

export default aiApi

