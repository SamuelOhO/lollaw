import { renderHook, act, waitFor } from '@testing-library/react';
import { useCategory } from './useCategory';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types/models';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn().mockReturnThis(),
    })),
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      data: [],
    })),
  },
}));

describe('useCategory', () => {
  const mockCategory: Category = {
    id: '1',
    name: 'Test Category',
    slug: 'test-category',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockSubcategories: Category[] = [
    {
      id: '2',
      name: 'Test Subcategory 1',
      slug: 'test-subcategory-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Test Subcategory 2',
      slug: 'test-subcategory-2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with null category', () => {
    const { result } = renderHook(() => useCategory('test-category'));
    expect(result.current.category).toBeNull();
    expect(result.current.subcategories).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle subscription cleanup', () => {
    const { unmount } = renderHook(() => useCategory('test-category'));
    unmount();
    expect(supabase.channel).toHaveBeenCalled();
  });

  it('should handle subscription errors', async () => {
    const mockError = new Error('Subscription error');
    (supabase.channel as jest.Mock).mockImplementationOnce(() => ({
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'postgres_changes') {
          callback({ error: mockError });
        }
        return {
          subscribe: jest.fn().mockReturnThis(),
          unsubscribe: jest.fn().mockReturnThis(),
        };
      }),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn().mockReturnThis(),
    }));

    const { result } = renderHook(() => useCategory('test-category'));

    await waitFor(() => {
      expect(result.current.error).toBe(mockError.message);
    });
  });

  it('should update category when changed', async () => {
    const { result } = renderHook(() => useCategory('test-category'));

    await act(async () => {
      const channel = supabase.channel();
      const callback = (channel.on as jest.Mock).mock.calls[0][1];
      callback({ new: mockCategory });
    });

    await waitFor(() => {
      expect(result.current.category).toEqual(mockCategory);
    });
  });

  it('should update subcategories when changed', async () => {
    const { result } = renderHook(() => useCategory('test-category'));

    await act(async () => {
      const channel = supabase.channel();
      const callback = (channel.on as jest.Mock).mock.calls[0][1];
      callback({ new: mockSubcategories[0] });
    });

    await waitFor(() => {
      expect(result.current.subcategories).toContainEqual(mockSubcategories[0]);
    });
  });
}); 