'use client';

import Link from 'next/link';
import type { Category } from '@/types/board';

type Props = {
  category: Category;
  isActive: boolean;
  isHighlighted: boolean;
};

export default function CategoryLink({ category, isActive, isHighlighted }: Props) {
  return (
    <Link
      href={`/board/${category.slug}`}
      className={`block px-4 py-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-coral-100 text-coral-600 dark:bg-coral-900/30 dark:text-coral-300 hover:bg-coral-200 dark:hover:bg-coral-900/40'
          : isHighlighted
          ? 'bg-coral-50 text-coral-500 dark:bg-coral-900/20 dark:text-coral-400 hover:bg-coral-100 dark:hover:bg-coral-900/30'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
      }`}
    >
      {category.name}
    </Link>
  );
} 