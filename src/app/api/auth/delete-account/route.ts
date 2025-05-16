// src/app/api/auth/delete-account/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // 현재 로그인된 사용자 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    // 프로필 소프트 삭제 처리
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      throw profileError;
    }

    // Supabase Auth에서 사용자 삭제
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ message: '계정이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: '계정 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
