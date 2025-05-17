-- ✅ 테이블이 없을 경우 생성
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ✅ views 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;

-- ✅ 인덱스 생성
CREATE INDEX IF NOT EXISTS posts_views_idx ON posts(views);

-- ✅ RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ✅ RLS 정책 추가
CREATE POLICY "Views are viewable by everyone"
ON posts FOR SELECT
USING (true);

CREATE POLICY "Views are updatable by authenticated users"
ON posts FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');