import Link from 'next/link';
import { ArrowRight, GraduationCap, Users, ClipboardList, MessageSquare } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { getServerUser } from '@/shared/auth/server';
import { redirect } from 'next/navigation';

const FEATURES = [
  { icon: Users, title: '다대다 역할 매핑', desc: '학원장·선생님·학생·학부모가 학원 안팎으로 자유롭게 연결' },
  { icon: GraduationCap, title: '수업·출결·진도', desc: '하루치 수업 기록부터 단원별 진도까지 한 화면에' },
  { icon: ClipboardList, title: '과제 제출·채점', desc: '학생은 제출, 선생님은 채점, 학부모는 열람' },
  { icon: MessageSquare, title: '학원·반 게시판', desc: '공지/자유/Q&A 카테고리, 핀고정, 댓글' },
];

export default async function Home() {
  const user = await getServerUser();
  if (user) redirect('/dashboard');

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 grid lg:grid-cols-2">
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-indigo-950/40 dark:via-background dark:to-pink-950/30 p-12 flex flex-col justify-between">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-pink-500/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
                <GraduationCap className="h-4 w-4" />
              </span>
              Class Bridge
            </div>
            <h1 className="mt-10 text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              학원·과외, <br />
              <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                하나의 다리
              </span>
              로 잇다.
            </h1>
            <p className="mt-6 max-w-md text-muted-foreground leading-relaxed">
              학원장·선생님·학생·학부모를 한 곳에서. 출결·수업·과제·진도·게시판까지
              한 번에 관리하는 통합 학원관리 플랫폼.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/signup">
                  지금 시작하기 <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/login">로그인</Link>
              </Button>
            </div>
          </div>
          <p className="relative text-xs text-muted-foreground">© Class Bridge · 멀티 테넌트 · 다대다 권한</p>
        </section>

        <section className="bg-background p-12 flex items-center">
          <div className="w-full max-w-md mx-auto space-y-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border bg-card p-5 transition hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5 text-foreground">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-semibold">{f.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
