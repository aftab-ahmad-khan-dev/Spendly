import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCategories, useExpenses, useDeleteExpense } from "@/api/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import { getCategoryIcon } from "@/lib/categoryIcon";
import { useToast } from "@/hooks/use-toast";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";

export default function Expenses() {
  const [filter, setFilter] = useState<string>("all");
  const cats = useCategories();
  const { data, isLoading } = useExpenses(
    filter === "all" ? undefined : { categoryId: filter }
  );
  const { toast } = useToast();
  const del = useDeleteExpense();

  const total = useMemo(
    () => (data ?? []).reduce((s, e) => s + e.amount, 0),
    [data]
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Ledger
          </p>
          <h1 className="serif mt-1 text-[32px] leading-[1.1] text-foreground">Expenses</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            <span className="tabular">{(data ?? []).length}</span> entries ·{" "}
            <span className="tabular">{formatCurrency(total)}</span> in view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {cats.data?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AddExpenseDialog />
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No expenses match this filter.
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {data.map((e) => {
              const Icon = getCategoryIcon(e.categoryIcon);
              return (
                <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                      style={{
                        backgroundColor: `${e.categoryColor}1a`,
                        color: e.categoryColor || undefined,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-medium text-foreground">
                        {e.categoryName}
                        {e.note ? (
                          <span className="ml-2 font-normal text-muted-foreground">
                            · {e.note}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground">
                        {formatDate(e.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="tabular text-[14px] font-semibold text-foreground">
                      {formatCurrency(e.amount)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        del.mutate(e.id, {
                          onSuccess: () => toast({ title: "Expense removed" }),
                        })
                      }
                      aria-label="Delete expense"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
