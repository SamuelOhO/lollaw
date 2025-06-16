-- Drop existing constraints
ALTER TABLE reports DROP CONSTRAINT IF EXISTS unique_user_target_report;

-- Modify target_id column
ALTER TABLE reports
ALTER COLUMN target_id TYPE INTEGER USING (target_id::text)::integer;

-- Recreate unique constraint
ALTER TABLE reports
ADD CONSTRAINT unique_user_target_report 
UNIQUE (user_id, target_type, target_id); 