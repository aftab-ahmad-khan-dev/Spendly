import { z } from 'zod';
import { Category } from '../models/category.model.js';
import { Expense } from '../models/expense.model.js';
import { Budget } from '../models/budget.model.js';
import { chatCompletion } from '../services/groq.service.js';
import {
  checkBudgetsAndCreateAlerts,
  checkUnusualExpense,
} from '../services/budget.service.js';
import { toISODate, parseRelativeDate } from '../utils/dates.js';
import { logger } from '../utils/logger.js';

const parseSchema = z.object({
  text: z.string().min(1).max(500),
});

const advisorSchema = z.object({
  question: z.string().min(1).max(500),
});

// Deterministic intent detection — keyword heuristic is FAR more reliable than
// llama-3.3 for short finance commands. We only fall back to the LLM for
// ambiguous cases.
const BUDGET_RE = /\b(budget|budgets|limit|cap|set\s+(?:a\s+)?(?:limit|cap|budget)|allocate)\b/i;
const EXPENSE_RE =
  /\b(spent|spend|paid|pay|bought|buy|purchased|lunch|dinner|breakfast|coffee|tea|tip|grocer|uber|cab|fare|rent\s+\d|fuel|gas\s+\d|got|grabbed|ordered)\b/i;

const classifyIntent = (text) => {
  const t = text.trim();
  const budgetHit = BUDGET_RE.test(t);
  const expenseHit = EXPENSE_RE.test(t);

  if (budgetHit && !expenseHit) return 'budget';
  if (expenseHit && !budgetHit) return 'expense';
  if (budgetHit && expenseHit) return 'budget'; // "limit" is ambiguous — prefer budget
  return null; // let the LLM decide
};

const extract = async ({ text, categoryNames, forcedIntent }) => {
  const intentLine = forcedIntent
    ? `The user's intent is: "${forcedIntent}". Extract fields consistent with that intent.`
    : `Decide the intent yourself: "expense" (user spent money), "budget" (user wants to set/change a monthly limit), or "other".`;

  const system = `You extract finance fields from a short user message and return STRICT JSON.

Available categories (case-insensitive, pick the closest match): ${categoryNames.join(', ')}.

${intentLine}

Return ONLY this JSON, no prose:
{
  "intent": "expense" | "budget" | "other",
  "amount": number | null,
  "categoryName": string | null,
  "date": "YYYY-MM-DD" | "today" | "yesterday" | "tomorrow" | null,
  "note": string | null
}

Rules:
- amount: positive number, no symbols or commas. null if not stated.
- categoryName: one of the available categories if mentioned; null for an overall/all-category budget.
- date: for expenses only; null for budgets.
- note: short description for expenses; null for budgets.

Few-shot:
"spent 12 on coffee" -> {"intent":"expense","amount":12,"categoryName":"Food","date":"today","note":"coffee"}
"paid 850 for rent yesterday" -> {"intent":"expense","amount":850,"categoryName":"Rent","date":"yesterday","note":null}
"budget 500 for food" -> {"intent":"budget","amount":500,"categoryName":"Food","date":null,"note":null}
"set budget to 2000" -> {"intent":"budget","amount":2000,"categoryName":null,"date":null,"note":null}
"limit groceries to 300 a month" -> {"intent":"budget","amount":300,"categoryName":"Groceries","date":null,"note":null}
"how am I doing this month" -> {"intent":"other","amount":null,"categoryName":null,"date":null,"note":null}`;

  const raw = await chatCompletion({
    system,
    user: text,
    temperature: 0.1,
    json: true,
  });
  const obj = JSON.parse(raw || '{}');
  const intent = forcedIntent
    ? forcedIntent
    : ['expense', 'budget', 'other'].includes(obj.intent)
      ? obj.intent
      : 'other';
  return {
    intent,
    amount: typeof obj.amount === 'number' ? obj.amount : null,
    categoryName: typeof obj.categoryName === 'string' ? obj.categoryName : null,
    date: typeof obj.date === 'string' ? obj.date : null,
    note: typeof obj.note === 'string' ? obj.note : null,
  };
};

const resolveCategory = (cats, name) => {
  if (!name) return null;
  return cats.find((c) => c.name.toLowerCase() === name.toLowerCase()) || null;
};

const logExpense = async ({ userId, parsed, cats }) => {
  if (!parsed.amount || parsed.amount <= 0) {
    return {
      success: false,
      message:
        'I couldn\'t find an amount. Try "spent 25 on lunch today".',
    };
  }

  let category =
    resolveCategory(cats, parsed.categoryName) ||
    cats.find((c) => c.name === 'Other') ||
    cats[0];
  if (!category) {
    return {
      success: false,
      message: 'No categories available. Please refresh the page.',
    };
  }

  let date = toISODate(new Date());
  const resolved = parseRelativeDate(parsed.date);
  if (resolved) date = resolved;

  const doc = await Expense.create({
    userId,
    amount: parsed.amount,
    categoryId: category._id,
    date,
    note: parsed.note ?? null,
  });

  await checkUnusualExpense({
    userId,
    expenseId: doc._id,
    amount: doc.amount,
    categoryId: doc.categoryId,
  });
  await checkBudgetsAndCreateAlerts(userId);

  return {
    success: true,
    kind: 'expense',
    message: `Logged ${parsed.amount.toFixed(2)} under ${category.name}${
      date === toISODate(new Date()) ? ' for today' : ` on ${date}`
    }.`,
    expense: {
      id: doc._id.toString(),
      amount: doc.amount,
      categoryId: doc.categoryId.toString(),
      categoryName: category.name,
      categoryIcon: category.icon,
      categoryColor: category.color,
      date: doc.date,
      note: doc.note,
      createdAt: doc.createdAt,
    },
  };
};

const upsertBudgetFromAI = async ({ userId, parsed, cats }) => {
  if (!parsed.amount || parsed.amount <= 0) {
    return {
      success: false,
      message:
        'I couldn\'t find a budget amount. Try "budget 500 for food" or "set budget to 2000".',
    };
  }

  const category = resolveCategory(cats, parsed.categoryName);
  const categoryId = category?._id || null;
  const scope = category ? category.name : 'Overall';

  const doc = await Budget.findOneAndUpdate(
    { userId, categoryId },
    { $set: { amount: parsed.amount, period: 'monthly' } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await checkBudgetsAndCreateAlerts(userId);

  return {
    success: true,
    kind: 'budget',
    message: `${scope} monthly budget set to ${parsed.amount.toFixed(2)}.`,
    budget: {
      id: doc._id.toString(),
      categoryId: doc.categoryId ? doc.categoryId.toString() : null,
      categoryName: category?.name ?? null,
      amount: doc.amount,
      period: doc.period,
    },
  };
};

export const parseExpense = async (req, res) => {
  const { text } = parseSchema.parse(req.body);
  const userId = req.userId;

  const cats = await Category.find({ userId });
  const categoryNames = cats.map((c) => c.name);

  const forcedIntent = classifyIntent(text);

  let parsed;
  try {
    parsed = await extract({ text, categoryNames, forcedIntent });
  } catch (err) {
    logger.warn('AI extraction failed', err);
    return res.json({
      success: false,
      message: "I couldn't reach the AI service just now. Please try again.",
    });
  }

  logger.info(
    `AI intent: ${parsed.intent} (heuristic: ${forcedIntent || 'none'}) amount=${parsed.amount} cat=${parsed.categoryName} text="${text}"`
  );

  if (parsed.intent === 'budget') {
    return res.json(await upsertBudgetFromAI({ userId, parsed, cats }));
  }
  if (parsed.intent === 'expense') {
    return res.json(await logExpense({ userId, parsed, cats }));
  }
  return res.json({
    success: false,
    message:
      'I can log expenses ("spent 12 on coffee") or set budgets ("budget 500 for food"). For questions, switch to Ask mode.',
  });
};

export const askAdvisor = async (req, res) => {
  const { question } = advisorSchema.parse(req.body);
  const userId = req.userId;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const recent = await Expense.aggregate([
    { $match: { userId, date: { $gte: toISODate(start), $lte: toISODate(now) } } },
    { $group: { _id: '$categoryId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const cats = await Category.find({ userId });
  const catMap = new Map(cats.map((c) => [c._id.toString(), c]));

  const summary =
    recent
      .map(
        (r) =>
          `${catMap.get(r._id.toString())?.name || 'Other'}: ${r.total.toFixed(2)} (${r.count})`
      )
      .join('; ') || 'No expenses recorded this month.';

  const system = `You are a concise, practical personal-finance advisor inside an expense tracker.
- Keep answers under 80 words.
- Speak in plain language, no jargon, no bullet bloat.
- Give one actionable suggestion when relevant.
- Never invent numbers. Use only the summary provided.`;

  const user = `Month-to-date spending summary: ${summary}\n\nQuestion: ${question}`;

  try {
    const answer = await chatCompletion({ system, user, temperature: 0.3 });
    return res.json({ success: true, answer: answer.trim() });
  } catch {
    return res.json({
      success: false,
      answer: 'The assistant is unavailable right now. Please try again shortly.',
    });
  }
};
