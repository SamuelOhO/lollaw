// src/app/page.tsx
import { getTopPosts } from '@/hooks/useTopPosts';
import MainContent from '@/components/organisms/main-content';

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic';

export default async function Home() {
  const freeboardData = await getTopPosts(1);
  const leetData = await getTopPosts(3);

  return <MainContent freeboardData={freeboardData} leetData={leetData} />;
}
