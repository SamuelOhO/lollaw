'use client'

import { useRouter } from 'next/navigation'

interface AuthRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  redirectUrl?: string
}

export default function AuthRequiredModal({ 
  isOpen, 
  onClose, 
  message,
  redirectUrl = '/auth/login'
}: AuthRequiredModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleLogin = () => {
    router.push(redirectUrl)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">로그인 필요</h2>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            돌아가기
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  )
} 