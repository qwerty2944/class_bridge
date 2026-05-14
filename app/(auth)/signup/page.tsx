import { SignupForm } from '@/features/auth-signup';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
      <p className="text-sm text-muted-foreground mt-1">이메일로 가입 후 학원을 만들거나 합류하세요.</p>
      <div className="mt-6">
        <SignupForm />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        이미 계정이 있나요?{' '}
        <Link href="/login" className="text-foreground font-medium underline-offset-4 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
