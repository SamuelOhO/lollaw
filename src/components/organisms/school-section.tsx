'use client';

import { CardStack } from '@/components/atoms/card-stack';

interface SchoolItem {
  id: number;
  title: string;
  content: string;
  author: string;
  likes: number;
  categoryName: string;
  categorySlug: string;
}

export default function SchoolSection() {
  const schoolData: SchoolItem[] = [
    {
      id: 1,
      title: '서울대학교 로스쿨',
      content: '서울대학교 로스쿨 게시판입니다.',
      author: '관리자',
      likes: 0,
      categoryName: '서울대',
      categorySlug: 'seoul',
    },
    {
      id: 2,
      title: '고려대학교 로스쿨',
      content: '고려대학교 로스쿨 게시판입니다.',
      author: '관리자',
      likes: 0,
      categoryName: '고려대',
      categorySlug: 'korea',
    },
  ];

  return <CardStack items={schoolData} />;
}
