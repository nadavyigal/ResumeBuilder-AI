# Database Migration Procedures

## Overview

This document outlines the database migration system for the ResumeBuilder AI application. The migration system ensures database schema changes are tracked, versioned, and can be safely applied or rolled back.

## Migration System Architecture

### File Structure
```
src/lib/migrations/
├── 001_user_profile_resume.sql      # Core user and resume tables
├── 002_fix_rls_policies.sql         # RLS policy fixes
├── 003_chat_interactions.sql        # Chat interaction tracking
├── 004_job_scrapings.sql            # Job scraping functionality
├── 005_schema_validation_helpers.sql # Schema validation functions
```

### Migration File Format

Each migration file follows this structure:

```sql
-- Migration: [Description]
-- Version: [Version Number]
-- Date: [YYYY-MM-DD]
-- Author: [Author Name] (optional)
-- Depends: [comma-separated list of dependencies] (optional)

-- UP migration script
CREATE TABLE example_table (...);

-- DOWN
-- Rollback script for migration [version]

DROP TABLE IF EXISTS example_table;
```

## Commands

### Running Migrations

```bash
# Apply all pending migrations
npm run migrate:up

# Apply migrations up to a specific version
npm run migrate:up 003

# Check migration status
npm run migrate:status

# Rollback to a specific version
npm run migrate:down 002
```

### Validation and Testing

```bash
# Validate database schema
npm run validate:schema

# Test migration system
npm run test:migrations

# Run all validations
npm run validate:all
```

## Development Workflow

### 1. Creating New Migrations

When creating a new migration:

1. **Create migration file**: Use sequential numbering (e.g., `006_new_feature.sql`)
2. **Add metadata**: Include version, description, date, and dependencies
3. **Write UP script**: Contains the forward migration
4. **Write DOWN script**: Contains the rollback migration
5. **Test locally**: Run migration up and down to ensure it works
6. **Document changes**: Update this document if needed

### 2. Migration File Guidelines

#### UP Script Requirements:
- Use `IF NOT EXISTS` where appropriate
- Include proper error handling
- Add indexes for performance
- Set up RLS policies for security
- Include table/column comments

#### DOWN Script Requirements:
- Must reverse all changes from UP script
- Use `IF EXISTS` to prevent errors
- Drop in reverse dependency order
- Remove all created objects (tables, indexes, policies, functions)

#### Example Template:
```sql
-- Migration: Add user preferences table
-- Version: 006
-- Date: 2025-01-25
-- Author: Developer Name
-- Depends: 001

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- DOWN
-- Rollback script for migration 006

-- Drop policies
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;

-- Disable RLS
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_preferences_user_id;

-- Drop table
DROP TABLE IF EXISTS user_preferences;
```

### 3. Testing Migrations

Before deploying migrations:

1. **Local testing**: Apply and rollback on local database
2. **Schema validation**: Ensure new schema passes validation
3. **Data integrity**: Verify existing data remains intact
4. **Performance testing**: Check migration execution time
5. **Rollback testing**: Ensure rollback works correctly

### 4. Code Review Process

All migrations must be reviewed for:

- **Security**: No SQL injection vulnerabilities
- **Performance**: Efficient queries and proper indexes
- **Compatibility**: Works with existing data
- **Rollback**: DOWN script properly reverses changes
- **Dependencies**: Correct dependency ordering

## Production Deployment

### Pre-deployment Checklist

- [ ] Migration tested locally
- [ ] DOWN script tested
- [ ] Schema validation passes
- [ ] Performance impact assessed
- [ ] Code review completed
- [ ] Backup plan prepared

### Deployment Process

1. **Create backup**: Always backup production database first
2. **Apply migrations**: Use CI/CD pipeline or manual execution
3. **Validate schema**: Run schema validation after migration
4. **Monitor performance**: Check for any performance degradation
5. **Rollback if needed**: Use DOWN scripts if issues occur

### Emergency Rollback

If a migration causes issues:

```bash
# Rollback to previous version
npm run migrate:down [previous_version]

# Validate schema after rollback
npm run validate:schema

# Restart application services
```

## Migration Tracking

### Schema Migrations Table

The system tracks migrations in the `schema_migrations` table:

```sql
CREATE TABLE schema_migrations (
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
```

### Migration Status

Check current migration status:

```bash
npm run migrate:status
```

Output example:
```
📋 Database Migration Status
============================
Total migration files: 5
Applied migrations: 4
Pending migrations: 1

Migration Details:
  ✅ Applied 001: user_profile_resume
  ✅ Applied 002: fix_rls_policies
  ✅ Applied 003: chat_interactions
  ✅ Applied 004: job_scrapings
  ⏳ Pending 005: schema_validation_helpers
```

## Troubleshooting

### Common Issues

#### Migration Fails to Apply
- Check database connection
- Verify dependencies are met
- Review error message in logs
- Check for conflicting schema changes

#### Rollback Fails
- Verify DOWN script syntax
- Check for data dependencies
- Manually clean up if necessary
- Restore from backup if critical

#### Schema Validation Fails
- Run migration individually
- Check for missing objects
- Verify RLS policies
- Review indexes and constraints

### Recovery Procedures

#### Complete Database Reset (Development Only)
```bash
# WARNING: This will destroy all data
npm run migrate:down 000  # Rollback all migrations
npm run migrate:up        # Reapply all migrations
```

#### Selective Migration Rollback
```bash
# Rollback specific problematic migration
npm run migrate:down [target_version]
# Fix the migration file
# Reapply from target version
npm run migrate:up
```

## Best Practices

### Migration Design
- Keep migrations small and focused
- Avoid data transformations in schema migrations
- Use separate migrations for schema and data changes
- Always include rollback scripts

### Performance Considerations
- Add indexes before inserting large amounts of data
- Use `CONCURRENTLY` for index creation on large tables
- Consider maintenance windows for long-running migrations
- Monitor lock times during migration

### Security Guidelines
- Always use RLS policies for user-facing tables
- Grant minimal necessary permissions
- Validate input in migration scripts
- Review all SQL for injection vulnerabilities

### Documentation Requirements
- Document all schema changes
- Update API documentation for schema changes
- Include migration reasoning in commit messages
- Maintain this procedure document

## Integration with CI/CD

The migration system integrates with the CI/CD pipeline to ensure:

- Migrations are validated before deployment
- Schema validation runs after migrations
- Rollback procedures are available
- Migration status is reported

See the CI/CD documentation for specific pipeline configuration.