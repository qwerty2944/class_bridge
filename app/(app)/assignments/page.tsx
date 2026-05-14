import { AssignmentsView } from '@/views/assignments';
export default async function Page({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const sp = await searchParams;
  return <AssignmentsView initialOrgId={sp.org ?? null} />;
}
