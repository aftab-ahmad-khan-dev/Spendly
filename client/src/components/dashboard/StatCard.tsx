import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  deltaPct,
  spark,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | null;
  deltaPct?: string;
  spark?: number[];
  accent?: boolean;
}) {
  const pillClass =
    trend === "up"
      ? "bg-rose-50 text-rose-600 ring-rose-200/70"
      : trend === "down"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70"
      : "bg-muted text-muted-foreground ring-border";

  const sparkData = spark?.map((v, i) => ({ i, v })) ?? [];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all",
        "hover:border-primary/30 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.12)]",
        accent && "bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md border",
            accent
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-border/70 bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="tabular text-[26px] font-semibold leading-none text-foreground">
            {value}
          </div>
          {(sub || deltaPct) && (
            <div className="mt-2 flex items-center gap-1.5">
              {deltaPct && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-medium ring-1",
                    pillClass
                  )}
                >
                  {trend === "up" && <TrendingUp className="h-2.5 w-2.5" />}
                  {trend === "down" && <TrendingDown className="h-2.5 w-2.5" />}
                  {deltaPct}
                </span>
              )}
              {sub && <span className="truncate text-[11.5px] text-muted-foreground">{sub}</span>}
            </div>
          )}
        </div>

        {sparkData.length > 1 && (
          <div className="h-10 w-20 shrink-0 opacity-80 transition-opacity group-hover:opacity-100">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                <defs>
                  <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={accent ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor={accent ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={accent ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  strokeWidth={1.5}
                  fill={`url(#spark-${label})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
