-- Modify reports table schema
ALTER TABLE reports
ALTER COLUMN target_id TYPE INTEGER USING target_id::INTEGER;

-- Add check constraint for target_type
ALTER TABLE reports
ADD CONSTRAINT reports_target_type_check
CHECK (target_type IN ('post', 'comment'));

-- Add partial indexes for foreign key references
CREATE INDEX reports_post_target_idx ON reports (target_id)
WHERE target_type = 'post';

CREATE INDEX reports_comment_target_idx ON reports (target_id)
WHERE target_type = 'comment'; 