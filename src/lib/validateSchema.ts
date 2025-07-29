import { supabase } from './supabase'
import { Database } from '@/types/supabase'

interface SchemaValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

interface TableSchema {
  name: string
  columns: {
    name: string
    type: string
    isNullable: boolean
    hasDefault: boolean
  }[]
}

export async function validateDatabaseSchema(): Promise<SchemaValidationResult> {
  const result: SchemaValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  }

  try {
    // Use direct table queries since exec_sql doesn't return data properly
    const tables = ['profiles', 'resumes', 'chat_interactions', 'job_scrapings']
    const tableResults: Record<string, boolean> = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          result.errors.push(`Missing table: ${table}`)
          result.isValid = false
        } else {
          tableResults[table] = true
        }
      } catch (error) {
        result.errors.push(`Missing table: ${table}`)
        result.isValid = false
      }
    }
    
    // If all tables exist, skip detailed schema validation for now
    if (Object.keys(tableResults).length === tables.length) {
      result.warnings.push('Schema validation simplified - detailed column validation skipped')
      result.warnings.push('Index validation skipped - not available through PostgREST')
      return result
    }

    // Basic schema validation passed if we get here
    result.warnings.push('Detailed schema validation skipped - basic table existence confirmed')

    return result
  } catch (error) {
    result.errors.push(`Unexpected error during schema validation: ${
      error instanceof Error ? error.message : String(error)
    }`)
    result.isValid = false
    return result
  }
}

export async function validateTypeAlignment(): Promise<SchemaValidationResult> {
  const result: SchemaValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  }

  try {
    // Get a sample resume
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .limit(1)
      .single()

    if (resumeError) {
      result.warnings.push('Could not fetch sample resume for type validation')
    } else if (resume) {
      // Validate resume structure matches Database['public']['Tables']['resumes']['Row']
      type ResumeRow = Database['public']['Tables']['resumes']['Row']
      const requiredKeys: (keyof ResumeRow)[] = [
        'id',
        'created_at',
        'user_id',
        'title',
        'content',
        'is_public',
      ]

      for (const key of requiredKeys) {
        if (!(key in resume)) {
          result.errors.push(`Missing required key in resume: ${String(key)}`)
          result.isValid = false
        }
      }

      // Validate content structure
      if (resume.content) {
        const requiredContentKeys = ['personal', 'experience', 'education', 'skills']
        for (const key of requiredContentKeys) {
          if (!(key in resume.content)) {
            result.warnings.push(`Missing recommended key in resume.content: ${key}`)
          }
        }
      }
    }

    // Get a sample profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single()

    if (profileError) {
      result.warnings.push('Could not fetch sample profile for type validation')
    } else if (profile) {
      // Validate profile structure matches Database['public']['Tables']['profiles']['Row']
      type ProfileRow = Database['public']['Tables']['profiles']['Row']
      const requiredKeys: (keyof ProfileRow)[] = [
        'id',
        'created_at',
        'email',
        'full_name',
        'avatar_url',
      ]

      for (const key of requiredKeys) {
        if (!(key in profile)) {
          result.errors.push(`Missing required key in profile: ${String(key)}`)
          result.isValid = false
        }
      }
    }

    return result
  } catch (error) {
    result.errors.push(`Unexpected error during type validation: ${
      error instanceof Error ? error.message : String(error)
    }`)
    result.isValid = false
    return result
  }
}

export async function validateAll(): Promise<void> {
  console.log('Starting database schema and type validation...')

  const schemaResult = await validateDatabaseSchema()
  console.log('\nSchema Validation Result:', schemaResult.isValid ? 'PASS' : 'FAIL')
  if (schemaResult.errors.length > 0) {
    console.error('Schema Errors:')
    schemaResult.errors.forEach(error => console.error(`- ${error}`))
  }
  if (schemaResult.warnings.length > 0) {
    console.warn('Schema Warnings:')
    schemaResult.warnings.forEach(warning => console.warn(`- ${warning}`))
  }

  const typeResult = await validateTypeAlignment()
  console.log('\nType Alignment Result:', typeResult.isValid ? 'PASS' : 'FAIL')
  if (typeResult.errors.length > 0) {
    console.error('Type Errors:')
    typeResult.errors.forEach(error => console.error(`- ${error}`))
  }
  if (typeResult.warnings.length > 0) {
    console.warn('Type Warnings:')
    typeResult.warnings.forEach(warning => console.warn(`- ${warning}`))
  }

  if (!schemaResult.isValid || !typeResult.isValid) {
    throw new Error('Schema validation failed. Please check the errors above.')
  }
} 