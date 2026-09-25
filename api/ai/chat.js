import dns from 'dns'

try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

const CHAT_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your deployment environment variables.' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { message, history = [], context = {}, language = 'en' } = payload;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    const systemInstruction = `You are Green Loop AI, a helpful, circular economy assistant for electronic waste, gadget diagnostics, and certified recycling in India.
Current User Context: Role: ${context.role || 'Citizen'}, City: ${context.userCity || 'Coimbatore'}. Language: ${language}.
Focus on:
1. Battery safety: If a user mentions swollen, leaking, or smoking batteries, immediately warn them NOT to plug in, handle with gloves, keep isolated in non-flammable container, and route to certified recycler.
2. Fair valuation in INR (₹).
3. Reuse and repair before discarding.
Keep responses concise, clear, and actionable.`;

    const contents = [];
    if (Array.isArray(history)) {
      history.slice(-6).forEach(h => {
        const role = h.role === 'model' || h.role === 'assistant' ? 'model' : 'user';
        const text = h.text || h.content || h.message || '';
        if (text) contents.push({ role, parts: [{ text }] });
      });
    }
    contents.push({ role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }] });

    let replyText = '';
    let modelUsed = '';
    let lastErr = null;

    for (const model of CHAT_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        });

        if (resp.ok) {
          const data = await resp.json();
          replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (replyText) {
            modelUsed = model;
            break;
          }
        }
      } catch (err) {
        lastErr = err;
      }
    }

    if (!replyText) {
      replyText = "Green Loop AI is here to help with your e-waste! For urgent battery swelling or hazards, keep the device in a cool, dry, non-flammable area and visit the nearest recycling center under our Map tab.";
    }

    const isHazard = message.toLowerCase().includes('swoll') || message.toLowerCase().includes('leak') || message.toLowerCase().includes('smoke');

    return res.status(200).json({
      success: true,
      data: {
        text: replyText,
        hazardAlert: isHazard ? 'Hazard detected: Please handle with care and keep isolated.' : undefined,
        modelUsed
      }
    });
  } catch (error) {
    console.error('[AI Chat Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'AI Chat service error'
    });
  }
}
