-- Create a function to validate report references
CREATE OR REPLACE FUNCTION check_report_references()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_type = 'post' THEN
    IF NOT EXISTS (SELECT 1 FROM posts WHERE id = NEW.target_id) THEN
      RAISE EXCEPTION 'Referenced post does not exist';
    END IF;
  ELSIF NEW.target_type = 'comment' THEN
    IF NOT EXISTS (SELECT 1 FROM comments WHERE id = NEW.target_id) THEN
      RAISE EXCEPTION 'Referenced comment does not exist';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for report reference validation
DROP TRIGGER IF EXISTS check_report_references_trigger ON reports;
CREATE TRIGGER check_report_references_trigger
  BEFORE INSERT OR UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION check_report_references();

-- Create function to handle cascading deletes
CREATE OR REPLACE FUNCTION handle_report_cascade_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM reports
  WHERE (target_type = TG_ARGV[0] AND target_id = OLD.id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for cascading deletes
DROP TRIGGER IF EXISTS handle_post_report_cascade_trigger ON posts;
CREATE TRIGGER handle_post_report_cascade_trigger
  BEFORE DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_report_cascade_delete('post');

DROP TRIGGER IF EXISTS handle_comment_report_cascade_trigger ON comments;
CREATE TRIGGER handle_comment_report_cascade_trigger
  BEFORE DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_report_cascade_delete('comment'); 