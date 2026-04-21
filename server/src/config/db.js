import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Cached across lambda invocations on the same warm container.
// In plain Node dev this just means "connect once per process".
const cache = globalThis.__spendlyMongo || (globalThis.__spendlyMongo = { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    mongoose.set('strictQuery', true);
    cache.promise = mongoose
      .connect(env.mongoUri, {
        serverSelectionTimeoutMS: 15000,
        bufferCommands: false,
      })
      .then((m) => {
        logger.info(`MongoDB connected: ${m.connection.host}/${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        cache.promise = null;
        logger.error('MongoDB connection failed', err);
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

mongoose.connection.on('disconnected', () => {
  cache.conn = null;
  cache.promise = null;
  logger.warn('MongoDB disconnected');
});
