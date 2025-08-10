-- =====================================================
-- Complete ResumeBuilder AI Database Setup Script
-- This script resolves ALL 15 Supabase issues
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create the exec_sql function
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
    EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;

-- Step 2: Create chat_interactions table
CREATE TABLE IF NOT EXISTS chat_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    step VARCHAR(50),
    template_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create job_scrapings table
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

-- Step 4: Enable Row Level Security on new tables
ALTER TABLE chat_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_scrapings ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for chat_interactions
DROP POLICY IF EXISTS "Users can view their own chat interactions" ON chat_interactions;
CREATE POLICY "Users can view their own chat interactions" ON chat_interactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own chat interactions" ON chat_interactions;
CREATE POLICY "Users can insert their own chat interactions" ON chat_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 6: Create RLS policies for job_scrapings
DROP POLICY IF EXISTS "Users can view their own job scrapings" ON job_scrapings;
CREATE POLICY "Users can view their own job scrapings" ON job_scrapings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own job scrapings" ON job_scrapings;
CREATE POLICY "Users can insert their own job scrapings" ON job_scrapings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own job scrapings" ON job_scrapings;
CREATE POLICY "Users can update their own job scrapings" ON job_scrapings
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own job scrapings" ON job_scrapings;
CREATE POLICY "Users can delete their own job scrapings" ON job_scrapings
    FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Create indexes for performance
-- chat_interactions indexes
CREATE INDEX IF NOT EXISTS idx_chat_interactions_user_id ON chat_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_created_at ON chat_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_step ON chat_interactions(step);

-- job_scrapings indexes
CREATE INDEX IF NOT EXISTS idx_job_scrapings_user_id ON job_scrapings(user_id);
CREATE INDEX IF NOT EXISTS idx_job_scrapings_url ON job_scrapings(url);
CREATE INDEX IF NOT EXISTS idx_job_scrapings_created_at ON job_scrapings(created_at);
CREATE INDEX IF NOT EXISTS idx_job_scrapings_source ON job_scrapings(source);

-- Step 8: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 9: Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_chat_interactions_updated_at ON chat_interactions;
CREATE TRIGGER update_chat_interactions_updated_at 
    BEFORE UPDATE ON chat_interactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_scrapings_updated_at ON job_scrapings;
CREATE TRIGGER update_job_scrapings_updated_at 
    BEFORE UPDATE ON job_scrapings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Create helper functions for schema validation
CREATE OR REPLACE FUNCTION get_table_indexes(table_name text)
RETURNS TABLE(
    indexname text,
    indexdef text,
    indisunique boolean,
    indisprimary boolean,
    column_names text[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.indexname::text,
        i.indexdef::text,
        idx.indisunique,
        idx.indisprimary,
        ARRAY(
            SELECT a.attname
            FROM pg_attribute a
            WHERE a.attrelid = idx.indrelid
            AND a.attnum = ANY(idx.indkey)
            ORDER BY array_position(idx.indkey, a.attnum)
        ) as column_names
    FROM pg_indexes i
    JOIN pg_class c ON c.relname = i.tablename
    JOIN pg_index idx ON idx.indexrelid = (i.schemaname||'.'||i.indexname)::regclass
    WHERE i.tablename = table_name
    AND i.schemaname = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check RLS status
CREATE OR REPLACE FUNCTION get_rls_status(table_name text)
RETURNS TABLE(
    tablename text,
    rowsecurity boolean,
    policies jsonb
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::text,
        t.rowsecurity,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'policyname', p.policyname,
                        'cmd', p.cmd,
                        'qual', p.qual,
                        'with_check', p.with_check
                    )
                )
                FROM pg_policies p
                WHERE p.tablename = table_name
            ),
            '[]'::jsonb
        ) as policies
    FROM pg_tables t
    WHERE t.tablename = table_name
    AND t.schemaname = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get table constraints
CREATE OR REPLACE FUNCTION get_table_constraints(table_name text)
RETURNS TABLE(
    constraint_name text,
    constraint_type text,
    column_names text[],
    foreign_table text,
    foreign_columns text[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.constraint_name::text,
        tc.constraint_type::text,
        ARRAY(
            SELECT kcu.column_name
            FROM information_schema.key_column_usage kcu
            WHERE kcu.constraint_name = tc.constraint_name
            AND kcu.table_schema = tc.table_schema
            ORDER BY kcu.ordinal_position
        ) as column_names,
        ccu.table_name::text as foreign_table,
        ARRAY(
            SELECT ccu2.column_name
            FROM information_schema.constraint_column_usage ccu2
            WHERE ccu2.constraint_name = tc.constraint_name
            AND ccu2.table_schema = tc.table_schema
            ORDER BY ccu2.column_name
        ) as foreign_columns
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
    WHERE tc.table_name = table_name
    AND tc.table_schema = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_table_indexes(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rls_status(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_constraints(text) TO authenticated;

-- Step 11: Add table and column comments for documentation
COMMENT ON TABLE chat_interactions IS 'Stores user interactions with the AI chat assistant';
COMMENT ON COLUMN chat_interactions.user_id IS 'Reference to the user who had this interaction';
COMMENT ON COLUMN chat_interactions.message IS 'The user message sent to the AI';
COMMENT ON COLUMN chat_interactions.response IS 'The AI response to the user';
COMMENT ON COLUMN chat_interactions.step IS 'The current step in the resume creation process';
COMMENT ON COLUMN chat_interactions.template_id IS 'The template ID if relevant to the conversation';

COMMENT ON TABLE job_scrapings IS 'Stores scraped job posting information for user analytics and caching';
COMMENT ON COLUMN job_scrapings.user_id IS 'Reference to the user who requested this scraping';
COMMENT ON COLUMN job_scrapings.url IS 'Original URL of the job posting';
COMMENT ON COLUMN job_scrapings.title IS 'Extracted job title';
COMMENT ON COLUMN job_scrapings.company IS 'Extracted company name';
COMMENT ON COLUMN job_scrapings.location IS 'Extracted job location';
COMMENT ON COLUMN job_scrapings.description IS 'Extracted job description content';
COMMENT ON COLUMN job_scrapings.source IS 'Source website (linkedin, indeed, etc)';
COMMENT ON COLUMN job_scrapings.scraped_at IS 'When the scraping was performed';

-- Step 12: Verify tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chat_interactions') THEN
        RAISE EXCEPTION 'chat_interactions table was not created successfully';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'job_scrapings') THEN
        RAISE EXCEPTION 'job_scrapings table was not created successfully';
    END IF;
    
    RAISE NOTICE 'All tables created successfully!';
END $$;

-- =====================================================
-- Setup Complete!
-- This should resolve ALL 15 Supabase issues
-- ===================================================== 