import { useState } from "react";
import { Plus, Trash2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useCategories, useCreateCategory, useDeleteCategory } from "@/api/hooks";
import { getCategoryIcon, ICON_OPTIONS } from "@/lib/categoryIcon";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PALETTE = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
  "#64748b",
];

function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Tag");
  const [color, setColor] = useState(PALETTE[0]);
  const mut = useCreateCategory();
  const { toast } = useToast();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    mut.mutate(
      { name: name.trim(), icon, color },
      {
        onSuccess: () => {
          toast({ title: "Category added" });
          setOpen(false);
          setName("");
          setIcon("Tag");
          setColor(PALETTE[0]);
        },
        onError: (e: unknown) => {
          const msg = e instanceof Error ? e.message : "Please try again";
          toast({ title: "Couldn't save", description: msg, variant: "destructive" });
        },
      }
    );
  }

  const Preview = getCategoryIcon(icon);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> New category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a category</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Group your spending the way you actually think about it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-md"
              style={{ backgroundColor: `${color}22`, color }}
            >
              <Preview className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-medium text-foreground">
                {name || "Category name"}
              </div>
              <div className="text-[11.5px] text-muted-foreground">Preview</div>
            </div>
          </div>
          <div>
            <Label htmlFor="cat-name" className="text-xs">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              required
            />
          </div>
          <div>
            <Label className="text-xs">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {ICON_OPTIONS.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 flex items-center gap-1 text-xs">
              <Palette className="h-3 w-3" /> Color
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {PALETTE.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Pick ${c}`}
                  className={cn(
                    "h-7 w-7 rounded-md ring-offset-background transition",
                    color === c && "ring-2 ring-foreground ring-offset-2"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mut.isPending} className="w-full sm:w-auto">
              {mut.isPending ? "Saving…" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Categories() {
  const { data, isLoading } = useCategories();
  const del = useDeleteCategory();
  const { toast } = useToast();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Library
          </p>
          <h1 className="serif mt-1 text-[32px] leading-[1.1] text-foreground">
            Categories
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Organize the shape of your spending. Default categories are pre-loaded for you.
          </p>
        </div>
        <CreateCategoryDialog />
      </header>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No categories yet. Create your first one.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => {
            const Icon = getCategoryIcon(c.icon);
            return (
              <div
                key={c.id}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${c.color}1a`, color: c.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-medium text-foreground">
                      {c.name}
                    </div>
                    <div className="text-[11.5px] text-muted-foreground">
                      {c.isCustom ? "Custom" : "Default"}
                    </div>
                  </div>
                </div>
                {c.isCustom && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      del.mutate(c.id, {
                        onSuccess: () => toast({ title: "Category removed" }),
                        onError: (e: unknown) => {
                          const msg = e instanceof Error ? e.message : "Please try again";
                          toast({
                            title: "Couldn't delete",
                            description: msg,
                            variant: "destructive",
                          });
                        },
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
