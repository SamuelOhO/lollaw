-- Drop existing view if exists
DROP VIEW IF EXISTS comments_with_profiles;

-- Create view with correct join
CREATE OR REPLACE VIEW comments_with_profiles AS
SELECT 
    c.*,
    p.display_name,
    p.avatar_url
FROM comments c
LEFT JOIN auth.users u ON c.user_id = u.id
LEFT JOIN profiles p ON u.id = p.id; 