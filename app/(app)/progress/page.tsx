import { ProgressView } from '@/views/progress';
export default async function Page({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const sp = await searchParams;
  return <ProgressView initialOrgId={sp.org ?? null} />;
}
