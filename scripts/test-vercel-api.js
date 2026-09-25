import healthHandler from '../api/health.js';
import statusHandler from '../api/ai/status.js';
import translateHandler from '../api/translate.js';
import createOrderHandler from '../api/payments/create-order.js';
import verifyPaymentHandler from '../api/payments/verify.js';

function createMockRes(label) {
  return {
    headers: {},
    statusCode: 200,
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(data) {
      console.log(`[PASS] ${label} (${this.statusCode}):`, JSON.stringify(data).slice(0, 120));
      return this;
    },
    end() {
      console.log(`[PASS] ${label} END (${this.statusCode})`);
      return this;
    }
  };
}

async function runTests() {
  console.log('--- Testing API Handlers ---');

  // 1. Health
  healthHandler({ method: 'GET' }, createMockRes('Health Check'));

  // 2. AI Status
  statusHandler({ method: 'GET' }, createMockRes('AI Status'));

  // 3. Payment Create Order
  await createOrderHandler({
    method: 'POST',
    body: { amount: 1500, currency: 'INR', purchaseId: 'GL-TEST-1', postTitle: 'Dell Laptop' }
  }, createMockRes('Payment Create Order'));

  // 4. Payment Verify
  await verifyPaymentHandler({
    method: 'POST',
    body: { razorpay_order_id: 'order_123', razorpay_payment_id: 'pay_123', simulated: true }
  }, createMockRes('Payment Verify'));

  // 5. Translate
  console.log('Calling translate handler...');
  await translateHandler({
    method: 'POST',
    body: { text: 'Dell Inspiron 15 in good condition', sourceLanguage: 'en', targetLanguage: 'ta' }
  }, createMockRes('Translate API'));
}

runTests().catch(console.error);
