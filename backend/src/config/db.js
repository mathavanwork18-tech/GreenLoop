import mongoose from 'mongoose';

/**
 * Connects to MongoDB Atlas using Mongoose.
 * Validates connection URI and provides actionable error messages.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables (.env).');
    process.exit(1);
  }

  if (uri.includes('<db_password>')) {
    console.warn('\n⚠️  WARNING: Your MONGODB_URI still contains "<db_password>" placeholder!');
    console.warn('👉 Please update backend/.env with your real MongoDB Atlas user password.\n');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    return conn;
  } catch (error) {
    console.error(`❌ Failed to connect to MongoDB Atlas: ${error.message}`);
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('👉 Tip: Check your username and password in backend/.env.');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('Server selection timed out')) {
      console.error('👉 Tip: In MongoDB Atlas, ensure Network Access allows your IP or 0.0.0.0/0 (Allow Access from Anywhere).');
    }
  }
}
