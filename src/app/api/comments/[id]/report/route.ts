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

    // 중복 신고 여부 확인 (유니크 제약 사용)
    const { data: existing, error: findError } = await supabase
      .from('reports')
      .select('id')
      .eq('target_type', 'comment')
      .eq('target_id', commentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      console.error('신고 조회 중 오류:', findError);
      return NextResponse.json({ error: '신고 처리에 실패했습니다.' }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ error: '이미 신고한 댓글입니다.' }, { status: 400 });
    }

    // 신고 생성
    const { error: insertError } = await supabase.from('reports').insert({
      target_type: 'comment',
      target_id: commentId,
      user_id: user.id,
      reason: reason.trim()
    });

    if (insertError) {
      console.error('신고 저장 중 오류:', insertError);
      return NextResponse.json({ error: '신고 처리에 실패했습니다.' }, { status: 500 });
    }

    // 댓글 신고 카운트 증가
    const { error: updateError } = await supabase
      .from('comments')
      .update({ report_count: (comment.report_count || 0) + 1 })
      .eq('id', commentId);

    if (updateError) {
      console.error('신고 카운트 업데이트 오류:', updateError);
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

    // 해당 신고 레코드 삭제
    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('target_type', 'comment')
      .eq('target_id', commentId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('신고 취소 중 오류:', deleteError);
      return NextResponse.json({ error: '신고 취소에 실패했습니다.' }, { status: 500 });
    }

    // 댓글 신고 카운트 감소(0 미만 방지)
    const { data: current, error: curErr } = await supabase
      .from('comments')
      .select('report_count')
      .eq('id', commentId)
      .single();

    if (curErr) {
      console.error('신고 카운트 조회 오류:', curErr);
    } else {
      const nextCount = Math.max((current?.report_count || 0) - 1, 0);
      const { error: decErr } = await supabase
        .from('comments')
        .update({ report_count: nextCount })
        .eq('id', commentId);

      if (decErr) {
        console.error('신고 카운트 감소 오류:', decErr);
      }
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