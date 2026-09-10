import type { AIAnalysisResult } from '../../types/post.types'
import { GreenAiEngine } from './aiEngine'
import { aiTools } from './aiTools'
import type { ProcessQueryOptions } from './aiEngine'
import type { AIMessage, AIConversationState } from '../../types/ai.types'

export const aiApi = {
  /**
   * AI Vision scanner heuristic simulation for image upload.
   */
  async analyzeDeviceImage(imageDataUrl: string): Promise<AIAnalysisResult> {
    await new Promise(r => setTimeout(r, 900))

    const isBattery = imageDataUrl.includes('battery') || imageDataUrl.length % 5 === 0
    const isLaptop = imageDataUrl.includes('laptop') || imageDataUrl.length % 3 === 0

    if (isBattery) {
      return {
        detectedBrand: 'Generic OEM',
        detectedModel: 'Lithium-Ion Polymer Battery Pack',
        detectedCategory: 'Battery',
        confidence: 96,
        condition: 'Hazmat (Swollen Battery)',
        estimatedValuation: { min: 0, max: 0, currency: 'INR' },
        suggestedAction: 'Recycle',
        hazardAlert: '⚠️ Swollen Li-ion cells contain pressurized gas. Do not puncture or discard in regular bins.',
        recyclingImpact: {
          co2OffsetKg: 8.5,
          materials: ['Lithium 80g', 'Cobalt 65g', 'Nickel 140g']
        }
      }
    }

    if (isLaptop) {
      return {
        detectedBrand: 'Dell',
        detectedModel: 'Inspiron 15 (Series 3000)',
        detectedCategory: 'Laptop',
        confidence: 94,
        condition: 'Good',
        estimatedValuation: { min: 4500, max: 8000, currency: 'INR' },
        suggestedAction: 'Sell',
        recyclingImpact: {
          co2OffsetKg: 34.2,
          materials: ['Copper 220g', 'Aluminum 850g', 'Gold Pins 0.4g', 'ABS Plastic 1.2kg']
        }
      }
    }

    return {
      detectedBrand: 'Samsung',
      detectedModel: 'Galaxy A52 (6GB/128GB)',
      detectedCategory: 'Mobile',
      confidence: 98,
      condition: 'Good',
      estimatedValuation: { min: 5000, max: 7500, currency: 'INR' },
      suggestedAction: 'Sell',
      recyclingImpact: {
        co2OffsetKg: 18.4,
        materials: ['Gold 0.03g', 'Silver 0.35g', 'Copper 15g', 'Rare Earths 1.2g']
      }
    }
  },

  /**
   * Process interactive chat assistant message grounded in real application data.
   */
  async processAssistantQuery(options: ProcessQueryOptions): Promise<{
    message: AIMessage
    updatedState: AIConversationState
  }> {
    // Artificial small delay for natural conversational feel
    await new Promise(r => setTimeout(r, 450))
    return GreenAiEngine.processMessage(options)
  },

  /**
   * Exposes raw tools directly for programmatic use.
   */
  tools: aiTools
}
