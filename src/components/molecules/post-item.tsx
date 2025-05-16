'use client';

import Link from 'next/link';
import { formatKoreanDateTime } from '@/utils/date';
import type { Post } from '@/types/models';

interface PostItemProps {
  post: Post;
  slug: string;
}

export default function PostItem({ post, slug }: PostItemProps) {
  return (
    <li className="hover:bg-gray-50">
      <Link href={`/board/${slug}/post/${post.id}`}>
        <div className="px-4 py-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>{post.profiles?.display_name || '익명'}</span>
            <span className="mx-2">•</span>
            <span>{formatKoreanDateTime(post.created_at)}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
