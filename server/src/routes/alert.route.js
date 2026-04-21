import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listAlerts,
  markAlertRead,
  markAllRead,
} from '../controllers/alert.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(listAlerts));
router.post('/read-all', asyncHandler(markAllRead));
router.post('/:id/read', asyncHandler(markAlertRead));

export default router;
