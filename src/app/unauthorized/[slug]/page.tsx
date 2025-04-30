import { createServerSupabase } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function UnauthorizedPage({ 
  params,
  searchParams 
}: { 
  params: { slug: string }
  searchParams: { reason?: string }
}) {
  const supabase = await createServerSupabase()
  
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', params.slug)
    .single()

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">접근 제한</h1>
        {searchParams.reason === 'different_school' ? (
          <>
            <p className="text-gray-600 mb-6">
              다른 학교로 인증이 완료되어 있어 {category?.name} 게시판에 접근할 수 없습니다.
              한 번에 하나의 학교 게시판만 이용할 수 있습니다.
            </p>
            <Link 
              href="/mypage"
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              마이페이지에서 학교 인증 관리하기
            </Link>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              {category?.name} 게시판을 이용하기 위해서는 학교 인증이 필요합니다.
            </p>
            <Link 
              href={`/auth/verify-school/${params.slug}`}
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              학교 인증하러 가기
            </Link>
          </>
        )}
      </div>
    </div>
  )
} 