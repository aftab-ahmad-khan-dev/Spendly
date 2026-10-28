import { Link, useLocation } from "wouter";
import { LayoutDashboard, Receipt, PiggyBank, Bell, Tag, type LucideIcon } from "lucide-react";
import { useAlerts } from "@/api/hooks";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function BottomNav() {
  const [location] = useLocation();
  const { data: alerts } = useAlerts();
  const unread = (alerts ?? []).filter((a) => !a.isRead).length;

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          const showBadge = href === "/alerts" && unread > 0;
          return (
            <li key={href} className="relative">
              <Link href={href}>
                <a
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10.5px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "relative flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                      active && "bg-primary/10"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {showBadge && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-destructive-foreground">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </span>
                  <span className="leading-none">{label}</span>
                  {active && (
                    <span className="absolute inset-x-5 top-0 h-0.5 rounded-b-full bg-primary" />
                  )}
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
