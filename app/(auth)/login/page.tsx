import { Suspense } from 'react';
import { LoginForm } from '@/features/auth-login';
import Link from 'next/link';
import { Skeleton } from '@/shared/ui/skeleton';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
      <p className="text-sm text-muted-foreground mt-1">계정에 접속해 학원을 관리하세요.</p>
      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-40" />}>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        계정이 없나요?{' '}
        <Link href="/signup" className="text-foreground font-medium underline-offset-4 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
