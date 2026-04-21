import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "./client";
import {
  Category,
  Expense,
  Budget,
  Alert,
  DashboardSummary,
  AiParseResult,
  AiAdvisorResult,
} from "./types";

export const qk = {
  categories: ["categories"] as const,
  expenses: (params?: { categoryId?: string; from?: string; to?: string }) =>
    ["expenses", params ?? null] as const,
  budgets: ["budgets"] as const,
  alerts: ["alerts"] as const,
  dashboard: ["dashboard", "summary"] as const,
};

export const useCategories = () =>
  useQuery({
    queryKey: qk.categories,
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; icon?: string; color?: string }) =>
      (await api.post<Category>("/categories", data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) =>
      (await api.patch<Category>(`/categories/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categories });
      qc.invalidateQueries({ queryKey: qk.budgets });
    },
  });
};

export const useExpenses = (params?: { categoryId?: string; from?: string; to?: string }) =>
  useQuery({
    queryKey: qk.expenses(params),
    queryFn: async () => (await api.get<Expense[]>("/expenses", { params })).data,
  });

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      categoryId: string;
      date: string;
      note?: string | null;
    }) => (await api.post<Expense>("/expenses", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: qk.dashboard });
      qc.invalidateQueries({ queryKey: qk.budgets });
      qc.invalidateQueries({ queryKey: qk.alerts });
    },
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: qk.dashboard });
      qc.invalidateQueries({ queryKey: qk.budgets });
    },
  });
};

export const useBudgets = () =>
  useQuery({
    queryKey: qk.budgets,
    queryFn: async () => (await api.get<Budget[]>("/budgets")).data,
  });

export const useUpsertBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      categoryId: string | null;
      amount: number;
      period: "monthly";
    }) => (await api.post<Budget>("/budgets", data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.budgets });
      qc.invalidateQueries({ queryKey: qk.dashboard });
      qc.invalidateQueries({ queryKey: qk.alerts });
    },
  });
};

export const useDeleteBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/budgets/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.budgets }),
  });
};

export const useAlerts = () =>
  useQuery({
    queryKey: qk.alerts,
    queryFn: async () => (await api.get<Alert[]>("/alerts")).data,
  });

export const useMarkAlertRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post<Alert>(`/alerts/${id}/read`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.alerts });
      qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post<{ ok: true }>(`/alerts/read-all`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.alerts });
      qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
};

export const useDashboardSummary = () =>
  useQuery({
    queryKey: qk.dashboard,
    queryFn: async () => (await api.get<DashboardSummary>("/dashboard/summary")).data,
  });

export const useAiParseExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) =>
      (await api.post<AiParseResult>("/ai/parse-expense", { text })).data,
    onSuccess: (data) => {
      if (data.success) {
        qc.invalidateQueries({ queryKey: ["expenses"] });
        qc.invalidateQueries({ queryKey: qk.dashboard });
        qc.invalidateQueries({ queryKey: qk.budgets });
        qc.invalidateQueries({ queryKey: qk.alerts });
      }
    },
  });
};

export const useAiAdvisor = () =>
  useMutation({
    mutationFn: async (question: string) =>
      (await api.post<AiAdvisorResult>("/ai/advisor", { question })).data,
  });
