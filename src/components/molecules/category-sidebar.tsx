import Link from 'next/link';
import type { ExtendedCategory, Category } from '@/types/board';
import CategoryLink from './category-link';

type Props = {
  mainCategory: ExtendedCategory;
  subcategories: Category[];
  pathname: string;
};

export default function CategorySidebar({ mainCategory, subcategories, pathname }: Props) {
  // 표시할 카테고리 이름과 링크 결정
  const displayCategory = mainCategory.parent || mainCategory;
  const displayName = displayCategory.name;
  const displaySlug = displayCategory.slug;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <Link href={`/board/${displaySlug}`} className="block mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white hover:text-coral-600 dark:hover:text-coral-400 transition-colors">
          {displayName}
        </h2>
      </Link>
      <nav className="space-y-2">
        {subcategories.map(category => (
          <CategoryLink
            key={category.id}
            category={category}
            isActive={pathname.includes(category.slug)}
          />
        ))}
      </nav>
    </div>
  );
}
