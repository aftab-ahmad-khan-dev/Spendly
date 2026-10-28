import { z } from 'zod';
import { Budget } from '../models/budget.model.js';
import { Category } from '../models/category.model.js';
import { ApiError } from '../utils/ApiError.js';
import {
  sumExpensesInRange,
  checkBudgetsAndCreateAlerts,
} from '../services/budget.service.js';
import { startOfMonth, endOfMonth } from '../utils/dates.js';

const upsertSchema = z.object({
  categoryId: z.string().nullable().optional(),
  amount: z.number().positive(),
  period: z.enum(['monthly']).default('monthly'),
});

async function shapeWithUsage(userId, budget, catMap) {
  const { total: spent } = await sumExpensesInRange({
    userId,
    start: startOfMonth(),
    end: endOfMonth(),
    categoryId: budget.categoryId || null,
  });
  const limit = budget.amount;
  const remaining = Math.max(0, limit - spent);
  const percentUsed = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const cat = budget.categoryId ? catMap?.get(budget.categoryId.toString()) : null;
  return {
    id: budget._id.toString(),
    categoryId: budget.categoryId ? budget.categoryId.toString() : null,
    categoryName: cat?.name ?? null,
    categoryIcon: cat?.icon ?? null,
    categoryColor: cat?.color ?? null,
    amount: limit,
    period: budget.period,
    spent,
    remaining,
    percentUsed,
  };
}

export const listBudgets = async (req, res) => {
  const rows = await Budget.find({ userId: req.userId });
  const cats = await Category.find({ userId: req.userId });
  const catMap = new Map(cats.map((c) => [c._id.toString(), c]));
  const out = await Promise.all(rows.map((b) => shapeWithUsage(req.userId, b, catMap)));
  res.json(out);
};

export const upsertBudget = async (req, res) => {
  const body = upsertSchema.parse(req.body);
  const categoryId = body.categoryId || null;

  if (categoryId) {
    const exists = await Category.exists({ _id: categoryId, userId: req.userId });
    if (!exists) throw new ApiError(400, 'Invalid categoryId');
  }

  const query = { userId: req.userId, categoryId };
  const doc = await Budget.findOneAndUpdate(
    query,
    { $set: { amount: body.amount, period: body.period } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await checkBudgetsAndCreateAlerts(req.userId);

  const cats = await Category.find({ userId: req.userId });
  const catMap = new Map(cats.map((c) => [c._id.toString(), c]));
  res.json(await shapeWithUsage(req.userId, doc, catMap));
};

export const deleteBudget = async (req, res) => {
  const out = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!out) throw new ApiError(404, 'Budget not found');
  res.status(204).end();
};
