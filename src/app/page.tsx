// src/app/page.tsx
import { getTopPosts } from '@/hooks/useTopPosts';
import MainContent from '@/components/organisms/main-content';

export default async function Home() {
  const freeboardData = await getTopPosts(1);
  const leetData = await getTopPosts(3);

  return <MainContent freeboardData={freeboardData} leetData={leetData} />;
}
