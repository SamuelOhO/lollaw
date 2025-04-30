import crypto from 'crypto';

// 6자리 인증 코드 생성
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 인증 코드의 해시 생성 (데이터베이스 저장용)
export function hashVerificationCode(code: string, email: string): string {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET이 설정되지 않았습니다.');
    throw new Error('서버 설정 오류');
  }

  const dataToHash = `${code}${email}${process.env.JWT_SECRET}`;
  console.log('해시 생성 데이터:', {
    code,
    email,
    hasJwtSecret: !!process.env.JWT_SECRET,
    dataToHash
  });

  return crypto
    .createHash('sha256')
    .update(dataToHash)
    .digest('hex');
} 