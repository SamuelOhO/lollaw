import { toast } from 'react-hot-toast';
import type { ApiError, ApiResponse } from '@/types/api';

// 에러 로깅 함수
export function logError(error: unknown, context?: string) {
  const errorInfo = {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };
  
  console.error('🔴 Error:', errorInfo);
  
  // 프로덕션에서는 외부 로깅 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // 예: Sentry, LogRocket 등
    // logToExternalService(errorInfo);
  }
}

// API 에러 처리
export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
    };
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    return {
      message: err.message || 'Unknown error occurred',
      code: err.code,
      status: err.status || 500,
      details: err.details,
    };
  }
  
  return {
    message: 'Unknown error occurred',
    status: 500,
  };
}

// 클라이언트 에러 표시
export function showError(error: unknown, fallbackMessage = '오류가 발생했습니다.') {
  const apiError = handleApiError(error);
  toast.error(apiError.message || fallbackMessage);
  logError(error, 'Client Error');
}

// 성공 메시지 표시
export function showSuccess(message: string) {
  toast.success(message);
}

// API 응답 생성 헬퍼 (서버용)
export function createApiResponse<T>(
  data?: T,
  message?: string,
  success = true
): ApiResponse<T> {
  return {
    data,
    message,
    success,
  };
}

// 에러 응답 생성 헬퍼 (서버용)
export function createErrorResponse(
  error: string,
  status = 500
): ApiResponse<never> & { status: number } {
  return {
    error,
    success: false,
    status,
  };
}

// Supabase 에러 처리
export function handleSupabaseError(error: any): ApiError {
  if (!error) {
    return {
      message: 'Unknown error occurred',
      status: 500,
    };
  }

  // Supabase 특정 에러 코드 처리
  const errorCodeMap: Record<string, string> = {
    'PGRST116': '데이터를 찾을 수 없습니다.',
    '23505': '이미 존재하는 데이터입니다.',
    '23503': '참조된 데이터가 존재하지 않습니다.',
    '42501': '권한이 없습니다.',
    'auth/user-not-found': '사용자를 찾을 수 없습니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
  };

  const message = errorCodeMap[error.code] || error.message || 'Database error occurred';

  return {
    message,
    code: error.code,
    status: error.status || 500,
    details: error.details,
  };
} 