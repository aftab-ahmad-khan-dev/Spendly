import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listBudgets,
  upsertBudget,
  deleteBudget,
} from '../controllers/budget.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(listBudgets));
router.post('/', asyncHandler(upsertBudget));
router.delete('/:id', asyncHandler(deleteBudget));

export default router;
