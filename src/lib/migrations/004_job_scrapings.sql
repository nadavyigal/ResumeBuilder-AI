-- Migration: Add job_scrapings table for tracking scraped job postings
-- Version: 004
-- Date: 2025-07-21

-- Create job_scrapings table
CREATE TABLE IF NOT EXISTS job_scrapings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    company TEXT,
    location TEXT,
    description TEXT,
    source VARCHAR(50),
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_scrapings_user_id ON job_scrapings(user_id);
CREATE INDEX IF NOT EXISTS idx_job_scrapings_url ON job_scrapings(url);
CREATE INDEX IF NOT EXISTS idx_job_scrapings_created_at ON job_scrapings(created_at);
CREATE INDEX IF NOT EXISTS idx_job_scrapings_source ON job_scrapings(source);

-- Enable RLS
ALTER TABLE job_scrapings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own job scrapings" ON job_scrapings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job scrapings" ON job_scrapings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job scrapings" ON job_scrapings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job scrapings" ON job_scrapings
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_job_scrapings_updated_at 
    BEFORE UPDATE ON job_scrapings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE job_scrapings IS 'Stores scraped job posting information for user analytics and caching';
COMMENT ON COLUMN job_scrapings.user_id IS 'Reference to the user who requested this scraping';
COMMENT ON COLUMN job_scrapings.url IS 'Original URL of the job posting';
COMMENT ON COLUMN job_scrapings.title IS 'Extracted job title';
COMMENT ON COLUMN job_scrapings.company IS 'Extracted company name';
COMMENT ON COLUMN job_scrapings.location IS 'Extracted job location';
COMMENT ON COLUMN job_scrapings.description IS 'Extracted job description content';
COMMENT ON COLUMN job_scrapings.source IS 'Source website (linkedin, indeed, etc)';
COMMENT ON COLUMN job_scrapings.scraped_at IS 'When the scraping was performed';

-- DOWN
-- Rollback script for migration 004

-- Drop trigger
DROP TRIGGER IF EXISTS update_job_scrapings_updated_at ON job_scrapings;

-- Drop policies
DROP POLICY IF EXISTS "Users can delete their own job scrapings" ON job_scrapings;
DROP POLICY IF EXISTS "Users can update their own job scrapings" ON job_scrapings;
DROP POLICY IF EXISTS "Users can insert their own job scrapings" ON job_scrapings;
DROP POLICY IF EXISTS "Users can view their own job scrapings" ON job_scrapings;

-- Disable RLS
ALTER TABLE job_scrapings DISABLE ROW LEVEL SECURITY;

-- Drop indexes
DROP INDEX IF EXISTS idx_job_scrapings_source;
DROP INDEX IF EXISTS idx_job_scrapings_created_at;
DROP INDEX IF EXISTS idx_job_scrapings_url;
DROP INDEX IF EXISTS idx_job_scrapings_user_id;

-- Drop table
DROP TABLE IF EXISTS job_scrapings;