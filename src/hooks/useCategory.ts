import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Category, ExtendedCategory } from '@/types/board';

export function useCategory(slug: string) {
  const [category, setCategory] = useState<ExtendedCategory | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. 현재 카테고리 정보 가져오기
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select(
            `
            id,
            name,
            slug,
            parent_id,
            requires_auth,
            created_at
          `
          )
          .eq('slug', slug)
          .single();

        if (categoryError) {
          console.error('Category fetch error:', categoryError);
          throw new Error('카테고리를 찾을 수 없습니다.');
        }

        if (!categoryData) {
          throw new Error('카테고리가 존재하지 않습니다.');
        }

        // 2. 부모 카테고리 정보 가져오기 (있는 경우)
        let parentData = null;
        if (categoryData.parent_id) {
          const { data: parent, error: parentError } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryData.parent_id)
            .single();

          if (parentError) {
            console.error('Parent category fetch error:', parentError);
            throw new Error('부모 카테고리 정보를 가져오는데 실패했습니다.');
          }

          if (parent) {
            parentData = parent;
          }
        }

        // 3. 현재 카테고리의 형제 카테고리들 가져오기
        const parentId = categoryData.parent_id ?? categoryData.id;
        const { data: siblingCategories, error: siblingsError } = await supabase
          .from('categories')
          .select('*')
          .eq('parent_id', parentId)
          .order('id', { ascending: true });

        if (siblingsError) {
          console.error('Sibling categories fetch error:', siblingsError);
          throw new Error('관련 카테고리 정보를 가져오는데 실패했습니다.');
        }

        setCategory({
          ...categoryData,
          parent: parentData,
        });
        setSubcategories(siblingCategories || []);
      } catch (error) {
        console.error('Error fetching category:', error);
        setError(
          error instanceof Error ? error.message : '카테고리 정보를 가져오는데 실패했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  return { category, subcategories, loading, error };
}
