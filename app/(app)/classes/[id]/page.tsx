import { ClassDetailView } from '@/views/class-detail';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClassDetailView sessionId={id} />;
}
