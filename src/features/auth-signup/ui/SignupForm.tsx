'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { PasswordInput } from '@/shared/ui/password-input';
import { createClient } from '@/shared/api/supabase/client';

const schema = z
  .object({
    full_name: z.string().min(2, '이름을 입력해주세요.'),
    email: z.string().email('이메일을 정확히 입력해주세요.'),
    password: z.string().min(6, '비밀번호는 6자 이상입니다.'),
    password_confirm: z.string().min(1, '비밀번호를 한번 더 입력해주세요.'),
  })
  .refine((v) => v.password === v.password_confirm, {
    path: ['password_confirm'],
    message: '비밀번호가 일치하지 않습니다.',
  });

type Values = z.infer<typeof schema>;

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', email: '', password: '', password_confirm: '' },
  });

  const onSubmit = async (values: Values) => {
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.full_name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      toast.success('가입 확인 이메일을 보냈습니다. 메일함을 확인해주세요.');
      return;
    }
    // 프로필 이름 강제 업데이트 (트리거가 처리하지만 안전망)
    await supabase.from('profiles').upsert({ id: data.user!.id, full_name: values.full_name, email: values.email });
    toast.success('가입 완료! 학원 설정으로 이동합니다.');
    router.replace('/setup');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="full_name">이름</Label>
        <Input id="full_name" placeholder="홍길동" {...register('full_name')} />
        {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">비밀번호</Label>
        <PasswordInput id="password" placeholder="6자 이상" {...register('password')} />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password_confirm">비밀번호 확인</Label>
        <PasswordInput id="password_confirm" placeholder="비밀번호를 다시 입력" {...register('password_confirm')} />
        {errors.password_confirm && <p className="text-xs text-red-500">{errors.password_confirm.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} 가입하기
      </Button>
    </form>
  );
}
