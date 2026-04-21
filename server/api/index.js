import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';

// Warm-start cache so concurrent invocations share one Mongoose connection.
let readiness = null;

const ensureReady = () => {
  if (!readiness) {
    readiness = connectDB().catch((err) => {
      readiness = null;
      throw err;
    });
  }
  return readiness;
};

export default async function handler(req, res) {
  try {
    await ensureReady();
  } catch (err) {
    logger.error('DB connection failed in serverless handler', err);
    res.status(503).json({ error: 'Database unavailable' });
    return;
  }
  return app(req, res);
}
