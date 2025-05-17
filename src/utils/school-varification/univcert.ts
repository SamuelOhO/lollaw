// 파일 위치: /src/utils/school-verification/univcert.ts
export async function verifyUnivEmail(email: string, univName: string) {
  try {
    // 인증 상태 확인
    const verifyResponse = await fetch('https://univcert.com/api/v1/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.NEXT_PUBLIC_UNIVCERT_API_KEY || '',
      },
      body: JSON.stringify({
        email,
        univName,
      }),
    });

    const verifyResult = await verifyResponse.json();
    return verifyResult.success;
  } catch (error) {
    console.error('UnivCert 인증 에러:', error);
    return false;
  }
}
