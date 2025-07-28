import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import fs from 'fs'
import path from 'path'

export interface MigrationMetadata {
  version: string
  name: string
  description: string
  timestamp: Date
  upScript: string
  downScript?: string
  author?: string
  dependencies?: string[]
}

export interface MigrationRecord {
  id: string
  version: string
  name: string
  applied_at: Date
  checksum: string
  success: boolean
  error_message?: string
}

export interface MigrationResult {
  success: boolean
  version: string
  name: string
  error?: string
  executionTime?: number
}

const MIGRATIONS_DIR = path.join(process.cwd(), 'src', 'lib', 'migrations')

// Execute SQL directly without relying on exec_sql RPC function
async function executeSQL(supabase: any, sql: string): Promise<void> {
  try {
    // Try using exec_sql RPC function first
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql })
    if (!rpcError) {
      return
    }
  } catch (error) {
    // exec_sql function doesn't exist, try alternative approach
  }

  // If exec_sql doesn't work, use PostgreSQL REST API directly
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`SQL execution failed: ${response.status} ${errorText}`)
    }
  } catch (error) {
    // Last resort: Execute individual SQL statements
    const statements = sql.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      const trimmed = statement.trim()
      if (!trimmed) continue
      
      if (trimmed.toUpperCase().startsWith('CREATE TABLE')) {
        // Handle CREATE TABLE statements
        await createTableDirectly(supabase, trimmed)
      } else if (trimmed.toUpperCase().startsWith('CREATE INDEX')) {
        // Handle CREATE INDEX statements  
        await createIndexDirectly(supabase, trimmed)
      } else {
        throw new Error(`Cannot execute SQL statement without exec_sql function: ${trimmed}`)
      }
    }
  }
}

// Create table directly using Supabase client
async function createTableDirectly(supabase: any, createTableSQL: string): Promise<void> {
  // This is a simplified approach - in production, you'd want to parse the SQL more carefully
  console.log('⚠️  Creating table directly (limited functionality):', createTableSQL.substring(0, 50) + '...')
  throw new Error('Direct table creation not implemented - please create tables manually or use exec_sql function')
}

// Create index directly using Supabase client  
async function createIndexDirectly(supabase: any, createIndexSQL: string): Promise<void> {
  console.log('⚠️  Creating index directly (limited functionality):', createIndexSQL.substring(0, 50) + '...')
  throw new Error('Direct index creation not implemented - please create indexes manually or use exec_sql function')
}

// Enhanced migration file parser that supports up/down syntax
export function parseMigrationFile(filePath: string): MigrationMetadata {
  const content = fs.readFileSync(filePath, 'utf8')
  const fileName = path.basename(filePath, '.sql')
  
  // Extract metadata from comments at the top of the file
  const lines = content.split('\n')
  let version = ''
  let name = fileName
  let description = ''
  let author = ''
  let dependencies: string[] = []
  
  // Parse metadata from comments
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('--')) break
    
    if (trimmed.includes('Version:')) {
      version = trimmed.replace(/.*Version:\s*/, '').trim()
    } else if (trimmed.includes('Description:') || trimmed.includes('Migration:')) {
      description = trimmed.replace(/.*(?:Description|Migration):\s*/, '').trim()
    } else if (trimmed.includes('Author:')) {
      author = trimmed.replace(/.*Author:\s*/, '').trim()
    } else if (trimmed.includes('Depends:')) {
      dependencies = trimmed.replace(/.*Depends:\s*/, '').split(',').map(d => d.trim())
    }
  }
  
  // Extract version from filename if not in comments (e.g., "001_user_profile_resume.sql")
  if (!version) {
    const versionMatch = fileName.match(/^(\d+)/)
    version = versionMatch ? versionMatch[1] : fileName
  }
  
  // Split up and down migrations
  const upDownSplit = content.split(/^\s*--\s*DOWN\s*$/m)
  const upScript = upDownSplit[0].trim()
  const downScript = upDownSplit[1]?.trim()
  
  return {
    version,
    name,
    description: description || `Migration ${version}`,
    timestamp: fs.statSync(filePath).mtime,
    upScript,
    downScript,
    author,
    dependencies,
  }
}

// Get all migration files in the migrations directory
export function getMigrationFiles(): MigrationMetadata[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory does not exist: ${MIGRATIONS_DIR}`)
  }
  
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort()
  
  return files.map(file => {
    const filePath = path.join(MIGRATIONS_DIR, file)
    return parseMigrationFile(filePath)
  })
}

// Create the migration tracking table if it doesn't exist
export async function ensureMigrationTable(supabase: any): Promise<void> {
  try {
    // Try to create the table using direct SQL execution
    const { error: tableError } = await supabase
      .from('schema_migrations')
      .select('id')
      .limit(1)
    
    // If table doesn't exist, create it
    if (tableError && tableError.code === 'PGRST116') {
      console.log('📋 Creating schema_migrations table...')
      await executeSQL(supabase, `
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
      `)
      console.log('✅ Schema migrations table created')
    }
  } catch (error) {
    throw new Error(`Failed to ensure migration table: ${error}`)
  }
}


// Get list of applied migrations
export async function getAppliedMigrations(supabase: any): Promise<MigrationRecord[]> {
  const { data, error } = await supabase
    .from('schema_migrations')
    .select('*')
    .order('version', { ascending: true })
  
  if (error) {
    throw new Error(`Failed to fetch applied migrations: ${error.message || error.toString() || 'Unknown error'}`)
  }
  
  return data || []
}

// Calculate checksum for migration content
function calculateChecksum(content: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16)
}

// Apply a single migration
export async function applyMigration(supabase: any, migration: MigrationMetadata): Promise<MigrationResult> {
  const startTime = Date.now()
  const checksum = calculateChecksum(migration.upScript)
  
  try {
    console.log(`📦 Applying migration ${migration.version}: ${migration.name}`)
    
    // Execute the migration SQL using our improved executeSQL function
    await executeSQL(supabase, migration.upScript)
    
    const executionTime = Date.now() - startTime
    
    // Record the successful migration
    const { error: recordError } = await supabase
      .from('schema_migrations')
      .insert({
        version: migration.version,
        name: migration.name,
        checksum,
        success: true,
        execution_time_ms: executionTime,
      })
    
    if (recordError) {
      console.warn(`Warning: Failed to record migration: ${recordError.message}`)
    }
    
    console.log(`✅ Migration ${migration.version} applied successfully (${executionTime}ms)`)
    
    return {
      success: true,
      version: migration.version,
      name: migration.name,
      executionTime,
    }
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // Record the failed migration
    try {
      await supabase
        .from('schema_migrations')
        .insert({
          version: migration.version,
          name: migration.name,
          checksum,
          success: false,
          error_message: errorMessage,
          execution_time_ms: executionTime,
        })
    } catch (recordError) {
      console.warn(`Warning: Failed to record failed migration: ${recordError}`)
    }
    
    console.error(`❌ Migration ${migration.version} failed: ${errorMessage}`)
    
    return {
      success: false,
      version: migration.version,
      name: migration.name,
      error: errorMessage,
      executionTime,
    }
  }
}

// Rollback a single migration
export async function rollbackMigration(supabase: any, migration: MigrationMetadata): Promise<MigrationResult> {
  if (!migration.downScript) {
    throw new Error(`Migration ${migration.version} does not have a rollback script`)
  }
  
  const startTime = Date.now()
  
  try {
    console.log(`🔄 Rolling back migration ${migration.version}: ${migration.name}`)
    
    // Execute the rollback SQL using our improved executeSQL function
    await executeSQL(supabase, migration.downScript)
    
    // Remove the migration record
    const { error: removeError } = await supabase
      .from('schema_migrations')
      .delete()
      .eq('version', migration.version)
    
    if (removeError) {
      console.warn(`Warning: Failed to remove migration record: ${removeError.message}`)
    }
    
    const executionTime = Date.now() - startTime
    console.log(`✅ Migration ${migration.version} rolled back successfully (${executionTime}ms)`)
    
    return {
      success: true,
      version: migration.version,
      name: migration.name,
      executionTime,
    }
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    console.error(`❌ Rollback of migration ${migration.version} failed: ${errorMessage}`)
    
    return {
      success: false,
      version: migration.version,
      name: migration.name,
      error: errorMessage,
      executionTime,
    }
  }
}

// Run all pending migrations
export async function runMigrations(targetVersion?: string): Promise<MigrationResult[]> {
  console.log('🚀 Starting database migration process')
  console.log('===================================')
  
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const results: MigrationResult[] = []
  
  try {
    // Ensure migration tracking table exists
    await ensureMigrationTable(supabase)
    
    // Get all migration files
    const availableMigrations = getMigrationFiles()
    console.log(`📁 Found ${availableMigrations.length} migration files`)
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations(supabase)
    const appliedVersions = new Set(appliedMigrations.filter(m => m.success).map(m => m.version))
    
    console.log(`📋 ${appliedVersions.size} migrations already applied`)
    
    // Filter to pending migrations
    let pendingMigrations = availableMigrations.filter(m => !appliedVersions.has(m.version))
    
    // If target version specified, only run up to that version
    if (targetVersion) {
      pendingMigrations = pendingMigrations.filter(m => m.version <= targetVersion)
      console.log(`🎯 Target version: ${targetVersion}`)
    }
    
    if (pendingMigrations.length === 0) {
      console.log('✨ No pending migrations to apply')
      return results
    }
    
    console.log(`📦 ${pendingMigrations.length} migrations to apply:`)
    pendingMigrations.forEach(m => {
      console.log(`   - ${m.version}: ${m.name}`)
    })
    
    // Apply migrations in order
    for (const migration of pendingMigrations) {
      const result = await applyMigration(supabase, migration)
      results.push(result)
      
      if (!result.success) {
        console.error(`💥 Migration process stopped due to failure in ${migration.version}`)
        break
      }
    }
    
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    console.log(`\n📊 Migration Summary:`)
    console.log(`   ✅ Successful: ${successful}`)
    console.log(`   ❌ Failed: ${failed}`)
    
    if (failed === 0) {
      console.log('🎉 All migrations applied successfully!')
    }
    
  } catch (error) {
    console.error('💥 Migration process failed:', error)
    throw error
  }
  
  return results
}

// Rollback migrations to a specific version
export async function rollbackToVersion(targetVersion: string): Promise<MigrationResult[]> {
  console.log(`🔄 Rolling back database to version ${targetVersion}`)
  console.log('==========================================')
  
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const results: MigrationResult[] = []
  
  try {
    // Get all migration files
    const availableMigrations = getMigrationFiles()
    const migrationMap = new Map(availableMigrations.map(m => [m.version, m]))
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations(supabase)
    
    // Find migrations to rollback (those with version > targetVersion)
    const toRollback = appliedMigrations
      .filter(m => m.success && m.version > targetVersion)
      .sort((a, b) => b.version.localeCompare(a.version)) // Rollback in reverse order
    
    if (toRollback.length === 0) {
      console.log(`✨ No migrations to rollback to version ${targetVersion}`)
      return results
    }
    
    console.log(`🔄 ${toRollback.length} migrations to rollback:`)
    toRollback.forEach(m => {
      console.log(`   - ${m.version}: ${m.name}`)
    })
    
    // Rollback migrations in reverse order
    for (const appliedMigration of toRollback) {
      const migration = migrationMap.get(appliedMigration.version)
      if (!migration) {
        console.warn(`⚠️  Migration file not found for version ${appliedMigration.version}`)
        continue
      }
      
      const result = await rollbackMigration(supabase, migration)
      results.push(result)
      
      if (!result.success) {
        console.error(`💥 Rollback process stopped due to failure in ${migration.version}`)
        break
      }
    }
    
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    console.log(`\n📊 Rollback Summary:`)
    console.log(`   ✅ Successful: ${successful}`)
    console.log(`   ❌ Failed: ${failed}`)
    
    if (failed === 0) {
      console.log(`🎉 Successfully rolled back to version ${targetVersion}!`)
    }
    
  } catch (error) {
    console.error('💥 Rollback process failed:', error)
    throw error
  }
  
  return results
}

// CLI interface
export async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  try {
    switch (command) {
      case 'up':
        await runMigrations(args[1])
        break
      case 'down':
        if (!args[1]) {
          console.error('❌ Target version required for rollback')
          process.exit(1)
        }
        await rollbackToVersion(args[1])
        break
      case 'status':
        await showMigrationStatus()
        break
      default:
        console.log('Usage:')
        console.log('  tsx src/scripts/runMigrations.ts up [target_version]')
        console.log('  tsx src/scripts/runMigrations.ts down <target_version>')
        console.log('  tsx src/scripts/runMigrations.ts status')
        break
    }
  } catch (error) {
    console.error('💥 Command failed:', error)
    process.exit(1)
  }
}

// Show migration status
export async function showMigrationStatus(): Promise<void> {
  console.log('📋 Database Migration Status')
  console.log('============================')
  
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  try {
    const availableMigrations = getMigrationFiles()
    const appliedMigrations = await getAppliedMigrations(supabase)
    const appliedVersions = new Set(appliedMigrations.filter(m => m.success).map(m => m.version))
    
    console.log(`Total migration files: ${availableMigrations.length}`)
    console.log(`Applied migrations: ${appliedVersions.size}`)
    console.log(`Pending migrations: ${availableMigrations.length - appliedVersions.size}`)
    
    console.log('\nMigration Details:')
    for (const migration of availableMigrations) {
      const isApplied = appliedVersions.has(migration.version)
      const status = isApplied ? '✅ Applied' : '⏳ Pending'
      console.log(`  ${status} ${migration.version}: ${migration.name}`)
    }
    
  } catch (error) {
    console.error('❌ Failed to get migration status:', error)
  }
}

// Run CLI if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}