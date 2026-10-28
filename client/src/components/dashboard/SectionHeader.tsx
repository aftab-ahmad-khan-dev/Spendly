import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  sub,
  right,
  className,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-center justify-between gap-3", className)}>
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
        {sub && <p className="mt-0.5 text-[12px] text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
