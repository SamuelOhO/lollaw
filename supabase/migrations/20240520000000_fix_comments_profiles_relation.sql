-- Drop existing foreign key if exists
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- Add foreign key constraint
ALTER TABLE comments
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create view to join comments with profiles
CREATE OR REPLACE VIEW comments_with_profiles AS
SELECT 
    c.*,
    p.display_name,
    p.avatar_url
FROM comments c
LEFT JOIN profiles p ON c.user_id = p.id; 