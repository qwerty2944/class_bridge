import { QuizDetailView } from '@/views/quiz-detail';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizDetailView quizId={id} />;
}
