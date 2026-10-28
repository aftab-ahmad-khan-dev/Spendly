import { getAuth } from '@clerk/express';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { seedUserIfNeeded } from '../services/seed.service.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) throw new ApiError(401, 'Unauthorized');
  req.userId = userId;
  await seedUserIfNeeded(userId);
  next();
});
