import { renderHook, act } from '@testing-library/react';
import { useCategory } from '@/hooks/useCategory';
import { createClient } from '@/utils/supabase/client';
import type { Category, ExtendedCategory } from '@/types/board';

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        })),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    })),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } })
    },
  })),
}));

describe('useCategory', () => {
  const mockSlug = 'test-category';
  const mockCategory: ExtendedCategory = {
    id: 1,
    name: '테스트 카테고리',
    slug: mockSlug,
    parent_id: null,
    requires_auth: false,
    created_at: '2024-03-20T00:00:00Z',
    parent: null,
  };

  const mockSubcategories: Category[] = [
    {
      id: 2,
      name: '서브 카테고리 1',
      slug: 'sub-category-1',
      parent_id: 1,
      requires_auth: false,
      created_at: '2024-03-20T00:00:00Z',
    },
    {
      id: 3,
      name: '서브 카테고리 2',
      slug: 'sub-category-2',
      parent_id: 1,
      requires_auth: false,
      created_at: '2024-03-20T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태가 올바르게 설정되어야 합니다', () => {
    const { result } = renderHook(() => useCategory(mockSlug));
    expect(result.current.category).toBeNull();
    expect(result.current.subcategories).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('카테고리를 성공적으로 가져와야 합니다', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCategory, error: null }),
        order: jest.fn().mockResolvedValue({ data: mockSubcategories, error: null }),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => useCategory(mockSlug));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.category).toEqual(mockCategory);
    expect(result.current.subcategories).toEqual(mockSubcategories);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('카테고리를 찾을 수 없을 때 에러를 반환해야 합니다', async () => {
    const mockError = new Error('카테고리를 찾을 수 없습니다.');
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { result } = renderHook(() => useCategory(mockSlug));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.category).toBeNull();
    expect(result.current.subcategories).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('카테고리를 찾을 수 없습니다.');
  });
}); 