import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import recyclingRoutes from './routes/recyclingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import translateRoutes from './routes/translateRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configured and default allowed origins for secure CORS
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const allAllowedOrigins = new Set([...allowedOrigins, ...defaultOrigins]);

// Security HTTP Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  res.removeHeader('X-Powered-By');
  next();
});

// Hardened CORS Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, server-to-server, curl)
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = allAllowedOrigins.has(origin);
    const isVercelOrNetlify = origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app');
    const isDevLocalhost = process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin);

    if (isExplicitlyAllowed || isVercelOrNetlify || isDevLocalhost) {
      return callback(null, true);
    }

    return callback(new Error('CORS request blocked by Green Loop security policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(morgan('dev'));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Green Loop / EcoCircuit Backend API',
    database: 'Local In-Memory Store',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/recycling', recyclingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/translate', translateRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
  });
});

// Sanitized Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const isDev = process.env.NODE_ENV !== 'production';
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: isDev ? (err.message || 'Internal Server Error') : 'An unexpected internal server error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 EcoCircuit / Green Loop Backend running on http://localhost:${PORT}`);
  console.log(`📋 Health Check endpoint: http://localhost:${PORT}/api/health`);
  console.log(`⚡ In-Memory Data Store active\n`);
});
