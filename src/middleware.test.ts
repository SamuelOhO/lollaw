// middleware.test.ts
import { middleware } from './middleware';
import { NextRequest } from 'next/server';
import '@testing-library/jest-dom';

// Supabase 모킹
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
      }),
    },
  })),
}));

describe('Middleware', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    // 테스트 환경 설정
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    // 요청 객체 생성
    mockRequest = new NextRequest('http://localhost:3000/mypage');
  });

  afterEach(() => {
    // 테스트 후 환경 변수 초기화
    jest.clearAllMocks();
  });

  it('보호된 경로에 인증 없이 접근하면 로그인 페이지로 리다이렉트', async () => {
    const response = await middleware(mockRequest);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/auth/login');
  });

  it('공개 경로는 인증 없이도 접근 가능', async () => {
    mockRequest = new NextRequest('http://localhost:3000/');
    const response = await middleware(mockRequest);
    expect(response.status).toBe(200);
  });

  it('게시판 접근 시 권한 체크', async () => {
    mockRequest = new NextRequest('http://localhost:3000/board/test');
    const response = await middleware(mockRequest);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/auth/login');
  });
});
