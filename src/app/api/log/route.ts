// app/api/log/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  console.log('🔴 클라이언트 오류 로그:', body.message);
  console.log('🔻 에러 내용:', body.error);
  console.log('🔻 에러 내용 url:', body.url);
  console.log('🔻 에러 내용 code_verifier:', body.code_verifier);
  console.log('🔻 에러 내용 code_y_n:', body.code_y_n);

  return NextResponse.json({ status: 'ok' });
}
