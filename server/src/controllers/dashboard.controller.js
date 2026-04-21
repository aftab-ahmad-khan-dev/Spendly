import { Expense } from '../models/expense.model.js';
import { Category } from '../models/category.model.js';
import { Alert } from '../models/alert.model.js';
import {
  toISODate,
  startOfMonth,
  endOfMonth,
  startOfLastMonth,
  endOfLastMonth,
  subDays,
} from '../utils/dates.js';
import { sumExpensesInRange } from '../services/budget.service.js';

export const getSummary = async (req, res) => {
  const userId = req.userId;
  const now = new Date();

  const thisMonth = await sumExpensesInRange({
    userId,
    start: startOfMonth(now),
    end: endOfMonth(now),
  });
  const lastMonth = await sumExpensesInRange({
    userId,
    start: startOfLastMonth(now),
    end: endOfLastMonth(now),
  });

  const todayIso = toISODate(now);
  const todayRows = await Expense.aggregate([
    { $match: { userId, date: todayIso } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalToday = todayRows[0]?.total || 0;

  const startMonthIso = toISODate(startOfMonth(now));
  const endMonthIso = toISODate(endOfMonth(now));

  const topCatRows = await Expense.aggregate([
    { $match: { userId, date: { $gte: startMonthIso, $lte: endMonthIso } } },
    { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 5 },
  ]);

  const cats = await Category.find({
    _id: { $in: topCatRows.map((r) => r._id) },
    userId,
  });
  const catMap = new Map(cats.map((c) => [c._id.toString(), c]));
  const topCategories = topCatRows.map((r) => {
    const c = catMap.get(r._id.toString());
    return {
      categoryId: r._id.toString(),
      categoryName: c?.name || 'Unknown',
      categoryIcon: c?.icon || 'Tag',
      categoryColor: c?.color || '#64748b',
      total: r.total,
    };
  });

  const start30 = subDays(now, 29);
  const start30Iso = toISODate(start30);
  const dailyRows = await Expense.aggregate([
    { $match: { userId, date: { $gte: start30Iso, $lte: todayIso } } },
    { $group: { _id: '$date', total: { $sum: '$amount' } } },
  ]);
  const dailyMap = new Map(dailyRows.map((r) => [r._id, r.total]));
  const dailySpend = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(start30);
    d.setDate(start30.getDate() + i);
    const key = toISODate(d);
    dailySpend.push({ date: key, total: dailyMap.get(key) || 0 });
  }

  const recentDocs = await Expense.find({ userId })
    .sort({ date: -1, createdAt: -1 })
    .limit(6)
    .lean();
  const allCats = await Category.find({
    userId,
    _id: { $in: recentDocs.map((e) => e.categoryId) },
  });
  const allCatMap = new Map(allCats.map((c) => [c._id.toString(), c]));
  const recentExpenses = recentDocs.map((e) => {
    const c = allCatMap.get(e.categoryId.toString());
    return {
      id: e._id.toString(),
      amount: e.amount,
      categoryId: e.categoryId.toString(),
      categoryName: c?.name || 'Unknown',
      categoryIcon: c?.icon || 'Tag',
      categoryColor: c?.color || '#64748b',
      date: e.date,
      note: e.note,
      createdAt: e.createdAt,
    };
  });

  const unreadAlertCount = await Alert.countDocuments({ userId, isRead: false });

  res.json({
    totalThisMonth: thisMonth.total,
    totalLastMonth: lastMonth.total,
    totalToday,
    expenseCountThisMonth: thisMonth.count,
    topCategories,
    dailySpend,
    recentExpenses,
    unreadAlertCount,
  });
};
