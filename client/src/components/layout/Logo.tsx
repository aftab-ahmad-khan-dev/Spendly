import { cn } from "@/lib/utils";

export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden
      >
        <rect x="1" y="1" width="30" height="30" rx="8" fill="hsl(var(--primary))" />
        <path
          d="M10 21c0-5 1.8-7.5 4.3-7.5 2.1 0 2.4 1.3 2.4 2.5 0 1.5-1 2.2-2.6 2.2H12m0 0h3.1c1.8 0 3.1 1.2 3.1 2.9 0 1.6-1.1 2.9-3 2.9-2.4 0-4.2-1.6-4.2-1.6"
          stroke="white"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="22" cy="11" r="2" fill="white" />
      </svg>
      <span className="text-[0.98rem] font-semibold tracking-tight text-foreground">
        Spendly
      </span>
    </span>
  );
}
