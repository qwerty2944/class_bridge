import { ClassesView } from '@/views/classes';

export default async function Page({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const sp = await searchParams;
  return <ClassesView initialOrgId={sp.org ?? null} />;
}
