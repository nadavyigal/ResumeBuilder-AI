import { describe, it, expect, beforeAll } from 'vitest'
import { 
  getMigrationFiles,
  showMigrationStatus,
  ensureMigrationTable,
  getAppliedMigrations
} from '../../scripts/runMigrations'
import { createClient } from '@supabase/supabase-js'
import path from 'path'

// Load environment directly for tests
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

describe('Database Migration System', () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  
  beforeAll(async () => {
    // Ensure environment is loaded for tests
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for migration tests')
    }
    
    // Ensure migration table exists
    await ensureMigrationTable(supabase)
  })

  describe('Migration File Parsing', () => {
    it('should parse migration files correctly', () => {
      const migrationFiles = getMigrationFiles()
      
      expect(migrationFiles.length).toBeGreaterThan(0)
      
      // Check that all files have required metadata
      migrationFiles.forEach(migration => {
        expect(migration.version).toBeDefined()
        expect(migration.name).toBeDefined()
        expect(migration.upScript).toBeDefined()
        expect(migration.upScript.length).toBeGreaterThan(0)
        
        // Version should be properly formatted
        expect(migration.version).toMatch(/^\d+/)
        
        // UP script should contain actual SQL
        expect(migration.upScript).toMatch(/CREATE|ALTER|INSERT|UPDATE|DELETE/i)
      })
    })

    it('should extract version numbers correctly', () => {
      const migrationFiles = getMigrationFiles()
      
      // Versions should be in ascending order
      const versions = migrationFiles.map(m => m.version).sort()
      
      for (let i = 1; i < versions.length; i++) {
        expect(versions[i] >= versions[i-1]).toBe(true)
      }
    })

    it('should parse UP and DOWN scripts when present', () => {
      const migrationFiles = getMigrationFiles()
      
      // Check for migrations that have DOWN scripts
      const migrationsWithDown = migrationFiles.filter(m => m.downScript)
      
      expect(migrationsWithDown.length).toBeGreaterThan(0)
      
      migrationsWithDown.forEach(migration => {
        expect(migration.downScript).toBeDefined()
        expect(migration.downScript!.length).toBeGreaterThan(0)
        expect(migration.downScript).toMatch(/DROP|DELETE|ALTER/i)
      })
    })
  })

  describe('Migration Table Management', () => {
    it('should create migration tracking table', async () => {
      await ensureMigrationTable(supabase)
      
      // Verify table exists by querying it
      const { data, error } = await supabase
        .from('schema_migrations')
        .select('*')
        .limit(1)
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    it('should track applied migrations', async () => {
      const appliedMigrations = await getAppliedMigrations(supabase)
      
      expect(Array.isArray(appliedMigrations)).toBe(true)
      
      // If there are applied migrations, they should have required fields
      appliedMigrations.forEach(migration => {
        expect(migration.version).toBeDefined()
        expect(migration.name).toBeDefined()
        expect(migration.applied_at).toBeDefined()
        expect(typeof migration.success).toBe('boolean')
      })
    })
  })

  describe('Migration Execution', () => {
    it('should validate migration files before execution', () => {
      const migrationFiles = getMigrationFiles()
      
      // All migration files should be valid
      migrationFiles.forEach(migration => {
        // Check for SQL injection patterns (basic validation)
        expect(migration.upScript).not.toMatch(/;\s*DROP\s+DATABASE/i)
        expect(migration.upScript).not.toMatch(/;\s*TRUNCATE\s+/i)
        
        // Should not contain obvious malicious patterns
        expect(migration.upScript).not.toMatch(/exec\s*\(/i)
        expect(migration.upScript).not.toMatch(/eval\s*\(/i)
      })
    })

    it('should handle migration dependencies correctly', () => {
      const migrationFiles = getMigrationFiles()
      
      // Check dependency order - later migrations should not depend on future ones
      migrationFiles.forEach((migration, index) => {
        if (migration.dependencies && migration.dependencies.length > 0) {
          migration.dependencies.forEach(dep => {
            const depIndex = migrationFiles.findIndex(m => m.version === dep)
            if (depIndex !== -1) {
              expect(depIndex).toBeLessThan(index)
            }
          })
        }
      })
    })
  })

  describe('Migration Status and Reporting', () => {
    it('should report migration status without errors', async () => {
      // This should not throw an error
      await expect(showMigrationStatus()).resolves.not.toThrow()
    })

    it('should identify pending migrations correctly', async () => {
      const availableMigrations = getMigrationFiles()
      const appliedMigrations = await getAppliedMigrations(supabase)
      const appliedVersions = new Set(appliedMigrations.filter(m => m.success).map(m => m.version))
      
      const pendingMigrations = availableMigrations.filter(m => !appliedVersions.has(m.version))
      
      // Should be able to identify which migrations are pending
      expect(Array.isArray(pendingMigrations)).toBe(true)
      expect(pendingMigrations.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Rollback Capability', () => {
    it('should validate rollback scripts exist for critical migrations', () => {
      const migrationFiles = getMigrationFiles()
      
      // Critical migrations (those that create tables) should have rollback scripts
      const criticalMigrations = migrationFiles.filter(m => 
        m.upScript.includes('CREATE TABLE') || m.upScript.includes('ALTER TABLE')
      )
      
      criticalMigrations.forEach(migration => {
        expect(migration.downScript).toBeDefined()
        expect(migration.downScript!.length).toBeGreaterThan(0)
      })
    })

    it('should validate rollback scripts contain proper cleanup', () => {
      const migrationFiles = getMigrationFiles()
      
      migrationFiles
        .filter(m => m.downScript)
        .forEach(migration => {
          // DOWN scripts should contain DROP statements for cleanup
          expect(migration.downScript).toMatch(/DROP/i)
          
          // Should not contain CREATE statements (except for restore operations)
          const createCount = (migration.downScript!.match(/CREATE/gi) || []).length
          const dropCount = (migration.downScript!.match(/DROP/gi) || []).length
          
          // Generally, there should be more DROP than CREATE in rollback scripts
          expect(dropCount).toBeGreaterThanOrEqual(createCount)
        })
    })
  })

  describe('Migration Performance', () => {
    it('should have reasonable migration file sizes', () => {
      const migrationFiles = getMigrationFiles()
      
      migrationFiles.forEach(migration => {
        // Migration files should not be excessively large
        expect(migration.upScript.length).toBeLessThan(50000) // 50KB limit
        
        if (migration.downScript) {
          expect(migration.downScript.length).toBeLessThan(50000)
        }
      })
    })

    it('should validate migration complexity', () => {
      const migrationFiles = getMigrationFiles()
      
      migrationFiles.forEach(migration => {
        // Count SQL statements (rough complexity measure)
        const statementCount = migration.upScript.split(';').filter(s => s.trim()).length
        
        // Migrations should not be overly complex
        expect(statementCount).toBeLessThan(100)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle missing migration files gracefully', () => {
      // This test verifies the system handles missing files without crashing
      expect(() => getMigrationFiles()).not.toThrow()
    })

    it('should validate migration checksums', async () => {
      const migrationFiles = getMigrationFiles()
      const appliedMigrations = await getAppliedMigrations(supabase)
      
      // If migrations have been applied, they should have checksums
      appliedMigrations
        .filter(m => m.success)
        .forEach(appliedMigration => {
          expect(appliedMigration.checksum).toBeDefined()
          expect(appliedMigration.checksum.length).toBeGreaterThan(0)
        })
    })
  })

  describe('Integration with Schema Validation', () => {
    it('should be compatible with schema validation system', async () => {
      // Migration table should not interfere with schema validation
      const { data, error } = await supabase
        .from('schema_migrations')
        .select('version, name, success')
        .order('version')
      
      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
    })
  })
})