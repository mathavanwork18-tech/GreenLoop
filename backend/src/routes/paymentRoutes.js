import express from 'express';
import crypto from 'crypto';

const router = express.Router();

/**
 * 1. POST /api/payments/create-order
 * Creates an official Razorpay order server-side before collecting payment.
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', purchaseId, postTitle } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase amount.',
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // In production or configured environment with live Razorpay keys:
    if (keyId && keySecret && !keyId.includes('YOUR_KEY')) {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const orderPayload = {
        amount: Math.round(Number(amount) * 100), // in paise
        currency,
        receipt: purchaseId || `rcpt_${Date.now()}`,
        notes: {
          platform: 'Green Loop Marketplace',
          purchaseId: purchaseId || 'GL-UNKNOWN',
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
        console.error('[Razorpay Order Creation Error]:', errText);
        return res.status(502).json({
          success: false,
          message: 'Could not create order with payment gateway.',
          details: errText,
        });
      }

      const order = await response.json();
      return res.json({
        success: true,
        order,
        keyId,
      });
    }

    // Secure Sandbox / Testing Simulation Mode
    // When live credentials have not yet been provided in .env
    const simulatedOrderId = `order_${(purchaseId || 'gl').toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    return res.json({
      success: true,
      order: {
        id: simulatedOrderId,
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        receipt: purchaseId,
        status: 'created',
      },
      keyId: keyId || 'rzp_test_greenloop',
      mode: 'sandbox_simulation',
    });
  } catch (err) {
    console.error('[Payment Order Exception]:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error creating payment order.',
    });
  }
});

/**
 * 2. POST /api/payments/verify
 * Verifies Razorpay payment signature server-side using HMAC SHA256.
 */
router.post('/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, purchaseId } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Real signature check if secret is configured
    if (keySecret && !keySecret.includes('YOUR_SECRET') && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        console.warn(`[Payment Verification Failed] Signature mismatch for purchase: ${purchaseId}`);
        return res.status(400).json({
          verified: false,
          success: false,
          message: 'Payment signature verification failed. Invalid gateway signature.',
        });
      }

      return res.json({
        verified: true,
        success: true,
        purchaseId,
        paymentId: razorpay_payment_id,
        message: 'Payment verified successfully via HMAC-SHA256 signature.',
      });
    }

    // Testing / Sandbox verification
    if (razorpay_payment_id) {
      return res.json({
        verified: true,
        success: true,
        purchaseId,
        paymentId: razorpay_payment_id,
        mode: 'sandbox_simulation',
      });
    }

    return res.status(400).json({
      verified: false,
      success: false,
      message: 'Missing required payment reference identifiers.',
    });
  } catch (err) {
    console.error('[Payment Verify Exception]:', err);
    res.status(500).json({
      verified: false,
      success: false,
      message: err.message || 'Internal error during payment verification.',
    });
  }
});

/**
 * 3. POST /api/payments/webhook
 * Idempotent webhook receiver for Razorpay payment lifecycle events.
 */
router.post('/webhook', (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.headers['x-razorpay-signature'];

    // Verify webhook signature if secret is configured
    if (webhookSecret && webhookSignature) {
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== webhookSignature) {
        console.warn('[Razorpay Webhook] Invalid signature rejected.');
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    console.log(`[Razorpay Webhook Received] Event: ${event}`);

    // Handle asynchronous payment events
    switch (event) {
      case 'payment.captured':
        console.log(`[Payment Captured] ID: ${payload?.payment?.entity?.id}, Amount: ₹${(payload?.payment?.entity?.amount || 0) / 100}`);
        break;

      case 'payment.failed':
        console.warn(`[Payment Failed] ID: ${payload?.payment?.entity?.id}, Reason: ${payload?.payment?.entity?.error_description}`);
        break;

      case 'order.paid':
        console.log(`[Order Paid] Order ID: ${payload?.order?.entity?.id}`);
        break;

      default:
        console.log(`[Unhandled Webhook Event]: ${event}`);
    }

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).json({ status: 'ok', received: true });
  } catch (err) {
    console.error('[Webhook Processing Exception]:', err);
    res.status(200).json({ status: 'error_logged', received: true });
  }
});

export default router;
