export type ReportTargetType = 'post' | 'comment';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'rejected';

export interface Report {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  user_id: string;
  reason: string;
  status: ReportStatus;
  admin_note?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReportDto {
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
} 