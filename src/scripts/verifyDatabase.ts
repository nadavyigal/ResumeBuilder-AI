#!/usr/bin/env tsx
/**
 * Database verification script
 * Checks if all required tables and functions exist after database initialization
 */

import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

interface TableStatus {
  tablename: string
  exists: boolean
  error?: string
}

interface FunctionStatus {
  functionname: string
  exists: boolean
  error?: string
}

// Check if a table exists and is accessible
async function checkTableExists(tableName: string): Promise<TableStatus> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    return {
      tablename: tableName,
      exists: !error,
      error: error?.message
    }
  } catch (error) {
    return {
      tablename: tableName,
      exists: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// Check if a function exists
async function checkFunctionExists(functionName: string, testSql?: string): Promise<FunctionStatus> {
  try {
    const testQuery = testSql || 'SELECT 1'
    const { error } = await supabase.rpc(functionName, { sql: testQuery })
    
    return {
      functionname: functionName,
      exists: !error,
      error: error?.message
    }
  } catch (error) {
    return {
      functionname: functionName,
      exists: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// Main verification function
async function verifyDatabase(): Promise<void> {
  console.log('🔍 Database Verification Report')
  console.log('===============================')
  console.log('')

  // Check required tables
  const requiredTables = ['profiles', 'resumes', 'chat_interactions', 'job_scrapings']
  const tableStatuses: TableStatus[] = []

  console.log('📋 Checking Tables:')
  for (const tableName of requiredTables) {
    const status = await checkTableExists(tableName)
    tableStatuses.push(status)
    
    const statusEmoji = status.exists ? '✅' : '❌'
    console.log(`   ${statusEmoji} ${status.tablename}${status.error ? ` (${status.error})` : ''}`)
  }

  // Check required functions
  const requiredFunctions = [
    { name: 'exec_sql', testSql: 'SELECT 1' },
    { name: 'get_table_indexes', testSql: undefined },
    { name: 'get_rls_status', testSql: undefined },
    { name: 'get_table_constraints', testSql: undefined }
  ]
  const functionStatuses: FunctionStatus[] = []

  console.log('')
  console.log('🔧 Checking Functions:')
  for (const func of requiredFunctions) {
    const status = await checkFunctionExists(func.name, func.testSql)
    functionStatuses.push(status)
    
    const statusEmoji = status.exists ? '✅' : '❌'
    console.log(`   ${statusEmoji} ${status.functionname}${status.error ? ` (${status.error})` : ''}`)
  }

  // Check RLS policies
  console.log('')
  console.log('🔒 Checking RLS Policies:')
  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase
        .from('pg_policies')
        .select('policyname')
        .eq('tablename', tableName)
      
      if (error) {
        console.log(`   ❌ ${tableName}: Could not check policies (${error.message})`)
      } else {
        const policyCount = data?.length || 0
        const statusEmoji = policyCount > 0 ? '✅' : '❌'
        console.log(`   ${statusEmoji} ${tableName}: ${policyCount} policies`)
      }
    } catch (error) {
      console.log(`   ❌ ${tableName}: Error checking policies`)
    }
  }

  // Summary
  console.log('')
  console.log('📊 Summary:')
  const tablesOk = tableStatuses.filter(t => t.exists).length
  const functionsOk = functionStatuses.filter(f => f.exists).length
  
  console.log(`   Tables: ${tablesOk}/${requiredTables.length} working`)
  console.log(`   Functions: ${functionsOk}/${requiredFunctions.length} working`)

  const allTablesOk = tablesOk === requiredTables.length
  const allFunctionsOk = functionsOk === requiredFunctions.length

  console.log('')
  if (allTablesOk && allFunctionsOk) {
    console.log('🎉 Database verification PASSED!')
    console.log('✅ All required tables and functions are working correctly')
    console.log('')
    console.log('Next steps:')
    console.log('1. Run: npm run validate:schema')
    console.log('2. Run: npm run test:supabase')
  } else {
    console.log('❌ Database verification FAILED!')
    console.log('')
    if (!allTablesOk) {
      console.log('Missing tables need to be created. Run the database-bootstrap.sql in Supabase SQL Editor.')
    }
    if (!allFunctionsOk) {
      console.log('Missing functions need to be created. Run the database-bootstrap.sql in Supabase SQL Editor.')
    }
    process.exit(1)
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  verifyDatabase().catch(error => {
    console.error('💥 Verification failed:', error)
    process.exit(1)
  })
}

export { verifyDatabase }