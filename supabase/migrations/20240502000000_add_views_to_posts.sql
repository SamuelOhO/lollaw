-- Add views column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

-- Create index for views column
CREATE INDEX IF NOT EXISTS posts_views_idx ON posts(views);

-- Add RLS policy for views
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Views are viewable by everyone"
ON posts FOR SELECT
USING (true);

CREATE POLICY "Views are updatable by authenticated users"
ON posts FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated'); 