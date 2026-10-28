import { AlertTriangle, AlertCircle, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts, useMarkAlertRead, useMarkAllRead } from "@/api/hooks";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const SEVERITY: Record<
  string,
  { Icon: typeof AlertCircle; bg: string; fg: string; ring: string }
> = {
  danger: { Icon: AlertCircle, bg: "bg-rose-50", fg: "text-rose-600", ring: "ring-rose-200" },
  warning: {
    Icon: AlertTriangle,
    bg: "bg-amber-50",
    fg: "text-amber-600",
    ring: "ring-amber-200",
  },
  info: { Icon: Info, bg: "bg-sky-50", fg: "text-sky-600", ring: "ring-sky-200" },
};

export default function Alerts() {
  const { data, isLoading } = useAlerts();
  const mark = useMarkAlertRead();
  const markAll = useMarkAllRead();

  const unread = (data ?? []).filter((a) => !a.isRead).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Signals
          </p>
          <h1 className="serif mt-1 text-[32px] leading-[1.1] text-foreground">Alerts</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We notify you when budgets are near or over, and when spending looks unusual.
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <Check className="mr-1 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">All clear. No alerts right now.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {data.map((a) => {
            const sev = SEVERITY[a.severity] ?? SEVERITY.info;
            return (
              <li
                key={a.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors",
                  a.isRead ? "border-border/70 opacity-70" : "border-border"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1",
                    sev.bg,
                    sev.fg,
                    sev.ring
                  )}
                >
                  <sev.Icon className="h-4.5 w-4.5" />
                </span>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-foreground">{a.title}</div>
                  <div className="text-[13px] text-muted-foreground">{a.message}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground/80">
                    {formatDate(a.createdAt)}
                  </div>
                </div>
                {!a.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => mark.mutate(a.id)}
                    className="text-xs"
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Mark read
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
