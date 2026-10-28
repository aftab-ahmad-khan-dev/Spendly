import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const notFound = (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err?.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id' });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ error: 'Duplicate resource' });
  }
  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
};
