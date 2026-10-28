import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    logger.error('Could not connect to MongoDB on startup', err);
  }
  app.listen(env.port, () => {
    logger.info(`Spendly API listening on http://localhost:${env.port}`);
  });
};

start();

process.on('unhandledRejection', (err) => logger.error('UnhandledRejection', err));
process.on('uncaughtException', (err) => logger.error('UncaughtException', err));
