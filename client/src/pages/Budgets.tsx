import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBudgets,
  useCategories,
  useUpsertBudget,
  useDeleteBudget,
} from "@/api/hooks";
import { formatCurrency } from "@/lib/format";
import { getCategoryIcon } from "@/lib/categoryIcon";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function BudgetDialog() {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string>("__overall__");
  const [amount, setAmount] = useState("");
  const cats = useCategories();
  const mut = useUpsertBudget();
  const { toast } = useToast();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(amount);
    if (!(num > 0)) return;
    mut.mutate(
      {
        categoryId: categoryId === "__overall__" ? null : categoryId,
        amount: num,
        period: "monthly",
      },
      {
        onSuccess: () => {
          toast({ title: "Budget saved" });
          setOpen(false);
          setAmount("");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' className='gap-1'>
          <Plus className='h-4 w-4' /> Set budget
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Set a monthly budget</DialogTitle>
          <DialogDescription className='text-xs text-muted-foreground'>
            Limits are checked as you spend. Alerts kick in at 80% and 100%.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className='space-y-4'>
          <div>
            <Label className='text-xs'>Scope</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__overall__'>Overall all categories</SelectItem>
                {cats.data?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor='budget-amount' className='text-xs'>
              Monthly limit
            </Label>
            <Input
              id='budget-amount'
              type='number'
              step='0.01'
              min='0'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className='tabular'
            />
          </div>
          <DialogFooter>
            <Button
              type='submit'
              disabled={mut.isPending}
              className='w-full sm:w-auto'
            >
              {mut.isPending ? "Saving…" : "Save budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Budgets() {
  const { data, isLoading } = useBudgets();
  const del = useDeleteBudget();
  const { toast } = useToast();

  return (
    <div className='space-y-8'>
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>
            Limits
          </p>
          <h1 className='serif mt-1 text-[32px] leading-[1.1] text-foreground'>
            Budgets
          </h1>
          <p className='mt-1.5 text-sm text-muted-foreground'>
            Set a ceiling and we'll let you know when you're approaching it.
          </p>
        </div>
        <BudgetDialog />
      </header>

      {isLoading ? (
        <div className='grid gap-4 sm:grid-cols-2'>
          {[0, 1].map((i) => (
            <Skeleton key={i} className='h-36' />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className='rounded-xl border border-dashed border-border bg-card py-16 text-center'>
          <p className='text-sm text-muted-foreground'>
            No budgets yet. Set your first one.
          </p>
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2'>
          {data.map((b) => {
            const Icon = getCategoryIcon(b.categoryIcon);
            const overspent = b.percentUsed >= 100;
            const warn = b.percentUsed >= 80 && !overspent;
            const color = b.categoryColor || "hsl(var(--primary))";
            return (
              <div
                key={b.id}
                className={cn(
                  "rounded-xl border bg-card p-5 transition-colors",
                  overspent
                    ? "border-rose-200 bg-rose-50/40"
                    : warn
                      ? "border-amber-200 bg-amber-50/40"
                      : "border-border",
                )}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <span
                      className='flex h-10 w-10 items-center justify-center rounded-md'
                      style={{ backgroundColor: `${color}1a`, color }}
                    >
                      <Icon className='h-5 w-5' />
                    </span>
                    <div>
                      <div className='text-[14px] font-semibold text-foreground'>
                        {b.categoryName ?? "Overall"}
                      </div>
                      <div className='text-[11.5px] text-muted-foreground'>
                        Monthly
                      </div>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-muted-foreground hover:text-destructive'
                    onClick={() =>
                      del.mutate(b.id, {
                        onSuccess: () => toast({ title: "Budget removed" }),
                      })
                    }
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
                <div className='mt-4'>
                  <div className='flex items-baseline justify-between'>
                    <span className='tabular text-[24px] font-semibold text-foreground'>
                      {formatCurrency(b.spent)}
                    </span>
                    <span className='tabular text-[12px] text-muted-foreground'>
                      of {formatCurrency(b.amount)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, b.percentUsed)}
                    className='mt-2 h-1.5'
                  />
                  <div
                    className={cn(
                      "mt-2 text-[11.5px]",
                      overspent
                        ? "text-rose-600"
                        : warn
                          ? "text-amber-600"
                          : "text-muted-foreground",
                    )}
                  >
                    {overspent
                      ? `Over by ${formatCurrency(b.spent - b.amount)}`
                      : `${formatCurrency(b.remaining)} remaining · ${b.percentUsed}% used`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
