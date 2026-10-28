import { z } from 'zod';
import { Expense } from '../models/expense.model.js';
import { Category } from '../models/category.model.js';
import { ApiError } from '../utils/ApiError.js';
import {
  checkBudgetsAndCreateAlerts,
  checkUnusualExpense,
} from '../services/budget.service.js';

const createSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(200).nullable().optional(),
});

const updateSchema = createSchema.partial();

const shape = (e, c) => ({
  id: e._id.toString(),
  amount: e.amount,
  categoryId: e.categoryId.toString(),
  categoryName: c?.name || null,
  categoryIcon: c?.icon || null,
  categoryColor: c?.color || null,
  date: e.date,
  note: e.note,
  createdAt: e.createdAt,
});

export const listExpenses = async (req, res) => {
  const { categoryId, from, to } = req.query;
  const match = { userId: req.userId };
  if (categoryId) match.categoryId = categoryId;
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = String(from).slice(0, 10);
    if (to) match.date.$lte = String(to).slice(0, 10);
  }

  const rows = await Expense.find(match).sort({ date: -1, createdAt: -1 }).lean();
  const cats = await Category.find({ userId: req.userId }).lean();
  const catMap = new Map(cats.map((c) => [c._id.toString(), c]));

  res.json(
    rows.map((e) =>
      shape(
        { ...e, _id: e._id, createdAt: e.createdAt },
        catMap.get(e.categoryId.toString())
      )
    )
  );
};

export const createExpense = async (req, res) => {
  const body = createSchema.parse(req.body);

  const cat = await Category.findOne({ _id: body.categoryId, userId: req.userId });
  if (!cat) throw new ApiError(400, 'Invalid categoryId');

  const doc = await Expense.create({
    userId: req.userId,
    amount: body.amount,
    categoryId: cat._id,
    date: body.date,
    note: body.note ?? null,
  });

  await checkUnusualExpense({
    userId: req.userId,
    expenseId: doc._id,
    amount: doc.amount,
    categoryId: doc.categoryId,
  });
  await checkBudgetsAndCreateAlerts(req.userId);

  res.status(201).json(shape(doc, cat));
};

export const updateExpense = async (req, res) => {
  const body = updateSchema.parse(req.body);
  const doc = await Expense.findOne({ _id: req.params.id, userId: req.userId });
  if (!doc) throw new ApiError(404, 'Expense not found');

  if (body.categoryId) {
    const cat = await Category.findOne({ _id: body.categoryId, userId: req.userId });
    if (!cat) throw new ApiError(400, 'Invalid categoryId');
    doc.categoryId = cat._id;
  }
  if (body.amount !== undefined) doc.amount = body.amount;
  if (body.date) doc.date = body.date;
  if (body.note !== undefined) doc.note = body.note;

  await doc.save();
  await checkBudgetsAndCreateAlerts(req.userId);

  const cat = await Category.findById(doc.categoryId);
  res.json(shape(doc, cat));
};

export const deleteExpense = async (req, res) => {
  const out = await Expense.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!out) throw new ApiError(404, 'Expense not found');
  res.status(204).end();
};
