export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
  const isConfigured = Boolean(apiKey && apiKey.length > 0);

  res.status(200).json({
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
      'gemini-2.0-flash'
    ],
  });
}
