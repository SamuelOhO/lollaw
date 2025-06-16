-- Enable RLS on posts table if not already enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can update their own posts"
ON posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 