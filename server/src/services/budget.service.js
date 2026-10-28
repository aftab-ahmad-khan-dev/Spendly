import { Budget } from '../models/budget.model.js';
import { Expense } from '../models/expense.model.js';
import { Category } from '../models/category.model.js';
import { Alert } from '../models/alert.model.js';
import { toISODate, startOfMonth, endOfMonth, monthKey } from '../utils/dates.js';

const createAlertIfNew = async (userId, dedupeKey, payload) => {
  const existing = await Alert.findOne({ userId, dedupeKey });
  if (existing) return;
  await Alert.create({ userId, dedupeKey, ...payload });
};

export async function sumExpensesInRange({ userId, start, end, categoryId = null }) {
  const match = {
    userId,
    date: { $gte: toISODate(start), $lte: toISODate(end) },
  };
  if (categoryId) match.categoryId = categoryId;
  const rows = await Expense.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  return { total: rows[0]?.total || 0, count: rows[0]?.count || 0 };
}

export async function checkBudgetsAndCreateAlerts(userId) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const mk = monthKey(now);

  const budgets = await Budget.find({ userId });
  if (budgets.length === 0) return;

  const cats = await Category.find({ userId });
  const catMap = new Map(cats.map((c) => [c._id.toString(), c]));

  for (const b of budgets) {
    const { total: spent } = await sumExpensesInRange({
      userId,
      start,
      end,
      categoryId: b.categoryId || null,
    });
    const limit = b.amount;
    if (limit <= 0) continue;

    const pct = spent / limit;
    const scope = b.categoryId ? catMap.get(b.categoryId.toString())?.name || 'Category' : 'Overall';

    if (pct >= 1) {
      await createAlertIfNew(userId, `exceeded:${b._id}:${mk}`, {
        type: 'exceeded',
        severity: 'danger',
        title: `${scope} budget exceeded`,
        message: `You've spent ${spent.toFixed(2)} of your ${limit.toFixed(2)} ${scope.toLowerCase()} budget this month.`,
      });
    } else if (pct >= 0.8) {
      await createAlertIfNew(userId, `near:${b._id}:${mk}`, {
        type: 'near_limit',
        severity: 'warning',
        title: `${scope} budget nearly used`,
        message: `You've used ${Math.round(pct * 100)}% of your ${scope.toLowerCase()} budget this month.`,
      });
    }
  }
}

export async function checkUnusualExpense({ userId, expenseId, amount, categoryId }) {
  const rows = await Expense.aggregate([
    { $match: { userId, categoryId } },
    {
      $group: {
        _id: null,
        avg: { $avg: '$amount' },
        max: { $max: '$amount' },
      },
    },
  ]);
  const avg = rows[0]?.avg || 0;
  const max = rows[0]?.max || 0;
  if (avg <= 0) return;
  if (amount >= avg * 3 && amount > 100 && amount >= max * 0.9) {
    const cat = await Category.findById(categoryId);
    const name = cat?.name || 'this category';
    await createAlertIfNew(userId, `unusual:${expenseId}`, {
      type: 'unusual',
      severity: 'info',
      title: `Unusual ${name} expense`,
      message: `An expense of ${amount.toFixed(2)} is about ${(amount / avg).toFixed(1)}x your usual ${name} spend.`,
    });
  }
}
