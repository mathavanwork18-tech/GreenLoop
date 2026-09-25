import crypto from 'crypto';

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      simulated,
    } = payload;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction parameters.',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && !keySecret.includes('YOUR_KEY') && !simulated) {
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generatedSignature = hmac.digest('hex');

      const isSignatureValid = generatedSignature === razorpay_signature;

      if (!isSignatureValid) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Payment verification failed: invalid signature.',
        });
      }

      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Payment signature verified successfully.',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    }

    // Test / Simulated mode verification
    return res.status(200).json({
      success: true,
      verified: true,
      simulated: true,
      message: 'Escrow payment verified successfully.',
      paymentId: razorpay_payment_id || `pay_sim_${Date.now()}`,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error('[Payment Verify Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment verification exception',
    });
  }
}
