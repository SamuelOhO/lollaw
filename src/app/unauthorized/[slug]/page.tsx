import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function UnauthorizedPage({ 
  params,
  searchParams 
}: { 
  params: { slug: string }
  searchParams: { reason?: string }
}) {
  const supabase = await createClient()
  
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              접근 권한이 없습니다
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                {searchParams.reason === 'different_school'
                  ? `다른 학교 게시판입니다. ${category?.name || '해당 게시판'}에 접근하려면 해당 학교 인증이 필요합니다.`
                  : `${category?.name || '해당 게시판'}을 이용하시려면 학교 인증이 필요합니다.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 