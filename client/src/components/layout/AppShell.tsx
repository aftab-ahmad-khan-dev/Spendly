import { Link, useLocation } from "wouter";
import { UserButton } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Bell,
  Tag,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/api/hooks";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { Button } from "@/components/ui/button";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

function DesktopNavItem({
  href,
  label,
  icon: Icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "relative flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
          active
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        )}
      >
        <Icon
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-colors",
            active ? "text-primary" : "",
          )}
        />
        <span>{label}</span>
        {badge ? (
          <span className='ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive/10 px-1 text-[10px] font-semibold text-destructive'>
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
        {active && (
          <span className='pointer-events-none absolute inset-x-3 -bottom-[10px] h-[2px] rounded-full bg-primary/70' />
        )}
      </a>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: alerts } = useAlerts();
  const unread = (alerts ?? []).filter((a) => !a.isRead).length;

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <div className='relative min-h-screen bg-background'>
      {/* Top bar */}
      <header className='sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md'>
        <div className='mx-auto max-w-7xl flex h-14 items-center justify-between gap-4 px-4 md:px-6'>
          <div className='flex items-center gap-8'>
            <Link href='/'>
              <a>
                <Logo />
              </a>
            </Link>
            <nav className='hidden items-center gap-1 md:flex'>
              {NAV.map((n) => (
                <DesktopNavItem
                  key={n.href}
                  {...n}
                  active={isActive(n.href)}
                  badge={n.href === "/alerts" ? unread : undefined}
                />
              ))}
            </nav>
          </div>
          <div className='flex items-center gap-2'>
            <div className='hidden sm:block'>
              <AddExpenseDialog
                trigger={
                  <Button size='sm' className='h-8 gap-1 px-3 text-[12.5px]'>
                    <Plus className='h-3.5 w-3.5' /> Record
                  </Button>
                }
              />
            </div>
            <UserButton
              afterSignOutUrl='/'
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-1 ring-border",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className='mx-auto max-w-7xl px-4 pb-28 pt-6 md:px-6 md:pb-10 md:pt-8'>
        {children}
      </main>

      {/* Footer hidden on mobile to keep bottom-nav clean */}
      <footer className='mx-auto hidden max-w-6xl px-6 pb-10 pt-4 text-xs text-muted-foreground md:block'>
        <div className='flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4'>
          <span>
            © {new Date().getFullYear()} Spendly. A calmer way to track money.
          </span>
          <span className='font-mono tabular'>v1.0</span>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Mobile FAB quick record on small screens */}
      <div className='fixed bottom-[calc(env(safe-area-inset-bottom)+64px)] right-4 z-40 md:hidden'>
        <AddExpenseDialog
          trigger={
            <Button
              size='icon'
              className='h-12 w-12 rounded-full shadow-lg shadow-primary/25'
              aria-label='Record expense'
            >
              <Plus className='h-5 w-5' />
            </Button>
          }
        />
      </div>
    </div>
  );
}
