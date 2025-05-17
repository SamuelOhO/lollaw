-- ✅ 0. 테이블이 없을 경우 대비: 먼저 생성
CREATE TABLE IF NOT EXISTS school_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  school_name TEXT,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE
);

-- ✅ 1. created_at 컬럼 추가
ALTER TABLE school_verifications
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- ✅ 2. 상태가 pending인 경우 verified_at 초기화
UPDATE school_verifications
SET verified_at = NULL
WHERE status = 'pending';

-- ✅ 3. Row Level Security 설정
ALTER TABLE school_verifications ENABLE ROW LEVEL SECURITY;

-- ✅ 4. 기존 정책 제거
DROP POLICY IF EXISTS "Users can view their own verifications" ON school_verifications;
DROP POLICY IF EXISTS "Users can insert their own verifications" ON school_verifications;
DROP POLICY IF EXISTS "Users can update their own verifications" ON school_verifications;

-- ✅ 5. 새로운 정책 추가
CREATE POLICY "Users can view their own verifications"
ON school_verifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verifications"
ON school_verifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verifications"
ON school_verifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);