import { renderHook, act } from '@testing-library/react';
import { useComments } from '@/hooks/useComments';
import { createClient } from '@/utils/supabase/client';
import type { Comment } from '@/types/board';

jest.mock('@/utils/supabase/client');

describe('useComments', () => {
  const mockPostId = 1;
  const mockUserId = 'test-user-id';
  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    created_at: '2024-03-20T00:00:00Z',
  };

  const mockComments = [
    {
      id: 1,
      content: '테스트 댓글 1',
      post_id: mockPostId,
      user_id: mockUserId,
      parent_id: null,
      created_at: '2024-03-20T00:00:00Z',
      profiles: {
        display_name: '테스트 사용자',
        avatar_url: 'https://example.com/avatar.jpg',
      },
      replies: [],
    },
    {
      id: 2,
      content: '테스트 댓글 2',
      post_id: mockPostId,
      user_id: mockUserId,
      parent_id: null,
      created_at: '2024-03-20T00:00:00Z',
      profiles: {
        display_name: '테스트 사용자',
        avatar_url: 'https://example.com/avatar.jpg',
      },
      replies: [],
    },
  ];

  const mockProfiles = [
    {
      id: mockUserId,
      display_name: '테스트 사용자',
      avatar_url: 'https://example.com/avatar.jpg',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태가 올바르게 설정되어야 함', () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
      channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn(),
      }),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => useComments(mockPostId));

    expect(result.current.comments).toEqual([]);
    expect(result.current.user).toBeNull();
  });

  it('댓글을 성공적으로 가져와야 함', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockComments, error: null }),
        in: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
      }),
      channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn(),
      }),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => useComments(mockPostId));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.comments).toEqual(mockComments);
    expect(result.current.user).toEqual(mockUser);
  });

  it('댓글을 성공적으로 추가할 수 있어야 함', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockComments, error: null }),
        in: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      }),
      channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn(),
      }),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => useComments(mockPostId));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addComment('새로운 댓글');
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('comments');
    expect(mockSupabase.from('comments').insert).toHaveBeenCalledWith([
      {
        content: '새로운 댓글',
        post_id: mockPostId,
        user_id: mockUserId,
        parent_id: null,
      },
    ]);
  });

  it('빈 댓글은 추가되지 않아야 함', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockComments, error: null }),
        in: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      }),
      channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn(),
      }),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => useComments(mockPostId));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addComment('');
    });

    expect(mockSupabase.from('comments').insert).not.toHaveBeenCalled();
  });

  it('대댓글을 성공적으로 추가할 수 있어야 함', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockComments, error: null }),
        in: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      }),
      channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn(),
      }),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => useComments(mockPostId));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addComment('대댓글', 1);
    });

    expect(mockSupabase.from('comments').insert).toHaveBeenCalledWith([
      {
        content: '대댓글',
        post_id: mockPostId,
        user_id: mockUserId,
        parent_id: 1,
      },
    ]);
  });
}); 