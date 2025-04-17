// components/CategoryList.tsx
'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: number;
  name: string;
  slug: string;
  requires_auth: boolean;
  parent_id: number | null;
}

export default function CategoryList({ category }: { category: Category }) {
  const [subCategories, setSubCategories] = useState<Category[]>([])
  const [session, setSession] = useState<any>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      // 세션 확인
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      // 서브카테고리 가져오기
      const { data: subCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', category.id)

      if (subCategories) setSubCategories(subCategories)
    }

    fetchData()
  }, [category.id, supabase])

  const handleCategoryClick = (subCategory: Category) => {
    if (subCategory.requires_auth && !session) {
      // 현재 경로 저장
      localStorage.setItem('previousPath', `/board/${subCategory.slug}`)
      // window.location.href = '/login'
      router.push('/auth/login')
      return false
    }
    router.push(`/board/${subCategory.slug}`)
    return true
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
      <ul className="space-y-2">
        {subCategories.map((subCategory) => (
          <li key={subCategory.id}>
            {/* {subCategory.requires_auth && !session ? ( */}
              <button
                onClick={() => handleCategoryClick(subCategory)}
                className="text-blue-600 hover:text-blue-800"
              >
                {subCategory.name}
              </button>
            {/* ) : ( */}
              {/* <Link
                href={`/board/${subCategory.slug}`}
                className="text-blue-600 hover:text-blue-800"
              >
                // {subCategory.name}
              // </Link>
            {/* )} */}
          </li>
        ))}
      </ul>
    </div>
  )
}