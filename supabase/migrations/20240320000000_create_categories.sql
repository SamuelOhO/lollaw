-- ✅ [1] 테이블 생성
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  requires_auth BOOLEAN DEFAULT false
);

-- ✅ [2] 기존 카테고리의 parent_id를 임시로 NULL로 설정
UPDATE categories 
SET parent_id = NULL 
WHERE parent_id IN (1, 2, 3);

-- ✅ [3] 메인 카테고리 업데이트
UPDATE categories
SET name = CASE id
      WHEN 1 THEN '자유게시판'
      WHEN 2 THEN '학교게시판'
      WHEN 3 THEN '로준게시판'
    END,
    slug = CASE id
      WHEN 1 THEN 'success'
      WHEN 2 THEN 'schools'
      WHEN 3 THEN 'leet'
    END,
    requires_auth = CASE id
      WHEN 2 THEN true
      ELSE false
    END
WHERE id IN (1, 2, 3);

-- ✅ [4] 서브 카테고리 업데이트
UPDATE categories
SET parent_id = CASE slug
      WHEN 'free-success' THEN 1
      WHEN 'free-student' THEN 3
      WHEN 'yonsei' THEN 2
      WHEN 'konkuk' THEN 2
    END
WHERE slug IN ('free-success', 'free-student', 'yonsei', 'konkuk');

-- ✅ [5] 존재하지 않는 카테고리 추가
WITH new_categories (id, name, slug, parent_id, requires_auth) AS (
  VALUES 
    (1, '자유게시판'::text, 'free'::text, NULL::integer, false),
    (2, '학교게시판'::text, 'schools'::text, NULL::integer, true),
    (3, '로준게시판'::text, 'leet'::text, NULL::integer, false)
)
INSERT INTO categories (id, name, slug, parent_id, requires_auth)
SELECT id, name, slug, parent_id, requires_auth
FROM new_categories
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE id = new_categories.id
);

-- ✅ [6] 시퀀스 업데이트
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories)); 