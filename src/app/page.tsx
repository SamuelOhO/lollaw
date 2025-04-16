// // src/app/page.tsx

// "use client"

// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
// import { useRouter } from "next/navigation"
// import { useEffect } from "react"
// import { useSession } from "@supabase/auth-helpers-react"

// export default function HomePage() {
//   const router = useRouter()
//   const supabase = createClientComponentClient()
//   const session = useSession()

//   useEffect(() => {
//     if (session) {
//       router.push("/community") // 로그인 완료 시 바로 커뮤니티로 이동
//     }
//   }, [session])

//   const handleLogin = async () => {
//     await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: {
//         redirectTo: `${location.origin}/auth/callback`,
//       },
//     })
//   }

//   return (
//     <main className="p-6 flex flex-col items-center justify-center h-screen">
//       <h1 className="text-2xl font-bold mb-4">로그인 후 이용해 주세요</h1>
//       <button
//         onClick={handleLogin}
//         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//       >
//         구글로 로그인
//       </button>
//     </main>
//   )
// }

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import CategoryList from '@/components/CategoryList'

export default async function Home() {
  // 비동기 함수로 분리하여 실행
  async function getData() {
    const cookieStore = await cookies()
    
    // 모든 쿠키를 미리 가져옴
    const cookieObject = Object.fromEntries(
      cookieStore.getAll().map(c => [c.name, c.value])
    )
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieObject[name]
          },
          set() {},
          remove() {}
        }
      }
    )
    
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
    
    return data
  }
  
  const categories = await getData()

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories?.map((category) => (
          <CategoryList key={category.id} category={category} />
        ))}
      </div>
    </main>
  )
}