import { renderHook, act } from '@testing-library/react';
import { usePost } from '@/hooks/usePost';
import { createClient } from '@/utils/supabase/client';

jest.mock('@/utils/supabase/client');

describe('usePost', () => {
  const mockPostId = '1';
  const mockUserId = 'test-user-id';
  const mockPost = {
    id: 1,
    title: '테스트 게시글',
    content: '테스트 내용',
    created_at: '2024-03-20T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
    views: 1,
    user_id: 'user1',
    category_id: 1,
    profiles: [
      {
        display_name: '테스트 사용자',
        avatar_url: 'https://example.com/avatar.jpg',
      },
    ],
    comments: [{ count: 2 }],
    likes: [{ count: 0 }],
  };

  const formattedPost = {
    ...mockPost,
    profiles: {
      display_name: mockPost.profiles[0].display_name,
      avatar_url: mockPost.profiles[0].avatar_url,
    },
    comments: { count: mockPost.comments[0].count },
    likes: { count: mockPost.likes[0].count },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('초기 상태가 올바르게 설정되어야 함', () => {
    const mockSupabase = {
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
      channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn(),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => usePost(mockPostId));

    expect(result.current.post).toBeNull();
    expect(result.current.isLiked).toBe(false);
    expect(result.current.likesCount).toBe(0);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('게시글을 성공적으로 가져와야 함', async () => {
    const mockSupabase = {
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPost, error: null }),
      }),
      channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn(),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => usePost(mockPostId));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.post).toEqual(formattedPost);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('좋아요 상태를 확인하고 토글할 수 있어야 함', async () => {
    const mockSupabase = {
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPost, error: null }),
        insert: jest.fn().mockResolvedValue({ error: null }),
        delete: jest.fn().mockResolvedValue({ error: null }),
      }),
      channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn(),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => usePost(mockPostId));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // 좋아요 상태 확인
    await act(async () => {
      await result.current.checkLikeStatus(mockUserId);
    });

    expect(result.current.isLiked).toBe(false);
    expect(result.current.likesCount).toBe(0);

    // 좋아요 추가
    await act(async () => {
      await result.current.toggleLike(mockUserId);
    });

    expect(result.current.isLiked).toBe(true);
    expect(result.current.likesCount).toBe(1);

    // 좋아요 취소
    await act(async () => {
      await result.current.toggleLike(mockUserId);
    });

    expect(result.current.isLiked).toBe(false);
    expect(result.current.likesCount).toBe(0);
  });

  it('에러가 발생하면 에러 상태를 설정해야 함', async () => {
    const mockError = new Error('게시글을 가져오는데 실패했습니다.');
    const mockSupabase = {
      rpc: jest.fn().mockRejectedValue(mockError),
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(mockError),
      }),
      channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn(),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => usePost(mockPostId));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe(mockError.message);
    expect(result.current.loading).toBe(false);
  });
}); 