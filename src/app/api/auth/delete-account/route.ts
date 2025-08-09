import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    // 사용자 프로필 삭제
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile deletion error:', profileError);
      return NextResponse.json({ error: '프로필 삭제에 실패했습니다.' }, { status: 500 });
    }

    // 사용자 계정 삭제 (Supabase Auth)
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

    if (authError) {
      console.error('Auth deletion error:', authError);
      return NextResponse.json({ error: '계정 삭제에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ message: '계정이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: '계정 삭제 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 