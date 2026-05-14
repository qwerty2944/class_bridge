import { CharacterView } from '@/views/character';

export default async function Page({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const sp = await searchParams;
  return <CharacterView targetUserId={sp.user ?? null} />;
}
