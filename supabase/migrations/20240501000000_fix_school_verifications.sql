-- Add created_at column with default timestamp
ALTER TABLE school_verifications
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Reset verified_at to null for pending status
UPDATE school_verifications
SET verified_at = NULL
WHERE status = 'pending';

-- Enable row level security
ALTER TABLE school_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own verifications" ON school_verifications;
DROP POLICY IF EXISTS "Users can insert their own verifications" ON school_verifications;
DROP POLICY IF EXISTS "Users can update their own verifications" ON school_verifications;

-- Add RLS policies
CREATE POLICY "Users can view their own verifications"
ON school_verifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verifications"
ON school_verifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verifications"
ON school_verifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id); 