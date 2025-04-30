import { createServerSupabase } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const supabase = await createServerSupabase()

  // 게시글 정보 조회 (작성자 정보 포함)
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        display_name,
        avatar_url
      ),
      categories:category_id (
        name,
        slug
      )
    `)
    .eq('id', params.id)
    .single()

  if (postError || !post) {
    console.error('게시글 로딩 오류:', postError)
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href={`/board/${post.categories.slug}`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← {post.categories.name}으로 돌아가기
        </Link>
      </div>
      
      <article className="bg-white rounded-lg shadow-lg p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-600 text-sm">
            <div className="flex items-center">
              {post.profiles.avatar_url && (
                <img 
                  src={post.profiles.avatar_url} 
                  alt="" 
                  className="w-6 h-6 rounded-full mr-2"
                />
              )}
              <span className="font-medium">{post.profiles.display_name}</span>
            </div>
            <span className="mx-2">•</span>
            <time>
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
            </time>
          </div>
        </header>
        
        <div className="prose max-w-none">
          {post.content}
        </div>
      </article>
    </div>
  )
} 