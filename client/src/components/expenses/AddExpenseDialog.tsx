import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCreateExpense, useCategories } from "@/api/hooks";
import { todayIsoDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

export function AddExpenseDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayIsoDate());
  const [note, setNote] = useState("");
  const cats = useCategories();
  const { toast } = useToast();
  const mut = useCreateExpense();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(amount);
    if (!(num > 0) || !categoryId) return;
    mut.mutate(
      { amount: num, categoryId, date, note: note || null },
      {
        onSuccess: () => {
          toast({ title: "Expense recorded" });
          setOpen(false);
          setAmount("");
          setNote("");
          setDate(todayIsoDate());
        },
        onError: (e: unknown) => {
          const msg = e instanceof Error ? e.message : "Please try again";
          toast({ title: "Couldn't save", description: msg, variant: "destructive" });
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Record expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Record an expense</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter what you spent. You can also tell the assistant in plain language.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount" className="text-xs">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="tabular"
              />
            </div>
            <div>
              <Label htmlFor="date" className="text-xs">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {cats.data?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="note" className="text-xs">
              Note <span className="text-muted-foreground/70">(optional)</span>
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Lunch with Sara, office supplies…"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={mut.isPending || !amount || !categoryId}
              className="w-full sm:w-auto"
            >
              {mut.isPending ? "Saving…" : "Save expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
