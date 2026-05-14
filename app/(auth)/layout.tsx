import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
              <GraduationCap className="h-4 w-4" />
            </span>
            Class Bridge
          </Link>
        </div>
      </header>
      <div className="flex-1 grid place-items-center px-6 py-12 bg-gradient-to-b from-background to-muted/30">
        {children}
      </div>
    </div>
  );
}
