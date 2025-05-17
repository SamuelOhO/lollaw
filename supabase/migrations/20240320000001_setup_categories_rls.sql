-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 카테고리를 볼 수 있도록 설정
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
TO public
USING (true);

-- 관리자만 카테고리를 수정할 수 있도록 설정
CREATE POLICY "Only admins can insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update categories"
ON categories FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete categories"
ON categories FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin'); 