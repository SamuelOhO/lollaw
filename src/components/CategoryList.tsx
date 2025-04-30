// components/CategoryList.tsx
'use client'
import { createClientSupabase } from '@/utils/supabase/client'
// import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthRequiredModal from './auth/AuthRequiredModal'

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
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const supabase = createClientSupabase()
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
    // 학교 게시판이고 로그인하지 않은 경우에만 모달 표시
    if (subCategory.parent_id === 2 && !session) {
      setSelectedCategory(subCategory)
      setShowAuthModal(true)
      return
    }
    router.push(`/board/${subCategory.slug}`)
  }

  const handleModalClose = () => {
    setShowAuthModal(false)
    setSelectedCategory(null)
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

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={handleModalClose}
        message={`${selectedCategory?.name} 게시판을 이용하시려면 로그인과 학교인증이 필요합니다.`}
        redirectUrl={`/auth/login`}
      />
    </div>
  )
}