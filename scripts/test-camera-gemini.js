import fs from 'fs'
import path from 'path'
import { GeminiService } from '../backend/src/services/geminiService.js'

console.log('===============================================================')
console.log('CAMERA ACCESS & GEMINI OBJECT RECOGNITION VERIFICATION SUITE')
console.log('===============================================================\n')

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`)
    passed++
  } else {
    console.error(`  [FAIL] ${message}`)
    failed++
  }
}

// --- 1. Permissions-Policy Audit ---
console.log('--- 1. PERMISSIONS-POLICY HEADERS AUDIT ---')
const filesWithPolicy = [
  'backend/src/server.js',
  'frontend/netlify.toml',
  'netlify.toml',
  'frontend/vercel.json',
  'vercel.json',
  'frontend/public/_headers'
]

for (const file of filesWithPolicy) {
  const content = fs.readFileSync(file, 'utf-8')
  const hasCameraDisabled = content.includes('camera=()')
  const hasCameraAllowed = content.includes('camera=(self)')
  assert(!hasCameraDisabled && hasCameraAllowed, `${file} allows camera with Permissions-Policy: camera=(self)`)
}

// --- 2. Camera Access Code Resilience Audit ---
console.log('\n--- 2. CAMERA COMPONENT ERROR RESILIENCE & SHUTTER FALLBACKS ---')
const liveCameraCode = fs.readFileSync('frontend/src/pages/post/components/Camera/LiveCameraView.tsx', 'utf-8')
assert(liveCameraCode.includes('window.isSecureContext'), 'LiveCameraView checks window.isSecureContext before WebRTC call')
assert(liveCameraCode.includes('navigator.mediaDevices.getUserMedia'), 'LiveCameraView validates navigator.mediaDevices')
assert(liveCameraCode.includes('OverconstrainedError'), 'LiveCameraView includes fallback for OverconstrainedError')
assert(liveCameraCode.includes('capture="environment"'), 'LiveCameraView includes native mobile camera shutter button')

const shopCameraCode = fs.readFileSync('frontend/src/pages/shop/LocalShopPostPage.tsx', 'utf-8')
assert(shopCameraCode.includes('window.isSecureContext'), 'LocalShopPostPage checks window.isSecureContext')
assert(shopCameraCode.includes('OverconstrainedError'), 'LocalShopPostPage includes fallback for OverconstrainedError')
assert(shopCameraCode.includes('capture="environment"'), 'LocalShopPostPage includes native mobile camera shutter button')

// --- 3. Gemini API Key & Recognition Test ---
console.log('\n--- 3. GEMINI API KEY & MULTIMODAL OBJECT RECOGNITION ---')
const backendEnv = fs.readFileSync('backend/.env', 'utf-8')
const hasGeminiKey = /GEMINI_API_KEY=.+/.test(backendEnv)
assert(hasGeminiKey, 'backend/.env configured with non-empty GEMINI_API_KEY')

// Test 1x1 green test image with device description
const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

try {
  const result = await GeminiService.analyzeProduct({
    image: testImage,
    description: 'Cracked Samsung Galaxy S21 mobile phone with swollen back cover'
  })

  assert(result && typeof result === 'object', 'Gemini API call succeeded and returned structured response')
  assert(Boolean(result.product_name && result.category), `Identified: ${result.product_name} (${result.category})`)
  assert(result.hazard_level === 'CRITICAL' || result.condition.includes('Swoll') || result.suggested_action === 'Recycle', `Hazard detected: ${result.hazard_alert || result.condition}`)
  assert(result.confidence >= 0.7, `Confidence score reliable (${Math.round(result.confidence * 100)}%)`)
} catch (err) {
  assert(false, `GeminiService.analyzeProduct error: ${err.message}`)
}

console.log('\n===============================================================')
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`)
console.log('===============================================================\n')

if (failed > 0) process.exit(1)
