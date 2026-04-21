import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Sparkles,
  LineChart,
  MessagesSquare,
  Tag,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Shield;
  title: string;
  body: string;
}) {
  return (
    <div className='group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.12)]'>
      <span className='inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary'>
        <Icon className='h-4 w-4' />
      </span>
      <div className='mt-4 text-[14.5px] font-semibold text-foreground'>{title}</div>
      <p className='mt-1.5 text-[13px] leading-relaxed text-muted-foreground'>
        {body}
      </p>
    </div>
  );
}

function PreviewCard() {
  return (
    <div className='relative'>
      <div className='pointer-events-none absolute -inset-8 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-2xl' />
      <div className='relative rounded-2xl border border-border bg-card/80 p-4 shadow-[0_18px_48px_-20px_rgba(15,23,42,0.25)] backdrop-blur'>
        <div className='flex items-center justify-between border-b border-border/70 pb-3'>
          <div className='flex items-center gap-2'>
            <Logo size={22} />
            <span className='text-[11.5px] text-muted-foreground'>Overview</span>
          </div>
          <div className='flex gap-1'>
            <span className='h-2 w-2 rounded-full bg-border' />
            <span className='h-2 w-2 rounded-full bg-border' />
            <span className='h-2 w-2 rounded-full bg-primary/60' />
          </div>
        </div>
        <div className='mt-4 grid grid-cols-3 gap-2.5'>
          <div className='rounded-lg border border-border bg-gradient-to-b from-primary/[0.05] to-transparent p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-[9px] font-medium uppercase tracking-wider text-muted-foreground'>
                Month
              </span>
              <Wallet className='h-3 w-3 text-primary' />
            </div>
            <div className='tabular mt-1.5 text-[17px] font-semibold text-foreground'>
              $2,847
            </div>
            <div className='mt-1 inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 ring-1 ring-emerald-200/70'>
              <TrendingUp className='h-2 w-2 rotate-180' />
              -6%
            </div>
          </div>
          <div className='rounded-lg border border-border p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-[9px] font-medium uppercase tracking-wider text-muted-foreground'>
                Week
              </span>
            </div>
            <div className='tabular mt-1.5 text-[17px] font-semibold text-foreground'>
              $612
            </div>
            <div className='mt-1 text-[9.5px] text-muted-foreground'>
              avg $87/day
            </div>
          </div>
          <div className='rounded-lg border border-border p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-[9px] font-medium uppercase tracking-wider text-muted-foreground'>
                Today
              </span>
            </div>
            <div className='tabular mt-1.5 text-[17px] font-semibold text-foreground'>
              $24.10
            </div>
            <div className='mt-1 text-[9.5px] text-muted-foreground'>
              2 transactions
            </div>
          </div>
        </div>
        <div className='mt-3 rounded-lg border border-border p-3'>
          <div className='flex items-center justify-between text-[10.5px]'>
            <span className='font-medium text-foreground'>Daily spending</span>
            <span className='text-muted-foreground'>30d</span>
          </div>
          <svg viewBox='0 0 300 60' className='mt-2 h-14 w-full'>
            <defs>
              <linearGradient id='preview-g' x1='0' x2='0' y1='0' y2='1'>
                <stop
                  offset='0%'
                  stopColor='hsl(var(--primary))'
                  stopOpacity='0.3'
                />
                <stop
                  offset='100%'
                  stopColor='hsl(var(--primary))'
                  stopOpacity='0'
                />
              </linearGradient>
            </defs>
            <path
              d='M0,45 L20,38 L40,42 L60,28 L80,30 L100,20 L120,26 L140,14 L160,22 L180,18 L200,8 L220,16 L240,22 L260,16 L280,24 L300,18 L300,60 L0,60 Z'
              fill='url(#preview-g)'
            />
            <path
              d='M0,45 L20,38 L40,42 L60,28 L80,30 L100,20 L120,26 L140,14 L160,22 L180,18 L200,8 L220,16 L240,22 L260,16 L280,24 L300,18'
              stroke='hsl(var(--primary))'
              strokeWidth='1.5'
              fill='none'
            />
          </svg>
        </div>
        <div className='mt-3 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.04] p-2.5'>
          <span className='flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary'>
            <Sparkles className='h-3 w-3' />
          </span>
          <span className='text-[11px] text-foreground/80'>
            "Spent 12 on coffee" → logged to{" "}
            <span className='font-medium'>Food</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className='min-h-[100dvh] bg-background'>
      {/* Top bar */}
      <header className='sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur'>
        <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6'>
          <Logo />
          <div className='flex items-center gap-1.5'>
            <SignInButton mode='modal'>
              <Button variant='ghost' size='sm'>
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode='modal'>
              <Button size='sm' className='gap-1'>
                Get started <ArrowRight className='h-3.5 w-3.5' />
              </Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-quiet-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]' />
        <div className='pointer-events-none absolute -top-20 right-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl' />
        <div className='relative mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:px-6 md:py-20 lg:py-24'>
          <div className='max-w-2xl'>
            <div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11.5px] text-muted-foreground'>
              <span className='h-1.5 w-1.5 rounded-full bg-primary' /> A quieter way
              to track money
            </div>
            <h1 className='serif mt-5 text-[44px] leading-[1.02] tracking-tight text-foreground sm:text-[54px] md:text-[60px]'>
              Personal finance,
              <br className='hidden sm:block' /> without the noise.
            </h1>
            <p className='mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground'>
              Spendly is an expense ledger for people who want to understand where
              their money actually goes not a dashboard shouting at them. Log by
              typing a sentence, read weekly trends, and set limits you'll actually
              hit.
            </p>
            <div className='mt-8 flex flex-wrap items-center gap-3'>
              <SignUpButton mode='modal'>
                <Button size='lg' className='gap-1.5'>
                  Start tracking <ArrowRight className='h-4 w-4' />
                </Button>
              </SignUpButton>
              <SignInButton mode='modal'>
                <Button size='lg' variant='outline'>
                  I already have an account
                </Button>
              </SignInButton>
            </div>
            <div className='mt-7 flex flex-wrap gap-5 text-[12px] text-muted-foreground'>
              <span className='flex items-center gap-1.5'>
                <CheckCircle2 className='h-3.5 w-3.5 text-primary' /> Free while in
                beta
              </span>
              <span className='flex items-center gap-1.5'>
                <CheckCircle2 className='h-3.5 w-3.5 text-primary' /> Encrypted in
                transit
              </span>
              <span className='flex items-center gap-1.5'>
                <CheckCircle2 className='h-3.5 w-3.5 text-primary' /> No ads, ever
              </span>
            </div>
          </div>
          <div className='hidden md:block'>
            <PreviewCard />
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className='border-t border-border/70 bg-muted/20'>
        <div className='mx-auto max-w-6xl px-4 py-16 md:px-6'>
          <div className='max-w-xl'>
            <p className='text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>
              What it does
            </p>
            <h2 className='serif mt-1 text-[32px] leading-[1.1] text-foreground md:text-[36px]'>
              A short list, done well.
            </h2>
          </div>
          <div className='mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <Feature
              icon={MessagesSquare}
              title='Type your expenses'
              body='Say "spent 12 on coffee yesterday" and it lands in the right category, on the right date, with a note. No forms to fill in.'
            />
            <Feature
              icon={LineChart}
              title='Read your month in a glance'
              body='Month-to-date totals, daily trend, top categories. The view stays the same whether you spent $200 or $20,000.'
            />
            <Feature
              icon={Tag}
              title='Categories that fit you'
              body='Start with a clean default set, then add the ones you actually think in. Color and icon included.'
            />
            <Feature
              icon={Sparkles}
              title="Ask, don't dig"
              body="Switch the assistant to Ask mode for quick reads: where you're overspending, how this month compares, what to cut."
            />
            <Feature
              icon={Shield}
              title="Alerts you won't ignore"
              body="Budget warnings at 80% and again when you cross the limit. Quiet when nothing's off."
            />
            <Feature
              icon={CheckCircle2}
              title='Yours to own'
              body="Export is on the roadmap and your data is tied to your account. We're not in the advertising business."
            />
          </div>
        </div>
      </section>

      {/* Close */}
      <section className='border-t border-border/70'>
        <div className='mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 md:flex-row md:items-center md:px-6'>
          <div>
            <h3 className='serif text-[28px] leading-[1.1] text-foreground md:text-[32px]'>
              Ready to see the last thirty days?
            </h3>
            <p className='mt-2 text-sm text-muted-foreground'>
              Less than a minute to sign up. Cancel any time, or don't we don't
              charge during beta.
            </p>
          </div>
          <SignUpButton mode='modal'>
            <Button size='lg' className='gap-1.5'>
              Create an account <ArrowRight className='h-4 w-4' />
            </Button>
          </SignUpButton>
        </div>
      </section>

      <footer className='border-t border-border/70 px-4 py-6 text-center text-xs text-muted-foreground md:px-6'>
        © {new Date().getFullYear()} Spendly
      </footer>
    </div>
  );
}
