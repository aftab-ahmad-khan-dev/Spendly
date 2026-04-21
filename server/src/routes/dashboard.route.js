import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSummary } from '../controllers/dashboard.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', asyncHandler(getSummary));

export default router;
