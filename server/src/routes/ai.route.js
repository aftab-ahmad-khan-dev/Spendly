import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseExpense, askAdvisor } from '../controllers/ai.controller.js';
import { createRequire } from 'module';
import { createRequire } from 'module';

var require = createRequire(import.meta.url);
var module = { exports: {} };

const require = createRequire(import.meta.url);

const router = Router();
router.use(requireAuth);

router.post('/parse-expense', asyncHandler(parseExpense));
router.post('/advisor', asyncHandler(askAdvisor));

export default router;
