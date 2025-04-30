'use client'

import { useRouter } from 'next/navigation'
import BoardList from '@/components/board/BoardList'
import WriteButton from '@/components/board/WriteButton'
import type { Category, Post } from '@/types/board'

interface BoardPageContentProps {
  category: Category;
  posts: Post[];
  page: number;
  limit: number;
}

export default function BoardPageContent({ 
  category,
  posts,
  page,
  limit 
}: BoardPageContentProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <WriteButton key={`write-${category.id}`} category={category} />
        </div>
        <BoardList 
          key={`list-${category.id}-${page}`} 
          initialPosts={posts} 
          category={category} 
        />
      </div>
    </div>
  )
} 