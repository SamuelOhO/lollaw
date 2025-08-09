import { Suspense } from 'react';
import PostDetail from '@/components/organisms/post-detail';
import CommentSection from '@/components/comments/CommentSection';

interface PostPageProps {
  params: {
    slug: string;
    id: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <Suspense fallback={<div>게시글을 불러오는 중...</div>}>
        <PostDetail postId={params.id} slug={params.slug} />
      </Suspense>
      <Suspense fallback={<div>댓글을 불러오는 중...</div>}>
        <CommentSection postId={parseInt(params.id)} />
      </Suspense>
    </div>
  );
}
