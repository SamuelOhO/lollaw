import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { QueryKeys } from '@/types/api';
import type { Category } from '@/types';
import { handleApiError, logError } from '@/utils/error-handler';

interface ExtendedCategory extends Category {
  parent?: Category | null;
}

interface CategoryData {
  category: ExtendedCategory;
  subcategories: Category[];
}

// slug 유효성 검증 함수
const isValidSlug = (slug: string): boolean => {
  if (!slug || typeof slug !== 'string') return false;
  // 기본적인 slug 형식 검증 (영문, 숫자, 하이픈, 언더스코어만 허용)
  // 길이는 1-50자 사이여야 함
  return /^[a-zA-Z0-9_-]+$/.test(slug) && slug.length >= 1 && slug.length <= 50;
};

export function useCategory(slug: string) {
  const supabase = createClient();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: QueryKeys.category(slug),
    queryFn: async (): Promise<CategoryData> => {
      try {
        // slug 유효성 검증
        if (!isValidSlug(slug)) {
          const errorMsg = `유효하지 않은 카테고리 경로입니다: ${slug}`;
          logError({ slug, isValid: false }, 'Invalid slug provided');
          throw new Error(errorMsg);
        }

        // 1. 현재 카테고리 정보 가져오기 (실제 존재하는 컬럼만 요청)
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select(`
            id,
            name,
            slug,
            parent_id,
            requires_auth,
            created_at
          `)
          .eq('slug', slug)
          .single();

        if (categoryError) {
          logError({ slug, error: categoryError, errorCode: categoryError.code }, 'Category fetch error');
          if (categoryError.code === 'PGRST116') {
            throw new Error(`카테고리를 찾을 수 없습니다: ${slug}`);
          }
          // 다른 에러는 그대로 throw하여 retry 로직이 처리하도록 함
          throw categoryError;
        }

        if (!categoryData) {
          throw new Error(`카테고리 데이터가 비어있습니다: ${slug}`);
        }

        // 2. 부모 카테고리 정보 가져오기 (있는 경우)
        let parentData = null;
        if (categoryData.parent_id) {
          const { data: parent, error: parentError } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryData.parent_id)
            .single();

          if (parentError && parentError.code !== 'PGRST116') {
            logError(parentError, 'Parent category fetch error');
          } else if (parent) {
            parentData = parent;
          }
        }

        // 3. 하위 카테고리들 가져오기 (현재 카테고리가 부모인 경우)
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('parent_id', categoryData.id)
          .order('id', { ascending: true });

        if (subcategoriesError && subcategoriesError.code !== 'PGRST116') {
          logError(subcategoriesError, 'Subcategories fetch error');
        }

        // 4. 형제 카테고리들 가져오기 (같은 부모를 가진 카테고리들)
        let siblingCategories: Category[] = [];
        if (categoryData.parent_id) {
          const { data: siblings, error: siblingsError } = await supabase
            .from('categories')
            .select('*')
            .eq('parent_id', categoryData.parent_id)
            .order('id', { ascending: true });

          if (siblingsError && siblingsError.code !== 'PGRST116') {
            logError(siblingsError, 'Sibling categories fetch error');
          } else if (siblings) {
            siblingCategories = siblings;
          }
        }

        const extendedCategory: ExtendedCategory = {
          ...categoryData,
          parent: parentData,
        };

        // 하위 카테고리가 있으면 하위 카테고리를, 없으면 형제 카테고리를 반환
        const relatedCategories = subcategoriesData && subcategoriesData.length > 0 
          ? subcategoriesData 
          : siblingCategories;

        return {
          category: extendedCategory,
          subcategories: relatedCategories || []
        };
      } catch (error) {
        // 에러를 로깅하고 다시 throw
        logError({ slug, error }, 'useCategory queryFn error');
        handleApiError(error);
        throw error;
      }
    },
    enabled: !!slug && isValidSlug(slug), // slug가 유효할 때만 쿼리 실행
    staleTime: 1000 * 60 * 10, // 10분 (카테고리 정보는 자주 변경되지 않음)
    gcTime: 1000 * 60 * 60, // 1시간
    retry: (failureCount, error: any) => {
      // 클라이언트 에러(400번대)는 재시도하지 않음
      if (error?.status >= 400 && error?.status < 500) {
        logError({ slug, error, failureCount, status: error?.status }, 'Query retry stopped for client error');
        return false;
      }
      // PostgREST 에러 코드 체크
      if (error?.code === 'PGRST116' || error?.code?.startsWith('PGRST')) {
        logError({ slug, error, failureCount, code: error?.code }, 'Query retry stopped for PostgREST error');
        return false;
      }
      // 네트워크 에러나 서버 에러만 재시도 (최대 2번)
      const shouldRetry = failureCount < 2;
      logError({ slug, error, failureCount, shouldRetry }, 'Query retry decision');
      return shouldRetry;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프 (최대 30초)
  });

  return {
    category: data?.category || null,
    subcategories: data?.subcategories || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

// 모든 카테고리 목록을 가져오는 훅
export function useCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: QueryKeys.categories,
    queryFn: async (): Promise<Category[]> => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('parent_id', { ascending: true, nullsFirst: true })
          .order('id', { ascending: true });

        if (error) throw error;

        return data || [];
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 15, // 15분
    gcTime: 1000 * 60 * 60, // 1시간
    retry: (failureCount, error: any) => {
      // 400 에러는 재시도하지 않음
      if (error?.status === 400) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
