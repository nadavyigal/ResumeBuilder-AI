import { validateAll as validateSchema } from '../lib/validateSchema'
import { validateSupabaseEnv, runAllValidations } from '../lib/validateEnv'
import { validateDatabaseConnection } from '../lib/validateEnv'
import { validateRLSPolicies } from '../lib/validateEnv'
import { validateStorageBucket } from '../lib/validateEnv'

async function validateSupabaseIntegration() {
  console.log('🔍 Starting Supabase Integration Validation')
  console.log('==========================================')

  try {
    // Step 1: Environment Variables
    console.log('\n📋 Checking Environment Variables...')
    const envResult = await validateSupabaseEnv()
    if (!envResult.isValid) {
      console.error('❌ Environment validation failed:')
      envResult.missingVars.forEach(v => console.error(`   Missing: ${v}`))
      envResult.errors.forEach(e => console.error(`   Error: ${e}`))
      process.exit(1)
    }
    console.log('✅ Environment variables validated successfully')

    // Step 2: Database Connection
    console.log('\n🔌 Testing Database Connection...')
    const dbConnected = await validateDatabaseConnection()
    if (!dbConnected) {
      console.error('❌ Database connection failed')
      process.exit(1)
    }
    console.log('✅ Database connection successful')

    // Step 3: Schema and Types
    console.log('\n📊 Validating Database Schema and Types...')
    try {
      await validateSchema()
      console.log('✅ Schema and types validated successfully')
    } catch (error) {
      console.error('❌ Schema validation failed:', error)
      process.exit(1)
    }

    // Step 4: RLS Policies
    console.log('\n🔒 Checking RLS Policies...')
    const rlsValid = await validateRLSPolicies()
    if (!rlsValid) {
      console.error('❌ RLS policy validation failed')
      process.exit(1)
    }
    console.log('✅ RLS policies validated successfully')

    // Step 5: Storage
    console.log('\n📦 Validating Storage Setup...')
    const storageValid = await validateStorageBucket()
    if (!storageValid) {
      console.error('❌ Storage validation failed')
      process.exit(1)
    }
    console.log('✅ Storage setup validated successfully')

    // Step 6: Run all remaining validations
    console.log('\n🔄 Running Additional Validations...')
    await runAllValidations()
    console.log('✅ Additional validations completed successfully')

    console.log('\n✨ All Supabase Integration Validations Passed!')
    console.log('============================================')

  } catch (error) {
    console.error('\n❌ Validation process failed:', error)
    process.exit(1)
  }
}

// Run the validation if this script is executed directly
if (require.main === module) {
  validateSupabaseIntegration().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { validateSupabaseIntegration } 