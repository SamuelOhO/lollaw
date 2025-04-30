'use client'

import Link from 'next/link'

interface WriteButtonProps {
  isLoggedIn: boolean
  boardSlug: string
}

export default function WriteButton({ isLoggedIn, boardSlug }: WriteButtonProps) {
  return (
    <Link
      href={isLoggedIn ? `/board/${boardSlug}/write` : '/auth/login'}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
    >
      글쓰기
    </Link>
  )
} 