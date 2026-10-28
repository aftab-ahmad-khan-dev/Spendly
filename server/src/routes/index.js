import { Router } from 'express';
import categoryRoutes from './category.route.js';
import expenseRoutes from './expense.route.js';
import budgetRoutes from './budget.route.js';
import alertRoutes from './alert.route.js';
import dashboardRoutes from './dashboard.route.js';
import aiRoutes from './ai.route.js';

const router = Router();

router.use('/categories', categoryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/budgets', budgetRoutes);
router.use('/alerts', alertRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);

export default router;
