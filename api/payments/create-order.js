export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { amount, currency = 'INR', purchaseId, postTitle } = payload;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase amount.',
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Live Razorpay Gateway
    if (keyId && keySecret && !keyId.includes('YOUR_KEY')) {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const orderPayload = {
        amount: Math.round(Number(amount) * 100), // paise
        currency,
        receipt: purchaseId || `rcpt_${Date.now()}`,
        notes: {
          platform: 'Green Loop Marketplace',
          purchaseId: purchaseId || 'GL-PURCHASE',
          postTitle: postTitle || 'E-Waste Item',
        },
      };

      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[Razorpay Order Error]:', errText);
        return res.status(502).json({
          success: false,
          message: 'Could not create order with payment gateway.',
          details: errText,
        });
      }

      const order = await response.json();
      return res.status(200).json({ success: true, order });
    }

    // Direct platform order fallback (e.g. UPI / Escrow in Test Mode)
    const simulatedOrder = {
      id: `order_gl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      entity: 'order',
      amount: Math.round(Number(amount) * 100),
      amount_paid: 0,
      amount_due: Math.round(Number(amount) * 100),
      currency: currency || 'INR',
      receipt: purchaseId || `rcpt_${Date.now()}`,
      status: 'created',
      attempts: 0,
      notes: {
        platform: 'Green Loop Circular Marketplace',
        simulated: true,
      },
      created_at: Math.floor(Date.now() / 1000),
    };

    return res.status(200).json({
      success: true,
      order: simulatedOrder,
      simulated: true,
    });
  } catch (error) {
    console.error('[Payment Create Order Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment service error',
    });
  }
}
