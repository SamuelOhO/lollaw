'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ExtendedCategory, Category } from '@/types/board';

type Props = {
  mainCategory: ExtendedCategory;
  subcategories: Category[];
};

export default function CategorySidebar({ mainCategory, subcategories }: Props) {
  const pathname = usePathname();

  // 표시할 카테고리 이름과 링크 결정
  const displayCategory = mainCategory.parent || mainCategory;
  const displayName = displayCategory.name;
  const displaySlug = displayCategory.slug;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <Link 
        href={`/board/${displaySlug}`}
        className="block mb-4"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white hover:text-coral-600 dark:hover:text-coral-400 transition-colors">
          {displayName}
        </h2>
      </Link>
      <nav className="space-y-2">
        {subcategories.map((category) => (
          <Link
            key={category.id}
            href={`/board/${category.slug}`}
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname.includes(category.slug)
                ? 'bg-coral-50 text-coral-600 dark:bg-coral-900/20 dark:text-coral-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </nav>
    </div>
  );
} 