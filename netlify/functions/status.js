export const handler = async () => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  }

  const isConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0)

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      service: 'Green Loop Gemini AI Analysis Service (Netlify Serverless)',
      status: isConfigured ? 'ready' : 'missing_gemini_api_key',
      configured: isConfigured,
      modelStrategy: [
        'gemini-3.5-flash-lite',
        'gemini-3.6-flash',
        'gemini-flash-latest',
        'gemini-3.7-flash'
      ],
      notice: isConfigured
        ? 'Gemini API key is configured in Netlify environment.'
        : 'GEMINI_API_KEY is not configured in Netlify environment variables.'
    })
  }
}

export default handler
