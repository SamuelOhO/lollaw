// // ✅ src/app/community/page.tsx (서버 컴포넌트)
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { redirect } from 'next/navigation'
// import Link from 'next/link'

// export default async function CommunityPage() {
//   const cookieStore = cookies() // ✅ 여기선 동기 호출도 허용됨
//   const supabase = createServerComponentClient({ cookies: () => cookieStore })
//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   if (!user) {
//     redirect('/login') // ✅ 로그인 안 된 경우 로그인 페이지로 이동
//   }

//   const { data: posts, error } = await supabase
//     .from('posts')
//     .select('id, title, created_at')
//     .order('created_at', { ascending: false })
//     if (error) {
//         console.error('[게시글 로딩 실패]', error.message)
//         return <p className="text-red-500">게시글을 불러오는 데 실패했습니다.</p>
//       }

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">커뮤니티</h1>
//         <Link
//           href="/community/write"
//           className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           글쓰기
//         </Link>
//       </div>

//       {posts && posts.length > 0 ? (
//         <ul className="space-y-4">
//           {posts.map((post) => (
//             <li key={post.id} className="border-b pb-2">
//               <Link href={`/community/${post.id}`} className="text-blue-600 hover:underline">
//                 {post.title}
//               </Link>
//               <p className="text-sm text-gray-500">
//                 {new Date(post.created_at).toLocaleString()}
//               </p>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p className="text-gray-500">아직 작성된 글이 없습니다.</p>
//       )}
//     </div>
//   )
// }


// // app/community/page.tsx
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { redirect } from 'next/navigation'
// import Link from 'next/link'

// export default async function CommunityPage() {
//   try {
//     const cookieStore = cookies()
//     const supabase = createServerComponentClient({ 
//       cookies: () => cookieStore 
//     })

//     // 세션 확인
//     const {
//       data: { session },
//     } = await supabase.auth.getSession()

//     if (!session) {
//       return redirect('/login')
//     }

//     // 게시글 데이터 가져오기
//     const { data: posts, error } = await supabase
//       .from('posts')
//       .select('id, title, created_at')
//       .order('created_at', { ascending: false })

//     if (error) {
//       throw error
//     }

//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-2xl font-bold">커뮤니티</h1>
//           <Link
//             href="/community/write"
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//           >
//             글쓰기
//           </Link>
//         </div>

//         {posts && posts.length > 0 ? (
//           <div className="grid gap-4">
//             {posts.map((post) => (
//               <div key={post.id} className="border rounded-lg p-4 hover:shadow-lg transition">
//                 <Link href={`/community/${post.id}`}>
//                   <h2 className="text-xl font-semibold hover:text-blue-600">{post.title}</h2>
//                   <p className="text-gray-500 text-sm mt-2">
//                     {new Date(post.created_at).toLocaleString('ko-KR')}
//                   </p>
//                 </Link>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-gray-500">아직 작성된 글이 없습니다.</p>
//         )}
//       </div>
//     )
//   } catch (error) {
//     console.error('Community 페이지 에러:', error)
//     return (
//       <div className="text-center p-6">
//         <p className="text-red-500">페이지를 불러오는데 실패했습니다.</p>
//       </div>
//     )
//   }
// }

// app/community/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CommunityPage() {
  try {
    const supabase = createServerComponentClient({ 
      cookies
    })

    // 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return redirect('/login')
    }

    // 게시글 데이터 가져오기
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">커뮤니티</h1>
          <Link
            href="/community/write"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            글쓰기
          </Link>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid gap-4">
            {posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                <Link href={`/community/${post.id}`}>
                  <h2 className="text-xl font-semibold hover:text-blue-600">{post.title}</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    {new Date(post.created_at).toLocaleString('ko-KR')}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">아직 작성된 글이 없습니다.</p>
        )}
      </div>
    )
  } catch (error) {
    console.error('Community 페이지 에러:', error)
    return (
      <div className="text-center p-6">
        <p className="text-red-500">페이지를 불러오는데 실패했습니다.</p>
      </div>
    )
  }
}