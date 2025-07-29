-- Migration: Add helper functions for schema validation
-- Version: 005
-- Date: 2025-07-25

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

-- Create function for executing dynamic SQL (for migrations)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
    EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_table_indexes(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rls_status(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_constraints(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;

-- Add comments
COMMENT ON FUNCTION get_table_indexes(text) IS 'Returns detailed index information for a given table';
COMMENT ON FUNCTION get_rls_status(text) IS 'Returns RLS status and policies for a given table';
COMMENT ON FUNCTION get_table_constraints(text) IS 'Returns constraint information for a given table';
COMMENT ON FUNCTION exec_sql(text) IS 'Executes dynamic SQL for migrations';

-- DOWN
-- Rollback script for migration 005

-- Drop functions
DROP FUNCTION IF EXISTS exec_sql(text);
DROP FUNCTION IF EXISTS get_table_constraints(text);
DROP FUNCTION IF EXISTS get_rls_status(text);
DROP FUNCTION IF EXISTS get_table_indexes(text);