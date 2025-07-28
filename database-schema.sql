-- =====================================================
-- Complete ResumeBuilder AI Database Setup Script
-- This script creates ALL required tables and functions
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

-- Step 2: Create profiles table (from migration 001)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT
);

-- Step 3: Create resumes table (from migration 001)
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL
);

-- Step 4: Create chat_interactions table (from migration 003)
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

-- Step 5: Create job_scrapings table (from migration 004)
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

-- Step 6: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_scrapings ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Step 8: Create policies for resumes
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
CREATE POLICY "Users can view own resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public resumes" ON resumes;
CREATE POLICY "Users can view public resumes" ON resumes
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can create own resumes" ON resumes;
CREATE POLICY "Users can create own resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
CREATE POLICY "Users can update own resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;
CREATE POLICY "Users can delete own resumes" ON resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Create policies for chat_interactions
DROP POLICY IF EXISTS "Users can view their own chat interactions" ON chat_interactions;
CREATE POLICY "Users can view their own chat interactions" ON chat_interactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own chat interactions" ON chat_interactions;
CREATE POLICY "Users can insert their own chat interactions" ON chat_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 10: Create policies for job_scrapings
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

-- Step 11: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_is_public ON resumes(is_public);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_user_id ON chat_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_created_at ON chat_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_step ON chat_interactions(step);
CREATE INDEX IF NOT EXISTS idx_job_scrapings_user_id ON job_scrapings(user_id);
CREATE INDEX IF NOT EXISTS idx_job_scrapings_url ON job_scrapings(url);
CREATE INDEX IF NOT EXISTS idx_job_scrapings_created_at ON job_scrapings(created_at);
CREATE INDEX IF NOT EXISTS idx_job_scrapings_source ON job_scrapings(source);

-- Step 12: Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 14: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 15: Create triggers for automatic timestamp updates
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

-- Step 16: Create helper functions for schema validation (from migration 005)
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

-- Step 17: Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_table_indexes(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rls_status(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_constraints(text) TO authenticated;

-- Step 18: Create migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(64),
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON schema_migrations(applied_at);

-- Step 19: Insert migration records
INSERT INTO schema_migrations (version, name, success) VALUES 
('001', 'user_profile_resume', true),
('002', 'fix_rls_policies', true),
('003', 'chat_interactions', true),
('004', 'job_scrapings', true),
('005', 'schema_validation_helpers', true)
ON CONFLICT (version) DO NOTHING;

-- Step 20: Add table and column comments for documentation
COMMENT ON TABLE profiles IS 'User profile information linked to auth.users';
COMMENT ON TABLE resumes IS 'User-created resumes with content and privacy settings';
COMMENT ON TABLE chat_interactions IS 'Stores user interactions with the AI chat assistant';
COMMENT ON TABLE job_scrapings IS 'Stores scraped job posting information for user analytics and caching';

-- Step 21: Verify tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'profiles table was not created successfully';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'resumes') THEN
        RAISE EXCEPTION 'resumes table was not created successfully';
    END IF;
    
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
-- This creates all required tables, functions, and policies
-- =====================================================