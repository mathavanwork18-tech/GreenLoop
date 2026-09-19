import { createRequire } from 'module';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory first, then root directory
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const require = createRequire(import.meta.url);
const { Vonage } = require('@vonage/server-sdk');

// Validate presence of credentials without exposing secrets
const apiKey = process.env.VONAGE_API_KEY;
const apiSecret = process.env.VONAGE_API_SECRET;
const to = process.env.VONAGE_TEST_TO;
const from = process.env.VONAGE_SENDER_ID || 'GreenLoop';

if (!apiKey || !apiSecret || !to || apiKey === 'YOUR_API_KEY' || apiSecret === 'YOUR_API_SECRET') {
  console.error('Vonage SMS test failed: Missing or unconfigured credentials.');
  console.error(JSON.stringify({
    status: 'CONFIG_MISSING',
    hasApiKey: Boolean(apiKey && apiKey !== 'YOUR_API_KEY'),
    hasApiSecret: Boolean(apiSecret && apiSecret !== 'YOUR_API_SECRET'),
    hasTestTo: Boolean(to && to !== 'YOUR_TEST_PHONE_NUMBER'),
    senderId: from,
  }, null, 2));
  console.error('Please configure VONAGE_API_KEY, VONAGE_API_SECRET, and VONAGE_TEST_TO in backend/.env');
  process.exitCode = 1;
} else {
  const vonage = new Vonage({
    apiKey: apiKey,
    apiSecret: apiSecret,
  });

  vonage.sms
    .send({
      to: to,
      from: from,
      text: 'Green Loop Vonage SMS test',
    })
    .then((response) => {
      console.log('Vonage SMS request completed.');
      console.log(JSON.stringify(response, null, 2));
    })
    .catch((error) => {
      console.error('Vonage SMS test failed.');
      console.error(error.message || error);
      process.exitCode = 1;
    });
}
