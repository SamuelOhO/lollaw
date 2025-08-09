import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const commentId = parseInt(params.id);

    if (isNaN(commentId)) {
      return NextResponse.json({ error: '유효하지 않은 댓글 ID입니다.' }, { status: 400 });
    }

    // 현재 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 기존 좋아요 확인
    const { data: existingLike, error: checkError } = await supabase
      .from('likes_comments')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('좋아요 확인 중 오류:', checkError);
      return NextResponse.json({ error: '좋아요 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }

    if (existingLike) {
      // 좋아요 취소
      const { error: deleteError } = await supabase
        .from('likes_comments')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('좋아요 취소 중 오류:', deleteError);
        return NextResponse.json({ error: '좋아요 취소에 실패했습니다.' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        isLiked: false,
        message: '좋아요를 취소했습니다.' 
      });
    } else {
      // 좋아요 추가
      const { error: insertError } = await supabase
        .from('likes_comments')
        .insert([
          {
            comment_id: commentId,
            user_id: user.id,
          },
        ]);

      if (insertError) {
        console.error('좋아요 추가 중 오류:', insertError);
        return NextResponse.json({ error: '좋아요 처리에 실패했습니다.' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        isLiked: true,
        message: '좋아요를 추가했습니다.' 
      });
    }
  } catch (error) {
    console.error('댓글 좋아요 처리 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 좋아요 개수 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const commentId = parseInt(params.id);

    if (isNaN(commentId)) {
      return NextResponse.json({ error: '유효하지 않은 댓글 ID입니다.' }, { status: 400 });
    }

    // 좋아요 개수 조회
    const { count, error } = await supabase
      .from('likes_comments')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId);

    if (error) {
      console.error('좋아요 개수 조회 중 오류:', error);
      return NextResponse.json({ error: '좋아요 개수 조회에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      likesCount: count || 0 
    });
  } catch (error) {
    console.error('좋아요 개수 조회 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 