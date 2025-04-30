// 파일 위치: /src/utils/email/sendEmail.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  secure: true, // SSL/TLS 사용
  tls: {
    rejectUnauthorized: false
  },
  pool: true, // 연결 풀링 사용
  maxConnections: 1, // 동시 연결 수 제한
  rateDelta: 20000, // 이메일 발송 간격 (ms)
  rateLimit: 5, // 특정 시간 내 최대 이메일 발송 수
})

// 이메일 전송 전에 연결 테스트
async function verifyEmailConnection() {
  try {
    await transporter.verify()
    console.log('이메일 서버 연결 성공')
    return true
  } catch (error) {
    console.error('이메일 서버 연결 실패:', error)
    return false
  }
}

// export async function sendVerificationEmail(
//   toEmail: string, 
//   verificationToken: string,
//   schoolName: string
// ) {
//   const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: toEmail,
//     subject: `[${schoolName}] 학교 이메일 인증`,
//     html: `
//       <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
//         <h2>학교 이메일 인증</h2>
//         <p>안녕하세요. 학교 이메일 인증을 위해 아래 버튼을 클릭해주세요.</p>
//         <a href="${verificationUrl}" 
//            style="display: inline-block; padding: 10px 20px; 
//                   background-color: #0070f3; color: white; 
//                   text-decoration: none; border-radius: 5px;">
//           이메일 인증하기
//         </a>
//         <p>버튼이 작동하지 않는 경우 아래 링크를 복사하여 브라우저에 붙여넣기 해주세요:</p>
//         <p>${verificationUrl}</p>
//         <p>이 링크는 24시간 동안 유효합니다.</p>
//       </div>
//     `
//   };

//   try {
//     // 환경변수 체크
//     if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
//       throw new Error('이메일 설정이 누락되었습니다.')
//     }

//     console.log('Sending email with config:', {
//       user: process.env.EMAIL_USER,
//       hasPassword: !!process.env.EMAIL_PASSWORD,
//       to: toEmail
//     })

//     await transporter.sendMail(mailOptions)
//     return true
//   } catch (error) {
//     console.error('이메일 전송 실패:', error)
//     // 더 자세한 에러 메시지 반환
//     if (error === 'EAUTH') {
//       throw new Error('이메일 인증 실패: Gmail 설정을 확인해주세요.')
//     }
//     throw error
//   }
// }
export async function sendVerificationEmail(email: string, schoolName: string, verificationCode: string) {
  const isConnected = await verifyEmailConnection()
  if (!isConnected) {
    return { 
      success: false, 
      error: '이메일 서버 연결에 실패했습니다. 관리자에게 문의해주세요.' 
    }
  }

  const mailOptions = {
    from: {
      name: 'LolLaw 인증센터',
      address: process.env.EMAIL_USER as string
    },
    to: email,
    subject: `[${schoolName}] 학교 이메일 인증 코드`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h1 style="color: #333; text-align: center;">학교 이메일 인증</h1>
          <p style="color: #666;">안녕하세요,</p>
          <p style="color: #666;">${schoolName} 이메일 인증을 진행합니다.</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #eee; padding: 20px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px;">
              ${verificationCode}
            </div>
          </div>
          <p style="color: #666; margin-top: 20px;">
            위 인증 코드를 복사하여 인증 페이지에 입력해주세요.
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            • 이 인증 코드는 5분간 유효합니다.<br>
            • 본 이메일은 발신전용입니다.<br>
            • 인증 요청을 하지 않았다면 이 이메일을 무시하셔도 됩니다.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} LolLaw. All rights reserved.
        </div>
      </div>
    `,
    text: `
      ${schoolName} 이메일 인증 코드
      
      안녕하세요,
      ${schoolName} 이메일 인증을 진행합니다.
      
      인증 코드: ${verificationCode}
      
      이 인증 코드는 5분간 유효합니다.
      
      © ${new Date().getFullYear()} LolLaw
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('이메일 전송 에러:', error)
    return { 
      success: false, 
      error: '이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.' 
    }
  }
}