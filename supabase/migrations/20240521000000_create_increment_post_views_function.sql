-- Create function to increment post views
CREATE OR REPLACE FUNCTION increment_post_views(post_id_param integer)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET views = views + 1 
  WHERE id = post_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_post_views(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_views(integer) TO anon; 