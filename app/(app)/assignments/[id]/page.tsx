import { AssignmentDetailView } from '@/views/assignment-detail';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssignmentDetailView assignmentId={id} />;
}
