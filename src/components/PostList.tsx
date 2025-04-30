// // components/PostList.tsx
// 'use client'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import Link from 'next/link'
// import { formatKoreanDateTime } from '@/utils/date'
// import { useEffect, useState } from 'react'

// interface PostListProps {
//   categoryId: number;
//   requiresAuth: boolean;
//   slug: string;
// }

// interface Post {
//   id: number;
//   title: string;
//   content: string;
//   created_at: string;
//   profiles?: {
//     username: string;
//     avatar_url?: string;
//   };
// }

// export default function PostList({ categoryId, requiresAuth, slug }: PostListProps) {
//   const [posts, setPosts] = useState<Post[]>([])
//   const [session, setSession] = useState<any>(null)
//   const supabase = createClientComponentClient()

//   useEffect(() => {
//     const fetchData = async () => {
//       // 세션 가져오기
//       const { data: { session } } = await supabase.auth.getSession()
//       setSession(session)

//       // 게시글 가져오기
//       const { data: posts } = await supabase
//         .from('posts')
//         .select(`
//           *,
//           profiles:user_id (
//             username,
//             avatar_url
//           )
//         `)
//         .eq('category_id', categoryId)
//         .order('created_at', { ascending: false })

//       if (posts) setPosts(posts)
//     }

//     fetchData()
//   }, [categoryId, supabase])

//   const handleWriteClick = async () => {
//     if (!session) {
//       // 현재 경로 저장
//       localStorage.setItem('previousPath', `/board/${slug}`)
//       window.location.href = '/login'
//       return
//     }
//     window.location.href = `/board/${slug}/write`
//   }

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-semibold">게시글 목록</h2>
//         {/* 자유게시판은 항상 버튼 표시, 학교게시판은 로그인 시에만 표시 */}
//         {(!requiresAuth || session) && (
//           <button
//             onClick={handleWriteClick}
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             글쓰기
//           </button>
//         )}
//       </div>

//       <div className="bg-white shadow overflow-hidden sm:rounded-md">
//         <ul className="divide-y divide-gray-200">
//           {posts.map((post) => (
//             <li key={post.id}>
//               <Link href={`/board/${slug}/post/${post.id}`}>
//                 <div className="px-4 py-4 flex items-center sm:px-6">
//                   <div className="min-w-0 flex-1">
//                     <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
//                     <div className="mt-2 flex items-center text-sm text-gray-500">
//                       <span>{post.profiles?.username}</span>
//                       <span className="mx-2">•</span>
//                       <span>{formatKoreanDateTime(post.created_at)}</span>
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             </li>
//           ))}
//         </ul>
//         {posts.length === 0 && (
//           <div className="text-center py-8 text-gray-500">
//             게시글이 없습니다.
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// components/PostList.tsx
'use client'
import { createClientSupabase } from '@/utils/supabase/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { formatKoreanDateTime } from '@/utils/date'

interface PostListProps {
    categoryId: number;
    requiresAuth: boolean;
    slug: string;
}

export default function PostList({ categoryId, requiresAuth, slug }: PostListProps) {
    const [posts, setPosts] = useState<any[]>([])
    const [session, setSession] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClientSupabase()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                // 세션 확인
                const { data: { session } } = await supabase.auth.getSession()
                setSession(session)
                // 게시글 가져오기
                const { data: posts, error } = await supabase
                    .from('posts')
                    .select(`
                    *,
                    profiles:user_id (
                    display_name
                    )
                    `)
                    .eq('category_id', categoryId)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setPosts(posts || [])

            } catch (error) {
                console.error('게시글 로딩 오류:', error)
            } finally {
                setLoading(false)
                }
        }
        fetchData()
    }, [categoryId, supabase])

  const handleWriteClick = () => {
    if (!session) {
      localStorage.setItem('previousPath', `/board/${slug}`)
      window.location.href = '/auth/login'
      return
    }
    window.location.href = `/board/${slug}/write`
  }

  if (loading) {
    return <div className="animate-pulse">게시글을 불러오는 중...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">게시글 목록</h2>
        {(!requiresAuth || session) && (
          <button
            onClick={handleWriteClick}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            글쓰기
          </button>
        )}
      </div>

      {posts.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => (
              <li key={post.id} className="hover:bg-gray-50">
                <Link href={`/board/${slug}/post/${post.id}`}>
                  <div className="px-4 py-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>{post.profiles?.display_name}</span>
                      <span className="mx-2">•</span>
                      <span>{formatKoreanDateTime(post.created_at)}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">아직 작성된 글이 없습니다.</p>
      )}
    </div>
  )
}