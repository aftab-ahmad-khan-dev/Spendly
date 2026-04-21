import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseExpense, askAdvisor } from '../controllers/ai.controller.js';

const router = Router();
router.use(requireAuth);

router.post('/parse-expense', asyncHandler(parseExpense));
router.post('/advisor', asyncHandler(askAdvisor));

export default router;
