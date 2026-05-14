import { redirect } from 'next/navigation';
import { getSessionContext } from '@/shared/auth/server';
import { SetupView } from '@/views/setup';

export default async function SetupPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect('/login');
  if (ctx.memberships.length > 0) redirect('/dashboard');
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-b from-background to-muted/30">
      <SetupView userId={ctx.userId} />
    </div>
  );
}
