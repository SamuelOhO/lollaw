-- comments 테이블의 user_id 외래 키를 profiles 테이블로 변경
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- comments 테이블의 RLS 정책 수정
DROP POLICY IF EXISTS "인증된 사용자의 댓글 작성 허용" ON comments;
DROP POLICY IF EXISTS "인증된 사용자의 댓글 조회 허용" ON comments;
DROP POLICY IF EXISTS "작성자의 댓글 삭제 허용" ON comments;
DROP POLICY IF EXISTS "작성자의 댓글 수정 허용" ON comments;

CREATE POLICY "인증된 사용자의 댓글 작성 허용"
ON comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "모든 사용자의 댓글 조회 허용"
ON comments FOR SELECT TO public
USING (true);

CREATE POLICY "작성자의 댓글 삭제 허용"
ON comments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "작성자의 댓글 수정 허용"
ON comments FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- likes 테이블의 RLS 정책 수정
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON likes;
DROP POLICY IF EXISTS "Enable delete for post owners" ON likes;
DROP POLICY IF EXISTS "Enable read access for all users" ON likes;

CREATE POLICY "Enable insert for authenticated users only"
ON likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for post owners"
ON likes FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for all users"
ON likes FOR SELECT TO public
USING (true); 