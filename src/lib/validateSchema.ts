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
    // Get database schema
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_schema', 'public')

    if (schemaError) {
      result.errors.push(`Failed to fetch schema: ${schemaError.message}`)
      result.isValid = false
      return result
    }

    // Expected schema based on DS.md and types
    const expectedTables: Record<string, TableSchema> = {
      profiles: {
        name: 'profiles',
        columns: [
          { name: 'id', type: 'uuid', isNullable: false, hasDefault: false },
          { name: 'created_at', type: 'timestamp with time zone', isNullable: false, hasDefault: true },
          { name: 'email', type: 'text', isNullable: false, hasDefault: false },
          { name: 'full_name', type: 'text', isNullable: true, hasDefault: false },
          { name: 'avatar_url', type: 'text', isNullable: true, hasDefault: false },
        ],
      },
      resumes: {
        name: 'resumes',
        columns: [
          { name: 'id', type: 'uuid', isNullable: false, hasDefault: true },
          { name: 'created_at', type: 'timestamp with time zone', isNullable: false, hasDefault: true },
          { name: 'user_id', type: 'uuid', isNullable: false, hasDefault: false },
          { name: 'title', type: 'text', isNullable: false, hasDefault: false },
          { name: 'content', type: 'jsonb', isNullable: false, hasDefault: false },
          { name: 'is_public', type: 'boolean', isNullable: false, hasDefault: true },
        ],
      },
    }

    // Group schema data by table
    const actualTables: Record<string, TableSchema> = {}
    schemaData?.forEach((column: any) => {
      const tableName = column.table_name
      if (!actualTables[tableName]) {
        actualTables[tableName] = {
          name: tableName,
          columns: [],
        }
      }
      actualTables[tableName].columns.push({
        name: column.column_name,
        type: column.data_type,
        isNullable: column.is_nullable === 'YES',
        hasDefault: column.column_default !== null,
      })
    })

    // Validate each expected table
    for (const [tableName, expectedSchema] of Object.entries(expectedTables)) {
      const actualSchema = actualTables[tableName]
      
      if (!actualSchema) {
        result.errors.push(`Missing table: ${tableName}`)
        result.isValid = false
        continue
      }

      // Validate columns
      for (const expectedColumn of expectedSchema.columns) {
        const actualColumn = actualSchema.columns.find(
          col => col.name === expectedColumn.name
        )

        if (!actualColumn) {
          result.errors.push(
            `Missing column ${expectedColumn.name} in table ${tableName}`
          )
          result.isValid = false
          continue
        }

        // Check column type
        if (actualColumn.type !== expectedColumn.type) {
          result.errors.push(
            `Type mismatch for ${tableName}.${expectedColumn.name}: ` +
            `expected ${expectedColumn.type}, got ${actualColumn.type}`
          )
          result.isValid = false
        }

        // Check nullability
        if (actualColumn.isNullable !== expectedColumn.isNullable) {
          result.errors.push(
            `Nullability mismatch for ${tableName}.${expectedColumn.name}: ` +
            `expected ${expectedColumn.isNullable}, got ${actualColumn.isNullable}`
          )
          result.isValid = false
        }
      }

      // Check for extra columns
      const extraColumns = actualSchema.columns.filter(
        actualCol => !expectedSchema.columns.find(
          expectedCol => expectedCol.name === actualCol.name
        )
      )

      if (extraColumns.length > 0) {
        result.warnings.push(
          `Extra columns found in ${tableName}: ${
            extraColumns.map(col => col.name).join(', ')
          }`
        )
      }
    }

    // Validate indexes
    const { data: indexData, error: indexError } = await supabase
      .from('information_schema.statistics')
      .select('*')
      .eq('table_schema', 'public')

    if (indexError) {
      result.warnings.push(`Failed to fetch index information: ${indexError.message}`)
    } else {
      const expectedIndexes = [
        'idx_resumes_user_id',
        'idx_resumes_is_public',
        'idx_resumes_created_at',
        'idx_profiles_email',
      ]

      const actualIndexes = indexData?.map((idx: any) => idx.index_name) || []

      for (const expectedIndex of expectedIndexes) {
        if (!actualIndexes.includes(expectedIndex)) {
          result.warnings.push(`Missing recommended index: ${expectedIndex}`)
        }
      }
    }

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