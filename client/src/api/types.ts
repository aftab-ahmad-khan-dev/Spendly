export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  date: string;
  note: string | null;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  amount: number;
  period: "monthly";
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface Alert {
  id: string;
  type: "near_limit" | "exceeded" | "unusual";
  title: string;
  message: string;
  severity: "info" | "warning" | "danger";
  isRead: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  totalThisMonth: number;
  totalLastMonth: number;
  totalToday: number;
  expenseCountThisMonth: number;
  topCategories: {
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    total: number;
  }[];
  dailySpend: { date: string; total: number }[];
  recentExpenses: Expense[];
  unreadAlertCount: number;
}

export interface AiParseResult {
  success: boolean;
  message: string;
  kind?: "budget";
  expense?: Expense;
  budget?: {
    id: string;
    categoryId: string | null;
    categoryName: string | null;
    amount: number;
    period: "monthly";
  };
}

export interface AiAdvisorResult {
  success: boolean;
  answer: string;
}
