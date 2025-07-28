# Database Backup and Recovery Procedures

## Overview

This document outlines the database backup and recovery procedures for the ResumeBuilder AI application using Supabase as the managed database provider.

## Backup Strategy

### Automatic Backups (Supabase Managed)

Supabase provides automatic daily backups for all projects:

- **Frequency**: Daily backups at 00:00 UTC
- **Retention**: 7 days for free tier, 30 days for Pro tier
- **Point-in-Time Recovery**: Available for Pro tier (up to 7 days)
- **Storage**: Encrypted and stored in multiple availability zones

### Backup Configuration

#### Supabase Dashboard Configuration

1. **Navigate to Settings > Database**
2. **Backup Settings**:
   - Automatic daily backups: ✅ Enabled
   - Backup retention: 30 days (Pro tier)
   - Point-in-Time Recovery: ✅ Enabled

#### Environment Variables for Backup Management

```bash
# Required for backup operations
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_ACCESS_TOKEN=your-access-token  # From Supabase dashboard
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

### Manual Backup Procedures

#### 1. Schema-Only Backup

```bash
# Export schema structure
pg_dump --schema-only --no-owner --no-privileges \
  -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  > schema_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 2. Data-Only Backup

```bash
# Export data only
pg_dump --data-only --no-owner --no-privileges \
  --exclude-table=auth.* \
  --exclude-table=storage.* \
  -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  > data_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 3. Full Database Backup

```bash
# Complete database backup
pg_dump --no-owner --no-privileges \
  --exclude-table=auth.* \
  --exclude-table=storage.* \
  -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  > full_backup_$(date +%Y%m%d_%H%M%S).sql
```

## Recovery Procedures

### Automatic Recovery (Supabase Dashboard)

#### Point-in-Time Recovery

1. **Access Supabase Dashboard**
2. **Navigate to Settings > Database**
3. **Select "Point-in-Time Recovery"**
4. **Choose target timestamp** (within last 7 days)
5. **Confirm recovery operation**

**⚠️ Warning**: This will restore the entire database to the selected point in time.

#### Backup Restoration

1. **Access Supabase Dashboard**
2. **Navigate to Settings > Database**
3. **Select "Backups" tab**
4. **Choose backup to restore**
5. **Click "Restore" and confirm**

### Manual Recovery Procedures

#### 1. Schema Recovery

```bash
# Restore schema from backup
psql -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -f schema_backup_YYYYMMDD_HHMMSS.sql
```

#### 2. Data Recovery

```bash
# Restore data from backup
psql -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -f data_backup_YYYYMMDD_HHMMSS.sql
```

#### 3. Selective Table Recovery

```bash
# Restore specific table
pg_restore --table=profiles \
  -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  backup_file.sql
```

## Disaster Recovery Scenarios

### Scenario 1: Accidental Data Deletion

**Impact**: Specific records or tables accidentally deleted
**Recovery Time**: 5-10 minutes
**Data Loss**: Minimal (depends on detection time)

**Steps**:
1. Identify the time of deletion
2. Use Point-in-Time Recovery to restore to just before deletion
3. Export affected data from recovered state
4. Import data to current database
5. Validate data integrity

### Scenario 2: Database Corruption

**Impact**: Database becomes inaccessible or corrupted
**Recovery Time**: 15-30 minutes
**Data Loss**: Up to last backup (max 24 hours)

**Steps**:
1. Assess corruption extent
2. Restore from most recent backup
3. Apply any necessary migrations
4. Validate application functionality
5. Monitor for continued issues

### Scenario 3: Complete Supabase Service Outage

**Impact**: Entire database service unavailable
**Recovery Time**: 1-4 hours (depends on Supabase restoration)
**Data Loss**: Minimal with recent backups

**Steps**:
1. Monitor Supabase status page
2. Prepare alternative database instance if needed
3. Restore from latest backup to alternative instance
4. Update application connection strings
5. Switch DNS/load balancer to alternative
6. Revert when Supabase service restored

### Scenario 4: Account Compromise

**Impact**: Unauthorized access to database
**Recovery Time**: 30-60 minutes
**Data Loss**: Depends on compromise duration

**Steps**:
1. Immediately revoke all API keys and tokens
2. Change all passwords
3. Assess data integrity and unauthorized changes
4. Restore from backup if necessary
5. Implement additional security measures
6. Audit access logs

## Backup Validation Procedures

### Automated Backup Testing

Create a backup validation script that runs weekly:

```bash
#!/bin/bash
# validate-backup.sh

# Test backup file integrity
pg_dump --schema-only --no-owner --no-privileges \
  -h db.your-project.supabase.co \
  -U postgres -d postgres | \
  psql -h test-db.your-project.supabase.co \
  -U postgres -d postgres

# Validate critical tables exist
psql -h test-db.your-project.supabase.co \
  -U postgres -d postgres \
  -c "SELECT COUNT(*) FROM profiles;"

echo "Backup validation completed"
```

### Manual Validation Checklist

- [ ] Backup file size reasonable (not zero, not unexpectedly large)
- [ ] Backup contains all expected tables
- [ ] Critical data tables have expected row counts
- [ ] Schema structure matches production
- [ ] RLS policies are included
- [ ] Indexes are preserved
- [ ] Functions and triggers are included

## Monitoring and Alerting

### Backup Monitoring

Set up monitoring for:
- Backup completion status
- Backup file sizes
- Failed backup attempts
- Storage space usage

### Recovery Testing Schedule

- **Weekly**: Validate latest backup integrity
- **Monthly**: Full recovery test in staging environment
- **Quarterly**: Disaster recovery simulation
- **Annually**: Complete business continuity test

## Production Backup Configuration

### Current Configuration

```yaml
# Supabase Pro Tier Settings
backup_schedule: "0 0 * * *"  # Daily at midnight UTC
retention_days: 30
point_in_time_recovery: true
encryption: AES-256
storage_locations: 
  - us-east-1
  - us-west-2
```

### Backup Storage Locations

- **Primary**: Supabase managed storage (encrypted)
- **Secondary**: Optional external storage for critical data
- **Archive**: Long-term retention for compliance

## Security Considerations

### Backup Security

- All backups are encrypted at rest
- Access requires authentication tokens
- Backup files should never contain plain-text passwords
- Regular rotation of backup access credentials

### Recovery Security

- Verify backup integrity before restoration
- Use read-only replicas for recovery testing
- Audit all recovery operations
- Validate data integrity after recovery

## Cost Optimization

### Backup Cost Management

- Monitor backup storage usage
- Clean up old manual backups
- Use compression for large backups
- Optimize backup schedules

### Recovery Cost Considerations

- Point-in-Time Recovery charges for compute time
- Multiple recovery attempts can be costly
- Test recovery procedures in development first

## Compliance and Audit

### Audit Requirements

- Log all backup and recovery operations
- Maintain backup retention records
- Document recovery procedures and tests
- Regular compliance reviews

### Regulatory Compliance

- GDPR: Right to be forgotten in backups
- HIPAA: Encrypted backups and access controls
- SOC2: Backup availability and security

## Emergency Contacts

### Internal Team

- **Database Administrator**: [Contact Info]
- **DevOps Lead**: [Contact Info]
- **Technical Lead**: [Contact Info]

### External Support

- **Supabase Support**: support@supabase.io
- **Emergency Hotline**: [If available for Pro tier]

## Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO)

### Production Targets

- **RTO**: 4 hours (maximum downtime)
- **RPO**: 24 hours (maximum data loss)
- **Availability**: 99.9% uptime target

### Testing Validation

- Monthly RTO/RPO validation tests
- Document actual recovery times
- Continuous improvement of procedures

## Appendix: Common Commands

### Quick Reference

```bash
# Check backup status
supabase projects api-keys list

# Manual backup
pg_dump [connection_string] > backup.sql

# Quick restore
psql [connection_string] < backup.sql

# Check database size
SELECT pg_size_pretty(pg_database_size('postgres'));

# List all tables
\dt

# Check table sizes
SELECT schemaname,tablename,attname,n_distinct,correlation FROM pg_stats;
```

### Troubleshooting

**Common Issues**:
- Connection timeouts during backup/restore
- Insufficient disk space
- Permission errors
- Large table restoration times

**Solutions**:
- Use connection pooling
- Monitor disk space
- Verify credentials
- Use parallel restore for large databases