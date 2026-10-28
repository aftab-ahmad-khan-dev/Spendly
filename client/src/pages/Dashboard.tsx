import { useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Wallet,
  Receipt,
  CalendarDays,
  Activity,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useDashboardSummary } from "@/api/hooks";
import { formatCurrency, formatShortDate, formatDate } from "@/lib/format";
import { getCategoryIcon } from "@/lib/categoryIcon";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { AiChat } from "@/components/ai/AiChat";
import { Link } from "wouter";

function greetingFor(hour: number) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default function Dashboard() {
  const { data, isLoading } = useDashboardSummary();
  const { user } = useUser();
  const firstName = user?.firstName || user?.username || "there";
  const greeting = greetingFor(new Date().getHours());

  const derived = useMemo(() => {
    if (!data) return null;
    const last14 = data.dailySpend.slice(-14).map((d) => d.total);
    const last7 = data.dailySpend.slice(-7).map((d) => d.total);
    const prev7 = data.dailySpend.slice(-14, -7).map((d) => d.total);
    const sum = (a: number[]) => a.reduce((s, n) => s + n, 0);
    const sum7 = sum(last7);
    const sumPrev7 = sum(prev7);
    const weekly =
      sumPrev7 > 0 ? ((sum7 - sumPrev7) / sumPrev7) * 100 : sum7 > 0 ? 100 : 0;
    const avgDaily =
      data.dailySpend.length > 0
        ? data.dailySpend.reduce((s, d) => s + d.total, 0) / data.dailySpend.length
        : 0;
    return { last14, last7, sum7, weekly, avgDaily };
  }, [data]);

  if (isLoading || !data || !derived) {
    return (
      <div className='space-y-8'>
        <Skeleton className='h-16 w-2/3' />
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-28' />
          ))}
        </div>
        <div className='grid gap-4 lg:grid-cols-3'>
          <Skeleton className='h-80 lg:col-span-2' />
          <Skeleton className='h-80' />
        </div>
      </div>
    );
  }

  const delta = data.totalThisMonth - data.totalLastMonth;
  const trend = delta > 0 ? "up" : delta < 0 ? "down" : null;
  const monthPct =
    data.totalLastMonth > 0
      ? `${delta >= 0 ? "+" : ""}${((delta / data.totalLastMonth) * 100).toFixed(0)}%`
      : undefined;

  const weeklyTrend: "up" | "down" | null =
    derived.weekly > 0.5 ? "up" : derived.weekly < -0.5 ? "down" : null;
  const weeklyPct =
    derived.weekly !== 0
      ? `${derived.weekly >= 0 ? "+" : ""}${derived.weekly.toFixed(0)}%`
      : undefined;

  return (
    <div className='space-y-8'>
      {/* Greeting header */}
      <header className='relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/[0.06] via-background to-background p-6 md:p-8'>
        <div className='pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-24 -left-10 h-60 w-60 rounded-full bg-primary/[0.04] blur-3xl' />
        <div className='relative flex flex-wrap items-end justify-between gap-4'>
          <div className='min-w-0'>
            <div className='inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-2.5 py-1 text-[10.5px] font-medium text-muted-foreground backdrop-blur'>
              <span className='h-1.5 w-1.5 rounded-full bg-primary' />
              Overview · {formatDate(new Date())}
            </div>
            <h1 className='serif mt-3 text-[32px] leading-[1.1] tracking-tight text-foreground sm:text-[40px]'>
              {greeting}, {firstName}.
            </h1>
            <p className='mt-1.5 max-w-md text-[13.5px] text-muted-foreground'>
              Here's a calm read of your month so far no alarms unless something
              deserves one.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <div className='hidden items-center gap-2 rounded-lg border border-border bg-card/70 px-3 py-2 text-[11.5px] text-muted-foreground backdrop-blur sm:flex'>
              <Sparkles className='h-3.5 w-3.5 text-primary' />
              Assistant ready try "spent 12 on coffee"
            </div>
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          accent
          label='This month'
          value={formatCurrency(data.totalThisMonth)}
          icon={Wallet}
          trend={trend}
          deltaPct={monthPct}
          sub='vs last month'
          spark={data.dailySpend.map((d) => d.total)}
        />
        <StatCard
          label='This week'
          value={formatCurrency(derived.sum7)}
          icon={Activity}
          trend={weeklyTrend}
          deltaPct={weeklyPct}
          sub='vs prior 7 days'
          spark={derived.last14}
        />
        <StatCard
          label='Today'
          value={formatCurrency(data.totalToday)}
          icon={CalendarDays}
          sub={data.totalToday === 0 ? "Nothing spent yet" : "Logged today"}
          spark={derived.last7}
        />
        <StatCard
          label='Daily avg'
          value={formatCurrency(derived.avgDaily)}
          icon={Receipt}
          sub={`${data.expenseCountThisMonth} transactions`}
          spark={derived.last14}
        />
      </section>

      {/* Primary chart + Categories */}
      <section className='grid gap-4 lg:grid-cols-3'>
        <div className='rounded-xl border border-border bg-card p-5 lg:col-span-2'>
          <SectionHeader
            title='Daily spending'
            sub='Last 30 days'
            right={
              <span className='tabular text-[11.5px] text-muted-foreground'>
                Avg {formatCurrency(derived.avgDaily)}/day
              </span>
            }
          />
          <div className='h-64 md:h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={data.dailySpend}
                margin={{ top: 6, right: 6, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id='spend' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='0%'
                      stopColor='hsl(var(--primary))'
                      stopOpacity={0.25}
                    />
                    <stop
                      offset='100%'
                      stopColor='hsl(var(--primary))'
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke='hsl(var(--border))'
                  strokeDasharray='2 4'
                  vertical={false}
                />
                <XAxis
                  dataKey='date'
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(d) => formatShortDate(d)}
                  interval={4}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `$${v}`}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  labelFormatter={(d) => formatDate(d as string)}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    fontSize: 12,
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='total'
                  stroke='hsl(var(--primary))'
                  strokeWidth={1.75}
                  fill='url(#spend)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='rounded-xl border border-border bg-card p-5'>
          <SectionHeader
            title='Top categories'
            sub='This month'
            right={
              <Link href='/categories'>
                <a className='inline-flex items-center gap-0.5 text-[11.5px] text-muted-foreground hover:text-foreground'>
                  Manage <ArrowUpRight className='h-3 w-3' />
                </a>
              </Link>
            }
          />
          {data.topCategories.length === 0 ? (
            <div className='py-12 text-center text-sm text-muted-foreground'>
              No spending recorded this month yet.
            </div>
          ) : (
            <>
              <div className='h-40'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={data.topCategories}
                      dataKey='total'
                      nameKey='categoryName'
                      innerRadius={42}
                      outerRadius={70}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {data.topCategories.map((c, i) => (
                        <Cell
                          key={i}
                          fill={c.categoryColor || "hsl(var(--primary))"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => formatCurrency(v)}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--popover))",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className='mt-4 space-y-2'>
                {data.topCategories.map((c) => {
                  const Icon = getCategoryIcon(c.categoryIcon);
                  return (
                    <li
                      key={c.categoryId}
                      className='flex items-center justify-between text-sm'
                    >
                      <span className='flex items-center gap-2.5'>
                        <span
                          className='flex h-6 w-6 items-center justify-center rounded-md'
                          style={{
                            backgroundColor: `${c.categoryColor}1a`,
                            color: c.categoryColor || undefined,
                          }}
                        >
                          <Icon className='h-3.5 w-3.5' />
                        </span>
                        <span className='text-foreground/90'>{c.categoryName}</span>
                      </span>
                      <span className='tabular text-[13px] font-medium text-foreground'>
                        {formatCurrency(c.total)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </section>

      {/* Recent expenses + AI assistant */}
      <section className='grid gap-4 lg:grid-cols-3'>
        <div className='rounded-xl border border-border bg-card p-5 lg:col-span-2'>
          <SectionHeader
            title='Recent activity'
            sub='Latest six transactions'
            right={
              <Link href='/expenses'>
                <a className='inline-flex items-center gap-0.5 text-[11.5px] text-muted-foreground hover:text-foreground'>
                  View all <ArrowUpRight className='h-3 w-3' />
                </a>
              </Link>
            }
          />
          {data.recentExpenses.length === 0 ? (
            <div className='py-12 text-center text-sm text-muted-foreground'>
              No expenses yet. Tap the Record button, or just tell the assistant.
            </div>
          ) : (
            <ul className='divide-y divide-border/70'>
              {data.recentExpenses.map((e) => {
                const Icon = getCategoryIcon(e.categoryIcon);
                return (
                  <li key={e.id} className='flex items-center justify-between py-3'>
                    <div className='flex min-w-0 items-center gap-3'>
                      <span
                        className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md'
                        style={{
                          backgroundColor: `${e.categoryColor}1a`,
                          color: e.categoryColor || undefined,
                        }}
                      >
                        <Icon className='h-4 w-4' />
                      </span>
                      <div className='min-w-0'>
                        <div className='truncate text-[13.5px] font-medium text-foreground'>
                          {e.categoryName}
                        </div>
                        <div className='truncate text-[11.5px] text-muted-foreground'>
                          {e.note || formatDate(e.date)}
                        </div>
                      </div>
                    </div>
                    <div className='tabular text-[14px] font-semibold text-foreground'>
                      {formatCurrency(e.amount)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className='h-[520px]'>
          <AiChat />
        </div>
      </section>
    </div>
  );
}
