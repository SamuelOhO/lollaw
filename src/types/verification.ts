export type VerificationStatus = 'pending' | 'verified' | 'expired';

export interface SchoolVerification {
  id: string;
  user_id: string;
  school_id: number;
  email: string;
  verified_at?: string;
  verification_method: string;
  status: VerificationStatus;
  verification_code?: string;
  created_at: string;
}
