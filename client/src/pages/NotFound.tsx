import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center text-center'>
      <div className='text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
        404
      </div>
      <h1 className='serif mt-2 text-[32px] text-foreground'>Page not found</h1>
      <p className='mt-2 max-w-sm text-sm text-muted-foreground'>
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link href='/'>
        <a>
          <Button className='mt-6'>Back to overview</Button>
        </a>
      </Link>
    </div>
  );
}
