import { z } from 'zod';
import { Category } from '../models/category.model.js';
import { Expense } from '../models/expense.model.js';
import { Budget } from '../models/budget.model.js';
import { ApiError } from '../utils/ApiError.js';

const createSchema = z.object({
  name: z.string().min(1).max(40),
  icon: z.string().optional(),
  color: z.string().regex(/^#?[0-9a-fA-F]{3,8}$/).optional(),
});

const updateSchema = createSchema.partial();

export const listCategories = async (req, res) => {
  const rows = await Category.find({ userId: req.userId }).sort({ name: 1 });
  res.json(rows);
};

export const createCategory = async (req, res) => {
  const body = createSchema.parse(req.body);
  const doc = await Category.create({
    userId: req.userId,
    name: body.name.trim(),
    icon: body.icon || 'Tag',
    color: body.color?.startsWith('#') ? body.color : `#${body.color || '4f46e5'}`,
    isCustom: true,
  });
  res.status(201).json(doc);
};

export const updateCategory = async (req, res) => {
  const body = updateSchema.parse(req.body);
  const doc = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: body },
    { new: true }
  );
  if (!doc) throw new ApiError(404, 'Category not found');
  res.json(doc);
};

export const deleteCategory = async (req, res) => {
  const id = req.params.id;
  const used = await Expense.exists({ userId: req.userId, categoryId: id });
  if (used) throw new ApiError(409, 'Category has expenses and cannot be deleted');

  await Budget.deleteMany({ userId: req.userId, categoryId: id });
  const result = await Category.findOneAndDelete({ _id: id, userId: req.userId });
  if (!result) throw new ApiError(404, 'Category not found');
  res.status(204).end();
};
