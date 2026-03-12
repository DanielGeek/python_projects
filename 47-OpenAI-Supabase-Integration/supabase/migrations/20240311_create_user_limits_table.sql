-- Create user_limits table to track usage for free tier users
-- This table stores document upload and transcript extraction counts

CREATE TABLE IF NOT EXISTS user_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  documents_used INTEGER DEFAULT 0 NOT NULL CHECK (documents_used >= 0),
  transcripts_used INTEGER DEFAULT 0 NOT NULL CHECK (transcripts_used >= 0),
  documents_limit INTEGER DEFAULT 3 NOT NULL,
  transcripts_limit INTEGER DEFAULT 3 NOT NULL,
  is_pro BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_limits_user_id ON user_limits(user_id);

-- Create index on is_pro for filtering pro users
CREATE INDEX IF NOT EXISTS idx_user_limits_is_pro ON user_limits(is_pro);

-- Enable Row Level Security
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own limits
CREATE POLICY "Users can view own limits"
  ON user_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own limits (for incrementing usage)
CREATE POLICY "Users can update own limits"
  ON user_limits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own limits (auto-creation on first use)
CREATE POLICY "Users can insert own limits"
  ON user_limits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER trigger_update_user_limits_updated_at
  BEFORE UPDATE ON user_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_user_limits_updated_at();

-- Comment on table
COMMENT ON TABLE user_limits IS 'Tracks usage limits for documents and transcripts per user';
COMMENT ON COLUMN user_limits.documents_used IS 'Number of documents uploaded by user';
COMMENT ON COLUMN user_limits.transcripts_used IS 'Number of transcripts extracted by user';
COMMENT ON COLUMN user_limits.documents_limit IS 'Maximum documents allowed (3 for free, -1 for unlimited)';
COMMENT ON COLUMN user_limits.transcripts_limit IS 'Maximum transcripts allowed (3 for free, -1 for unlimited)';
COMMENT ON COLUMN user_limits.is_pro IS 'Whether user has pro subscription (unlimited usage)';
