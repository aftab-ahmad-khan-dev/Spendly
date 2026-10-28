import { User } from '../models/user.model.js';
import { Category } from '../models/category.model.js';

const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: 'Utensils', color: '#f59e0b' },
  { name: 'Groceries', icon: 'ShoppingCart', color: '#10b981' },
  { name: 'Transport', icon: 'Car', color: '#3b82f6' },
  { name: 'Rent', icon: 'Home', color: '#8b5cf6' },
  { name: 'Utilities', icon: 'Zap', color: '#06b6d4' },
  { name: 'Entertainment', icon: 'Film', color: '#ec4899' },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#ef4444' },
  { name: 'Health', icon: 'Heart', color: '#14b8a6' },
  { name: 'Travel', icon: 'Plane', color: '#0ea5e9' },
  { name: 'Education', icon: 'GraduationCap', color: '#6366f1' },
  { name: 'Other', icon: 'Tag', color: '#64748b' },
];

export async function seedUserIfNeeded(clerkId) {
  const user = await User.findOne({ clerkId });
  if (user?.initialized) return user;

  if (!user) await User.create({ clerkId, initialized: false });

  const existing = await Category.countDocuments({ userId: clerkId });
  if (existing === 0) {
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: clerkId, isCustom: false })),
      { ordered: false }
    ).catch(() => { /* ignore dup key */ });
  }

  await User.updateOne({ clerkId }, { $set: { initialized: true } });
  return User.findOne({ clerkId });
}
