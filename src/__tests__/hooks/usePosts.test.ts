import { renderHook, act } from '@testing-library/react';
import { usePosts } from '@/hooks/usePosts';
import { createClient } from '@/utils/supabase/client';

jest.mock('@/utils/supabase/client');

describe('usePosts', () => {
  const mockCategoryId = 1;
  const mockPosts = [
    {
      id: 1,
      title: '테스트 게시글 1',
      content: '테스트 내용 1',
      created_at: '2024-03-20T00:00:00Z',
      updated_at: '2024-03-20T00:00:00Z',
      views: 1,
      user_id: 'user1',
      category_id: mockCategoryId,
      profiles: {
        display_name: '테스트 사용자 1',
      },
    },
    {
      id: 2,
      title: '테스트 게시글 2',
      content: '테스트 내용 2',
      created_at: '2024-03-20T00:00:00Z',
      updated_at: '2024-03-20T00:00:00Z',
      views: 2,
      user_id: 'user2',
      category_id: mockCategoryId,
      profiles: {
        display_name: '테스트 사용자 2',
      },
    },
  ];

  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태가 올바르게 설정되어야 함', () => {
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => usePosts(mockCategoryId));

    expect(result.current.posts).toEqual([]);
    expect(result.current.session).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('게시글을 성공적으로 가져와야 함', async () => {
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockPosts, error: null }),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => usePosts(mockCategoryId));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.posts).toEqual(mockPosts);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.loading).toBe(false);
  });

  it('에러가 발생하면 콘솔에 에러를 출력해야 함', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockError = new Error('테스트 에러');
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockRejectedValue(mockError),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => usePosts(mockCategoryId));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith('게시글 로딩 오류:', mockError);
    expect(result.current.posts).toEqual([]);
    expect(result.current.loading).toBe(false);

    consoleSpy.mockRestore();
  });

  it('카테고리 ID가 null이면 게시글을 가져오지 않아야 함', () => {
    const mockSupabase = {
      auth: {
        getSession: jest.fn(),
      },
      from: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => usePosts(null));

    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(result.current.posts).toEqual([]);
    expect(result.current.loading).toBe(true);
  });
}); 