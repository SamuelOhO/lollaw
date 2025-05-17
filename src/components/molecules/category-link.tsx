'use client';

import Link from 'next/link';
import type { Category } from '@/types/board';

type Props = {
  category: Category;
  isActive: boolean;
};

export default function CategoryLink({ category, isActive }: Props) {
  return (
    <Link
      href={`/board/${category.slug}`}
      className={`block px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-coral-50 text-coral-600 dark:bg-coral-900/20 dark:text-coral-400'
          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
      }`}
    >
      {category.name}
    </Link>
  );
} 