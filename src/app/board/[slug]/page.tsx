import { headers } from 'next/headers'
import BoardClient from './BoardClient'

export default async function BoardPage({ params: { slug } }: { params: { slug: string } }) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''

  return (
    <BoardClient
      slug={slug}
      pathname={pathname}
    />
  );
}
