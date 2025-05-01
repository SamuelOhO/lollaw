// components/CategoryList.tsx
'use client'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
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

interface CategoryListProps {
  categories: Category[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  const [session, setSession] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }

    fetchSession()
  }, [supabase])

  const handleCategoryClick = (category: Category) => {
    // 학교 게시판이고 로그인하지 않은 경우에만 모달 표시
    if (category.parent_id === 2 && !session) {
      localStorage.setItem('intendedPath', `/board/${category.slug}`)
      setSelectedCategory(category)
      setShowAuthModal(true)
      return
    }
    router.push(`/board/${category.slug}`)
  }

  const handleModalClose = () => {
    setShowAuthModal(false)
    setSelectedCategory(null)
  }

  // 카테고리를 부모 ID별로 그룹화
  const groupedCategories = categories.reduce((acc, category) => {
    const parentId = category.parent_id || 'root'
    if (!acc[parentId]) {
      acc[parentId] = []
    }
    acc[parentId].push(category)
    return acc
  }, {} as Record<string | number, Category[]>)

  return (
    <div>
      {/* 자유게시판 섹션 */}
      {groupedCategories[1] && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">자유게시판</h2>
          <ul className="space-y-2">
            {groupedCategories[1].map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 학교게시판 섹션 */}
      {groupedCategories[2] && (
        <div>
          <h2 className="text-xl font-bold mb-4">학교게시판</h2>
          <ul className="space-y-2">
            {groupedCategories[2].map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={handleModalClose}
        message={`${selectedCategory?.name} 게시판을 이용하시려면 로그인과 학교인증이 필요합니다.`}
        redirectUrl="/auth/login"
      />
    </div>
  )
}