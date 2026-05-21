import { QuizzesView } from '@/views/quizzes';

export default async function Page({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const sp = await searchParams;
  return <QuizzesView initialOrgId={sp.org ?? null} />;
}
