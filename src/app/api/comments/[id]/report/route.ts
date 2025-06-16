import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const commentId = parseInt(params.id);
    const { reason } = await request.json();

    if (isNaN(commentId)) {
      return NextResponse.json({ error: '유효하지 않은 댓글 ID입니다.' }, { status: 400 });
    }

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: '신고 사유를 입력해주세요.' }, { status: 400 });
    }

    // 현재 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 댓글 존재 여부 확인
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, report_count')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: '존재하지 않는 댓글입니다.' }, { status: 404 });
    }

    // 신고 추가와 댓글 신고 횟수 증가를 트랜잭션으로 처리
    const { error: transactionError } = await supabase.rpc('handle_comment_report', {
      p_comment_id: commentId,
      p_user_id: user.id,
      p_reason: reason.trim()
    });

    if (transactionError) {
      console.error('신고 처리 중 오류:', transactionError);
      if (transactionError.message?.includes('already reported')) {
        return NextResponse.json({ error: '이미 신고한 댓글입니다.' }, { status: 400 });
      }
      return NextResponse.json({ error: '신고 처리에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: '신고가 접수되었습니다.' 
    });
  } catch (error) {
    console.error('댓글 신고 처리 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 신고 취소
export async function DELETE(
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

    // 기존 신고 확인 및 삭제, 신고 횟수 감소를 트랜잭션으로 처리
    const { error: transactionError } = await supabase.rpc('handle_comment_report_cancel', {
      p_comment_id: commentId,
      p_user_id: user.id
    });

    if (transactionError) {
      console.error('신고 취소 중 오류:', transactionError);
      return NextResponse.json({ error: '신고 취소에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: '신고가 취소되었습니다.' 
    });
  } catch (error) {
    console.error('댓글 신고 취소 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 