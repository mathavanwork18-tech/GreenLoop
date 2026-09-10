export const handler = async () => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      service: 'Green Loop Gemini AI Analysis Service (Netlify Serverless)',
      status: 'ready',
      modelStrategy: [
        'gemini-3.5-flash-lite',
        'gemini-flash-latest',
        'gemini-2.5-flash'
      ]
    })
  }
}

export default handler
