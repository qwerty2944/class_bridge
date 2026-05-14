import { redirect } from 'next/navigation';
import { getSessionContext } from '@/shared/auth/server';
import { AppShell } from '@/widgets/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!ctx) redirect('/login');
  if (ctx.memberships.length === 0) redirect('/setup');
  return <AppShell ctx={ctx}>{children}</AppShell>;
}
