// 파일 위치: /src/utils/auth/token.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface VerificationPayload {
  email: string;
  schoolId: number;
  userId: string;
}

export function generateVerificationToken(payload: VerificationPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): VerificationPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as VerificationPayload;
    return decoded;
  } catch (error) {
    console.log('error: ', error)
    return null;
  }
}