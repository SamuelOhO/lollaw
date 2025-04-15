import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function CommunityPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return <div className="p-6">게시글을 불러오는 데 실패했습니다.</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">커뮤니티</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="border-b pb-2">
            <Link href={`/community/${post.id}`} className="text-blue-600 hover:underline">
              {post.title}
            </Link>
            <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}