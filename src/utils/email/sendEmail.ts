// 파일 위치: /src/utils/email/sendEmail.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',  // 또는 다른 이메일 서비스
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Gmail의 경우 앱 비밀번호 사용
  }
});

export async function sendVerificationEmail(
  toEmail: string, 
  verificationToken: string,
  schoolName: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `[${schoolName}] 학교 이메일 인증`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>학교 이메일 인증</h2>
        <p>안녕하세요. 학교 이메일 인증을 위해 아래 버튼을 클릭해주세요.</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 10px 20px; 
                  background-color: #0070f3; color: white; 
                  text-decoration: none; border-radius: 5px;">
          이메일 인증하기
        </a>
        <p>버튼이 작동하지 않는 경우 아래 링크를 복사하여 브라우저에 붙여넣기 해주세요:</p>
        <p>${verificationUrl}</p>
        <p>이 링크는 24시간 동안 유효합니다.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('이메일 전송 실패:', error);
    return false;
  }
}