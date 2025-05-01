'use client'

import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [session, setSession] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 왼쪽: 로고 */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/Lollaw.png"
                alt="Lollaw Logo"
                width={120}
                height={40}
                priority
                className="h-8 w-auto"
              />
            </Link>
            <span className="ml-4 text-gray-700 hidden sm:block">
              연결을 제공하는 로스쿨 전문 커뮤니티
            </span>
          </div>

          {/* 오른쪽: 네비게이션 링크들 */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/mypages"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              마이페이지
            </Link>
            {session ? (
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"

              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/auth/login"
                // className="[&]:bg-coral-500 [&]:hover:bg-coral-600 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors duration-200 inline-flex items-center"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 