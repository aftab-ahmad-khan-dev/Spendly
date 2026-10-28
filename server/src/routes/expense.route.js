import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expense.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(listExpenses));
router.post('/', asyncHandler(createExpense));
router.patch('/:id', asyncHandler(updateExpense));
router.delete('/:id', asyncHandler(deleteExpense));

export default router;
