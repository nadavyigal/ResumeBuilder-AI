#!/usr/bin/env tsx
/**
 * Database initialization script
 * Creates the required database tables manually to bootstrap the system
 */

import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

interface TableCheck {
  tablename: string
  exists: boolean
  error?: string
}

// Check if a table exists
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    // If no error, table exists
    return !error
  } catch (error) {
    return false
  }
}

// Create profiles table
async function createProfilesTable(): Promise<void> {
  console.log('📋 Creating profiles table...')
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Create profiles table
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        email TEXT NOT NULL,
        full_name TEXT,
        avatar_url TEXT
      );

      -- Enable RLS
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
      CREATE POLICY "profiles_select_own" ON profiles
        FOR SELECT USING (auth.uid() = id);

      DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
      CREATE POLICY "profiles_insert_own" ON profiles
        FOR INSERT WITH CHECK (auth.uid() = id);

      DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
      CREATE POLICY "profiles_update_own" ON profiles
        FOR UPDATE USING (auth.uid() = id);

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    `
  })
  
  if (error) {
    throw new Error(`Failed to create profiles table: ${error.message}`)
  }
  
  console.log('✅ Profiles table created successfully')
}

// Create resumes table
async function createResumesTable(): Promise<void> {
  console.log('📋 Creating resumes table...')
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Create resumes table
      CREATE TABLE IF NOT EXISTS resumes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL,
        content JSONB NOT NULL DEFAULT '{}',
        is_public BOOLEAN DEFAULT false NOT NULL
      );

      -- Enable RLS
      ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      DROP POLICY IF EXISTS "resumes_select_own" ON resumes;
      CREATE POLICY "resumes_select_own" ON resumes
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "resumes_select_public" ON resumes;
      CREATE POLICY "resumes_select_public" ON resumes
        FOR SELECT USING (is_public = true);

      DROP POLICY IF EXISTS "resumes_insert_own" ON resumes;
      CREATE POLICY "resumes_insert_own" ON resumes
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "resumes_update_own" ON resumes;
      CREATE POLICY "resumes_update_own" ON resumes
        FOR UPDATE USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "resumes_delete_own" ON resumes;
      CREATE POLICY "resumes_delete_own" ON resumes
        FOR DELETE USING (auth.uid() = user_id);

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
      CREATE INDEX IF NOT EXISTS idx_resumes_is_public ON resumes(is_public);
      CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at);
    `
  })
  
  if (error) {
    throw new Error(`Failed to create resumes table: ${error.message}`)
  }
  
  console.log('✅ Resumes table created successfully')
}

// Create chat_interactions table
async function createChatInteractionsTable(): Promise<void> {
  console.log('📋 Creating chat_interactions table...')
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Create chat_interactions table
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

      -- Enable RLS
      ALTER TABLE chat_interactions ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      DROP POLICY IF EXISTS "Users can view their own chat interactions" ON chat_interactions;
      CREATE POLICY "Users can view their own chat interactions" ON chat_interactions
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert their own chat interactions" ON chat_interactions;
      CREATE POLICY "Users can insert their own chat interactions" ON chat_interactions
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_chat_interactions_user_id ON chat_interactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_interactions_created_at ON chat_interactions(created_at);
      CREATE INDEX IF NOT EXISTS idx_chat_interactions_step ON chat_interactions(step);
    `
  })
  
  if (error) {
    throw new Error(`Failed to create chat_interactions table: ${error.message}`)
  }
  
  console.log('✅ Chat interactions table created successfully')
}

// Create job_scrapings table
async function createJobScrapingsTable(): Promise<void> {
  console.log('📋 Creating job_scrapings table...')
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
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

      -- Enable RLS
      ALTER TABLE job_scrapings ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
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

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_job_scrapings_user_id ON job_scrapings(user_id);
      CREATE INDEX IF NOT EXISTS idx_job_scrapings_url ON job_scrapings(url);
      CREATE INDEX IF NOT EXISTS idx_job_scrapings_created_at ON job_scrapings(created_at);
      CREATE INDEX IF NOT EXISTS idx_job_scrapings_source ON job_scrapings(source);
    `
  })
  
  if (error) {
    throw new Error(`Failed to create job_scrapings table: ${error.message}`)
  }
  
  console.log('✅ Job scrapings table created successfully')
}

// Create the exec_sql function needed for migrations
async function createExecSqlFunction(): Promise<void> {
  console.log('🔧 Creating exec_sql function...')
  
  // Try to create it directly first
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create function for executing dynamic SQL (for migrations)
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void AS $$
        BEGIN
            EXECUTE sql;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Grant execute permissions to authenticated users
        GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
      `
    })
    
    if (error) {
      console.log('⚠️  exec_sql function may not exist yet, attempting to create it...')
      // The function doesn't exist, so we can't use rpc to create it
      // This is the bootstrapping problem - we need it to exist first
      throw new Error('Cannot create exec_sql function without existing exec_sql function')
    }
    
    console.log('✅ exec_sql function created successfully')
  } catch (error) {
    console.log('⚠️  Could not create exec_sql function via RPC, it may need to be created manually in Supabase dashboard')
    console.log('SQL to run manually:')
    console.log(`
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
          EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
    `)
  }
}

// Create helper functions from migration 005
async function createHelperFunctions(): Promise<void> {
  console.log('🔧 Creating helper functions...')
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Create function to get table indexes
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
    `
  })
  
  if (error) {
    throw new Error(`Failed to create helper functions: ${error.message}`)
  }
  
  console.log('✅ Helper functions created successfully')
}

// Main initialization function
async function initializeDatabase(): Promise<void> {
  console.log('🚀 Starting database initialization')
  console.log('==================================')
  
  try {
    // First create the exec_sql function if possible
    await createExecSqlFunction()
    
    // Check which tables already exist
    const tablesToCheck = ['profiles', 'resumes', 'chat_interactions', 'job_scrapings']
    const tableStatus: TableCheck[] = []
    
    for (const tableName of tablesToCheck) {
      const exists = await checkTableExists(tableName)
      tableStatus.push({ tablename: tableName, exists })
      console.log(`📋 Table ${tableName}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`)
    }
    
    // Create missing tables
    const missingTables = tableStatus.filter(t => !t.exists)
    
    if (missingTables.length === 0) {
      console.log('✨ All required tables already exist!')
    } else {
      console.log(`📦 Creating ${missingTables.length} missing tables...`)
      
      for (const table of missingTables) {
        switch (table.tablename) {
          case 'profiles':
            await createProfilesTable()
            break
          case 'resumes':
            await createResumesTable()
            break
          case 'chat_interactions':
            await createChatInteractionsTable()
            break
          case 'job_scrapings':
            await createJobScrapingsTable()
            break
        }
      }
    }
    
    // Create helper functions
    await createHelperFunctions()
    
    console.log('')
    console.log('🎉 Database initialization completed successfully!')
    console.log('✅ All required tables and functions are now available')
    
  } catch (error) {
    console.error('💥 Database initialization failed:', error)
    throw error
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { initializeDatabase }