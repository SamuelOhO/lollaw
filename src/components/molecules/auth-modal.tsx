'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignup = () => {
    router.push('/auth/signup');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm ${
          isClosing ? 'animate-fade-out' : 'animate-fade-in'
        }`} 
        onClick={handleClose}
      />
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl ${
          isClosing ? 'animate-modal-out' : 'animate-modal-in'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="닫기"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            로그인이 필요한 서비스입니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            서비스를 이용하시려면 로그인이 필요합니다
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 font-medium hover:bg-neutral-700 transition-colors"
          >
            로그인하기
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">또는</span>
            </div>
          </div>

          <button
            onClick={handleSignup}
            className="w-full border-2 border-neutral-800 text-neutral-800 dark:border-white dark:text-white rounded-lg px-4 py-3 font-medium hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
          >
            회원가입하기
          </button>
        </div>
      </div>
    </div>
  );
} 