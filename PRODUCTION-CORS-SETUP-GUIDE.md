# ResumeBuilder AI - Production CORS Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variable Configuration](#environment-variable-configuration)
3. [Domain DNS Configuration](#domain-dns-configuration)
4. [Step-by-Step Deployment Procedures](#step-by-step-deployment-procedures)
5. [Validation and Testing](#validation-and-testing)
6. [Monitoring and Alerting](#monitoring-and-alerting)
7. [Troubleshooting](#troubleshooting)
8. [Security Checklist](#security-checklist)
9. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### System Requirements
- Node.js 18+ (LTS recommended)
- Access to deployment platform (Vercel, Netlify, AWS, Docker, etc.)
- Domain name configured and accessible
- SSL/TLS certificate configured
- Supabase project with proper configuration

### Required Access
- Environment variable configuration access on deployment platform
- DNS management access for domain configuration
- Deployment platform admin access
- Monitoring/logging system access (optional but recommended)

### Knowledge Requirements
- Basic understanding of CORS (Cross-Origin Resource Sharing)
- Familiarity with environment variables and deployment platforms
- Understanding of DNS configuration
- Basic knowledge of web security principles

## Environment Variable Configuration

### Core CORS Variables

#### Production Environment Variables
```bash
# Primary production domain (required)
PRODUCTION_DOMAIN=https://app.resumebuilderai.com

# Comprehensive allowed origins list (recommended approach)
ALLOWED_ORIGINS=https://app.resumebuilderai.com,https://www.resumebuilderai.com

# CORS Security Level (required for production)
CORS_SECURITY_LEVEL=strict

# Enable CORS monitoring (recommended for production)
ENABLE_CORS_MONITORING=true
```

#### Staging Environment Variables
```bash
# Staging domain
PRODUCTION_DOMAIN=https://staging.resumebuilderai.com

# Allow staging and preview domains
ALLOWED_ORIGINS=https://staging.resumebuilderai.com,https://app.resumebuilderai.com

# Pattern matching for preview deployments
PREVIEW_ORIGIN_PATTERN=https://staging-*.vercel.app,https://*.staging.resumebuilderai.com

# Standard security for staging (allows pattern matching)
CORS_SECURITY_LEVEL=standard

# Enable monitoring
ENABLE_CORS_MONITORING=true
```

#### Development Environment Variables
```bash
# Development allows localhost
PRODUCTION_DOMAIN=http://localhost:3000

# Multiple local development URLs
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000

# Permissive security for development
CORS_SECURITY_LEVEL=permissive

# Enable monitoring for debugging
ENABLE_CORS_MONITORING=true
```

### Security Level Details

#### Strict Mode (Production Default)
- **Use Case**: Production environments
- **Security**: Highest security level
- **Features**: 
  - Exact origin matching only
  - No wildcard/pattern matching allowed
  - Blocks all local/private IP addresses
  - Comprehensive malicious pattern detection

```bash
CORS_SECURITY_LEVEL=strict
```

#### Standard Mode (Staging Default)
- **Use Case**: Staging environments with preview deployments
- **Security**: Balanced security and flexibility
- **Features**:
  - Exact origin matching
  - Wildcard pattern matching enabled
  - Blocks malicious patterns
  - Suitable for preview URL patterns

```bash
CORS_SECURITY_LEVEL=standard
```

#### Permissive Mode (Development Default)
- **Use Case**: Development environments only
- **Security**: Minimal restrictions
- **Features**:
  - Allows localhost and local IP addresses
  - Pattern matching enabled
  - Suitable for local development

```bash
CORS_SECURITY_LEVEL=permissive
```

### Pattern Matching Examples

#### Vercel Preview URLs
```bash
PREVIEW_ORIGIN_PATTERN=https://resumebuilder-ai-*.vercel.app,https://*-resumebuilder-ai.vercel.app
```

#### Netlify Preview URLs
```bash
PREVIEW_ORIGIN_PATTERN=https://deploy-preview-*--resumebuilder-ai.netlify.app,https://*.netlify.app
```

#### Custom Subdomain Patterns
```bash
PREVIEW_ORIGIN_PATTERN=https://pr-*.staging.resumebuilderai.com,https://*.preview.resumebuilderai.com
```

## Domain DNS Configuration

### Primary Domain Setup

#### 1. Main Application Domain
```dns
# A Record for root domain (if hosting root)
resumebuilderai.com.    A       192.168.1.100

# CNAME for app subdomain (recommended)
app.resumebuilderai.com. CNAME  your-deployment-platform.com.
```

#### 2. Staging Environment
```dns
# CNAME for staging
staging.resumebuilderai.com. CNAME your-staging-deployment.com.

# Wildcard for preview deployments (optional)
*.preview.resumebuilderai.com. CNAME your-preview-system.com.
```

#### 3. SSL Certificate Configuration
Ensure SSL certificates cover all domains:
```
*.resumebuilderai.com (wildcard certificate)
resumebuilderai.com
app.resumebuilderai.com
staging.resumebuilderai.com
```

### DNS Validation Commands
```bash
# Verify DNS resolution
dig app.resumebuilderai.com A
nslookup staging.resumebuilderai.com

# Check SSL certificate
openssl s_client -connect app.resumebuilderai.com:443 -servername app.resumebuilderai.com
```

## Step-by-Step Deployment Procedures

### Production Deployment

#### Step 1: Environment Preparation
```bash
# 1. Validate DNS resolution
dig app.resumebuilderai.com

# 2. Check SSL certificate
curl -I https://app.resumebuilderai.com

# 3. Verify Supabase connectivity
# (This should be configured separately)
```

#### Step 2: Environment Variable Setup

**For Vercel:**
```bash
# Set production variables
vercel env add PRODUCTION_DOMAIN production
# Enter: https://app.resumebuilderai.com

vercel env add ALLOWED_ORIGINS production
# Enter: https://app.resumebuilderai.com,https://www.resumebuilderai.com

vercel env add CORS_SECURITY_LEVEL production
# Enter: strict

vercel env add ENABLE_CORS_MONITORING production
# Enter: true
```

**For Netlify:**
```bash
# In netlify.toml or environment settings
[build.environment]
  PRODUCTION_DOMAIN = "https://app.resumebuilderai.com"
  ALLOWED_ORIGINS = "https://app.resumebuilderai.com,https://www.resumebuilderai.com"
  CORS_SECURITY_LEVEL = "strict"
  ENABLE_CORS_MONITORING = "true"
```

**For Docker:**
```dockerfile
ENV PRODUCTION_DOMAIN=https://app.resumebuilderai.com
ENV ALLOWED_ORIGINS=https://app.resumebuilderai.com,https://www.resumebuilderai.com
ENV CORS_SECURITY_LEVEL=strict
ENV ENABLE_CORS_MONITORING=true
```

**For AWS (using environment variables):**
```json
{
  "Environment": {
    "Variables": {
      "PRODUCTION_DOMAIN": "https://app.resumebuilderai.com",
      "ALLOWED_ORIGINS": "https://app.resumebuilderai.com,https://www.resumebuilderai.com",
      "CORS_SECURITY_LEVEL": "strict",
      "ENABLE_CORS_MONITORING": "true"
    }
  }
}
```

#### Step 3: Deployment Execution
```bash
# For Vercel
vercel --prod

# For Netlify
netlify deploy --prod

# For custom Docker
docker build -t resumebuilder-ai .
docker run -p 3000:3000 resumebuilder-ai
```

#### Step 4: Post-Deployment Validation
```bash
# Test CORS configuration endpoint (if available)
curl -H "Origin: https://app.resumebuilderai.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://app.resumebuilderai.com/api/health/overall

# Expected: 200 OK with proper CORS headers
```

### Staging Deployment

#### Step 1: Staging Environment Variables
```bash
# Staging-specific configuration
PRODUCTION_DOMAIN=https://staging.resumebuilderai.com
ALLOWED_ORIGINS=https://staging.resumebuilderai.com
PREVIEW_ORIGIN_PATTERN=https://staging-*.vercel.app
CORS_SECURITY_LEVEL=standard
ENABLE_CORS_MONITORING=true
```

#### Step 2: Preview Deployment Support
```bash
# For platforms with preview deployments
PREVIEW_ORIGIN_PATTERN=https://pr-*-resumebuilder.vercel.app,https://deploy-preview-*--resumebuilder.netlify.app
```

### Development Environment

#### Local Development Setup
```bash
# .env.local file
PRODUCTION_DOMAIN=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_SECURITY_LEVEL=permissive
ENABLE_CORS_MONITORING=true

# Start development server
npm run dev
```

## Validation and Testing

### Automated CORS Testing

#### Test Script Creation
Create `scripts/test-cors.js`:
```javascript
#!/usr/bin/env node

const https = require('https');
const http = require('http');

const testOrigins = [
  'https://app.resumebuilderai.com',
  'https://www.resumebuilderai.com',
  'https://evil-site.com',
  'http://localhost:3000'
];

const testEndpoints = [
  '/api/health/overall',
  '/api/generate',
  '/api/upload'
];

async function testCORS(origin, endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'app.resumebuilderai.com',
      port: 443,
      path: endpoint,
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    };

    const req = https.request(options, (res) => {
      resolve({
        origin,
        endpoint,
        status: res.statusCode,
        headers: res.headers
      });
    });

    req.on('error', (error) => {
      resolve({
        origin,
        endpoint,
        error: error.message
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing CORS Configuration...\n');
  
  for (const origin of testOrigins) {
    for (const endpoint of testEndpoints) {
      const result = await testCORS(origin, endpoint);
      console.log(`Origin: ${origin}`);
      console.log(`Endpoint: ${endpoint}`);
      console.log(`Status: ${result.status}`);
      console.log(`Access-Control-Allow-Origin: ${result.headers?.['access-control-allow-origin']}`);
      console.log('---');
    }
  }
}

runTests().catch(console.error);
```

#### Run Tests
```bash
chmod +x scripts/test-cors.js
node scripts/test-cors.js
```

### Manual Testing Procedures

#### 1. Browser Console Testing
```javascript
// Open browser console on https://app.resumebuilderai.com
// Test valid origin
fetch('/api/health/overall', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
}).then(response => {
  console.log('Valid origin test:', response.status);
}).catch(console.error);

// Test CORS headers
fetch('/api/health/overall', { method: 'OPTIONS' })
  .then(response => {
    console.log('CORS Headers:', [...response.headers.entries()]);
  });
```

#### 2. curl Testing
```bash
# Test valid origin
curl -v -H "Origin: https://app.resumebuilderai.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://app.resumebuilderai.com/api/health/overall

# Expected: 200 OK with Access-Control-Allow-Origin header

# Test invalid origin
curl -v -H "Origin: https://evil-site.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://app.resumebuilderai.com/api/health/overall

# Expected: 403 Forbidden or missing CORS headers
```

#### 3. Comprehensive Validation Checklist

**✅ Pre-Deployment Validation**
- [ ] DNS resolution works for primary domain
- [ ] SSL certificate is valid and includes all required domains
- [ ] Environment variables are set correctly
- [ ] Build process completes successfully
- [ ] All required services (Supabase, OpenAI) are accessible

**✅ Post-Deployment Validation**
- [ ] Application loads successfully from primary domain
- [ ] API endpoints respond correctly with valid CORS headers
- [ ] Invalid origins are properly rejected (403 Forbidden)
- [ ] Pattern matching works for preview deployments (staging only)
- [ ] Monitoring logs show CORS violations are being recorded
- [ ] All authenticated endpoints require proper authentication

**✅ Security Validation**
- [ ] Malicious origins (javascript:, data:, file:) are blocked
- [ ] Local IP addresses are blocked in production
- [ ] Wildcard patterns are only active in standard/permissive modes
- [ ] CORS headers include Vary: Origin for caching
- [ ] No sensitive information is exposed in CORS error messages

## Monitoring and Alerting

### CORS Monitoring Setup

#### 1. Environment Configuration
```bash
# Enable comprehensive monitoring
ENABLE_CORS_MONITORING=true
LOG_LEVEL=info
ENABLE_ERROR_REPORTING=true
```

#### 2. Log Analysis Commands
```bash
# Filter CORS violations in logs (adjust for your logging system)
grep "CORS_VIOLATION" /var/log/app.log | tail -20

# Count violations by origin
grep "CORS_VIOLATION" /var/log/app.log | jq '.origin' | sort | uniq -c

# Recent violations (last hour)
grep "CORS_VIOLATION" /var/log/app.log | jq 'select(.timestamp > "'$(date -d '1 hour ago' -Iseconds)'")'
```

#### 3. Alerting Configuration

**For DataDog:**
```json
{
  "name": "CORS Violations",
  "query": "logs:\"CORS_VIOLATION\" AND service:resumebuilder-ai",
  "type": "log alert",
  "options": {
    "thresholds": {
      "critical": 10,
      "warning": 5
    }
  }
}
```

**For CloudWatch:**
```json
{
  "MetricName": "CORSViolations",
  "Namespace": "ResumeBuilderAI/Security",
  "Dimensions": [
    {
      "Name": "Environment",
      "Value": "production"
    }
  ]
}
```

#### 4. Custom Monitoring Script
Create `scripts/cors-monitor.js`:
```javascript
#!/usr/bin/env node

// This script can be run as a cron job to monitor CORS violations
const fs = require('fs');
const path = require('path');

function analyzeCORSLogs() {
  const logFile = process.env.LOG_FILE || '/var/log/app.log';
  
  try {
    const logs = fs.readFileSync(logFile, 'utf8');
    const violations = logs
      .split('\n')
      .filter(line => line.includes('CORS_VIOLATION'))
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const lastHour = Date.now() - (60 * 60 * 1000);
    const recentViolations = violations.filter(v => 
      new Date(v.timestamp).getTime() > lastHour
    );

    if (recentViolations.length > 10) {
      console.error(`High CORS violation rate: ${recentViolations.length} violations in last hour`);
      // Send alert to monitoring system
    }

    // Analyze patterns
    const originCounts = recentViolations.reduce((acc, v) => {
      acc[v.origin] = (acc[v.origin] || 0) + 1;
      return acc;
    }, {});

    console.log('CORS Violations Summary:', originCounts);
    
  } catch (error) {
    console.error('Error analyzing CORS logs:', error);
  }
}

analyzeCORSLogs();
```

### Health Check Endpoints

The application includes health check endpoints for monitoring:

#### Available Endpoints
```bash
# Overall health check
curl https://app.resumebuilderai.com/api/health/overall

# Database connectivity
curl https://app.resumebuilderai.com/api/health/database

# External services status
curl https://app.resumebuilderai.com/api/health/services
```

## Troubleshooting

### Common CORS Issues

#### Issue 1: "CORS policy has blocked the request"

**Symptoms:**
- Browser console shows CORS errors
- API requests fail from web interface
- Error: "Access to fetch at 'X' from origin 'Y' has been blocked by CORS policy"

**Diagnosis:**
```bash
# Check current CORS configuration
curl -v -H "Origin: https://your-domain.com" \
     -X OPTIONS \
     https://app.resumebuilderai.com/api/health/overall

# Check environment variables
# (Platform specific - see your deployment platform documentation)
```

**Solutions:**
1. **Verify Environment Variables:**
   ```bash
   # Ensure ALLOWED_ORIGINS includes your domain
   ALLOWED_ORIGINS=https://app.resumebuilderai.com,https://www.resumebuilderai.com
   ```

2. **Check Security Level:**
   ```bash
   # For staging with preview URLs, use standard mode
   CORS_SECURITY_LEVEL=standard
   
   # For production, use strict mode
   CORS_SECURITY_LEVEL=strict
   ```

3. **Verify Domain Spelling:**
   - Check for typos in domain names
   - Ensure protocol (http/https) matches
   - Verify port numbers if using non-standard ports

#### Issue 2: Preview/Staging Deployments Fail

**Symptoms:**
- Preview deployments can't access API
- Staging environment CORS errors
- Pattern matching not working

**Diagnosis:**
```bash
# Test pattern matching
curl -v -H "Origin: https://pr-123-myapp.vercel.app" \
     -X OPTIONS \
     https://staging.resumebuilderai.com/api/health/overall
```

**Solutions:**
1. **Enable Pattern Matching:**
   ```bash
   # Use standard or permissive security level
   CORS_SECURITY_LEVEL=standard
   
   # Configure patterns correctly
   PREVIEW_ORIGIN_PATTERN=https://pr-*-resumebuilder.vercel.app,https://*.netlify.app
   ```

2. **Test Pattern Syntax:**
   ```javascript
   // Test your patterns locally
   const pattern = 'https://pr-*-resumebuilder.vercel.app';
   const regexPattern = pattern
     .replace(/\./g, '\\.')
     .replace(/\*/g, '[^.]*')
     .replace(/^/, '^')
     .replace(/$/, '$');
   
   const regex = new RegExp(regexPattern);
   console.log(regex.test('https://pr-123-resumebuilder.vercel.app')); // Should be true
   ```

#### Issue 3: Production Deployment Blocking Valid Origins

**Symptoms:**
- Previously working domains now blocked
- 403 Forbidden responses
- No CORS headers in response

**Diagnosis:**
```bash
# Check environment variable format
echo $ALLOWED_ORIGINS
# Should be: https://domain1.com,https://domain2.com

# Test with curl
curl -v -H "Origin: https://app.resumebuilderai.com" \
     https://app.resumebuilderai.com/api/health/overall
```

**Solutions:**
1. **Check Environment Variable Syntax:**
   ```bash
   # Correct format (comma-separated, no spaces around commas)
   ALLOWED_ORIGINS=https://app.resumebuilderai.com,https://www.resumebuilderai.com
   
   # Incorrect (spaces will cause issues)
   ALLOWED_ORIGINS=https://app.resumebuilderai.com, https://www.resumebuilderai.com
   ```

2. **Verify Deployment:**
   ```bash
   # Ensure environment variables are deployed
   # Check your platform's environment variable management
   ```

#### Issue 4: Monitoring Not Working

**Symptoms:**
- No CORS violation logs
- Monitoring alerts not firing
- Unable to track security issues

**Solutions:**
1. **Enable Monitoring:**
   ```bash
   ENABLE_CORS_MONITORING=true
   LOG_LEVEL=info
   ```

2. **Check Log Output:**
   ```bash
   # Development: Check console output
   npm run dev
   
   # Production: Check platform logs
   vercel logs  # For Vercel
   netlify logs # For Netlify
   ```

#### Issue 5: SSL/TLS Certificate Issues

**Symptoms:**
- Mixed content warnings
- Certificate validation errors
- CORS works on HTTP but not HTTPS

**Solutions:**
1. **Verify SSL Certificate:**
   ```bash
   openssl s_client -connect app.resumebuilderai.com:443 -servername app.resumebuilderai.com
   ```

2. **Check Certificate Coverage:**
   - Ensure certificate includes all necessary domains
   - Verify certificate is not expired
   - Check that redirect from HTTP to HTTPS works

### Debug Mode

#### Enable Debug Logging
```bash
# Add to environment variables for debugging
LOG_LEVEL=debug
ENABLE_CORS_MONITORING=true
NODE_ENV=development  # Only for debugging, not production
```

#### Debug Script
Create `scripts/debug-cors.js`:
```javascript
#!/usr/bin/env node

const { getCORSConfigSummary, validateOrigin } = require('../src/lib/cors');

console.log('Current CORS Configuration:');
console.log(JSON.stringify(getCORSConfigSummary(), null, 2));

console.log('\nTesting Origins:');
const testOrigins = [
  'https://app.resumebuilderai.com',
  'https://evil-site.com',
  'http://localhost:3000'
];

testOrigins.forEach(origin => {
  const result = validateOrigin(origin);
  console.log(`${origin}: ${result.allowed ? 'ALLOWED' : 'BLOCKED'}`);
  if (!result.allowed) {
    console.log(`  Reason: ${result.reason}`);
    console.log(`  Violation Type: ${result.violationType}`);
  }
});
```

### Emergency Procedures

#### Immediate CORS Issues Resolution

**If production is completely blocked:**

1. **Emergency Permissive Mode:**
   ```bash
   # ONLY as temporary emergency measure
   CORS_SECURITY_LEVEL=permissive
   
   # Deploy immediately, then fix root cause
   ```

2. **Rollback Environment Variables:**
   ```bash
   # Revert to last known working configuration
   # Platform specific commands:
   
   # Vercel
   vercel env rm CORS_SECURITY_LEVEL production
   vercel env add CORS_SECURITY_LEVEL production
   # Enter previous working value
   ```

3. **Contact checklist:**
   - [ ] Notify engineering team
   - [ ] Check monitoring alerts
   - [ ] Document incident for post-mortem
   - [ ] Plan proper fix implementation

## Security Checklist

### Pre-Production Security Review

#### ✅ Configuration Security
- [ ] **CORS_SECURITY_LEVEL** is set to 'strict' for production
- [ ] **ALLOWED_ORIGINS** contains only necessary, trusted domains
- [ ] No localhost or development URLs in production **ALLOWED_ORIGINS**
- [ ] **PREVIEW_ORIGIN_PATTERN** is not used in production (strict mode)
- [ ] All domains in **ALLOWED_ORIGINS** are HTTPS (not HTTP)
- [ ] Environment variables don't contain sensitive information in names

#### ✅ Domain Security
- [ ] All domains have valid SSL/TLS certificates
- [ ] Certificate covers all necessary subdomains
- [ ] Domains are owned and controlled by your organization
- [ ] DNS records are properly configured and secured
- [ ] No wildcard domains in production unless absolutely necessary

#### ✅ Implementation Security
- [ ] CORS headers include `Vary: Origin` for proper caching
- [ ] Invalid origins return 403 Forbidden (not just missing headers)
- [ ] No sensitive information leaked in CORS error messages
- [ ] Authentication is still required for protected endpoints
- [ ] CORS doesn't bypass other security measures

#### ✅ Monitoring Security
- [ ] **ENABLE_CORS_MONITORING** is enabled
- [ ] CORS violations are logged securely
- [ ] Monitoring alerts are configured for high violation rates
- [ ] Logs don't expose sensitive information
- [ ] Access to monitoring systems is restricted

### Security Best Practices

#### 1. Principle of Least Privilege
```bash
# Bad: Overly permissive
ALLOWED_ORIGINS=*
CORS_SECURITY_LEVEL=permissive

# Good: Specific and restrictive
ALLOWED_ORIGINS=https://app.resumebuilderai.com
CORS_SECURITY_LEVEL=strict
```

#### 2. Environment Separation
```bash
# Production: Strict security
CORS_SECURITY_LEVEL=strict
ALLOWED_ORIGINS=https://app.resumebuilderai.com

# Staging: Moderate security
CORS_SECURITY_LEVEL=standard
ALLOWED_ORIGINS=https://staging.resumebuilderai.com
PREVIEW_ORIGIN_PATTERN=https://pr-*.staging.resumebuilderai.com

# Development: Permissive only locally
CORS_SECURITY_LEVEL=permissive
ALLOWED_ORIGINS=http://localhost:3000
```

#### 3. Regular Security Audits
- **Monthly**: Review ALLOWED_ORIGINS for unnecessary domains
- **Quarterly**: Audit CORS violation logs for attack patterns
- **Annually**: Security penetration testing including CORS configuration

#### 4. Incident Response
- [ ] CORS security incidents are included in incident response plan
- [ ] Team knows how to quickly modify CORS configuration
- [ ] Rollback procedures are documented and tested
- [ ] Emergency contact information is available

### Security Warning Signs

#### 🚨 Critical Issues (Fix Immediately)
- CORS_SECURITY_LEVEL=permissive in production
- Wildcard (*) in ALLOWED_ORIGINS
- HTTP domains in production ALLOWED_ORIGINS
- Domains you don't control in ALLOWED_ORIGINS

#### ⚠️ Warning Issues (Address Soon)
- High rate of CORS violations
- Unused domains in ALLOWED_ORIGINS
- Missing monitoring/alerting
- No regular security reviews

#### ℹ️ Informational Issues (Monitor)
- Occasional CORS violations (may be legitimate testing)
- Development domains in staging configuration
- Complex pattern matching rules

## Rollback Procedures

### Immediate Rollback

#### Scenario 1: CORS Configuration Breaking Production

**Step 1: Identify the Issue**
```bash
# Check current configuration
curl -v -H "Origin: https://app.resumebuilderai.com" \
     https://app.resumebuilderai.com/api/health/overall

# Check deployment platform environment variables
```

**Step 2: Emergency Rollback (Platform Specific)**

**Vercel:**
```bash
# Rollback to previous deployment
vercel rollback

# Or revert specific environment variables
vercel env ls production
vercel env rm ALLOWED_ORIGINS production
vercel env add ALLOWED_ORIGINS production
# Enter previous working value: https://app.resumebuilderai.com
```

**Netlify:**
```bash
# Rollback via CLI
netlify api rollbackSiteDeploy --site-id YOUR_SITE_ID --deploy-id PREVIOUS_DEPLOY_ID

# Or update environment via web interface
# Settings -> Environment variables
```

**AWS/Docker:**
```bash
# Redeploy previous container version
docker pull resumebuilder-ai:previous-tag
docker stop resumebuilder-ai-current
docker run -d --name resumebuilder-ai-current resumebuilder-ai:previous-tag
```

#### Scenario 2: Partial Rollback (Environment Variables Only)

**Step 1: Identify Working Configuration**
```bash
# Check git history for previous .env.example
git log --oneline -p .env.example

# Or check deployment platform history
```

**Step 2: Restore Previous Values**
```bash
# Example previous working configuration
ALLOWED_ORIGINS=https://app.resumebuilderai.com
CORS_SECURITY_LEVEL=strict
ENABLE_CORS_MONITORING=true
```

**Step 3: Verify Restoration**
```bash
# Test immediately after rollback
curl -H "Origin: https://app.resumebuilderai.com" \
     -X OPTIONS \
     https://app.resumebuilderai.com/api/health/overall

# Should return 200 with proper CORS headers
```

### Planned Rollback

#### Pre-Change Checklist
- [ ] Document current working configuration
- [ ] Create backup of environment variables
- [ ] Identify rollback contact person
- [ ] Schedule monitoring during change window

#### Configuration Backup Script
Create `scripts/backup-env.js`:
```javascript
#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

function backupEnvironment() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `config-backup-${timestamp}.json`;
  
  // Platform-specific backup commands
  const platforms = {
    vercel: () => execSync('vercel env ls --scope production', { encoding: 'utf8' }),
    netlify: () => execSync('netlify env:list', { encoding: 'utf8' }),
    // Add other platforms as needed
  };
  
  const platform = process.env.PLATFORM || 'vercel';
  
  try {
    const envData = platforms[platform]();
    fs.writeFileSync(backupFile, envData);
    console.log(`Environment backed up to ${backupFile}`);
  } catch (error) {
    console.error('Backup failed:', error.message);
  }
}

backupEnvironment();
```

#### Testing Rollback Procedure

**Monthly Rollback Test:**
```bash
# 1. Create test environment
# 2. Apply change
# 3. Verify breakage
# 4. Execute rollback procedure
# 5. Verify restoration
# 6. Document any issues
```

### Post-Rollback Actions

#### Immediate Actions (within 5 minutes)
1. **Verify Service Restoration:**
   ```bash
   # Test primary functionality
   curl https://app.resumebuilderai.com/api/health/overall
   ```

2. **Check Monitoring:**
   - Verify error rates return to normal
   - Confirm CORS violations stop occurring
   - Check application metrics dashboard

3. **Notify Stakeholders:**
   - Engineering team
   - Product/business stakeholders
   - Customer support (if customer-facing)

#### Follow-up Actions (within 1 hour)
1. **Root Cause Analysis:**
   - What caused the CORS issue?
   - Why wasn't it caught in testing?
   - What configuration was incorrect?

2. **Prevention Planning:**
   - Update testing procedures
   - Improve configuration validation
   - Enhance monitoring/alerting

3. **Documentation Update:**
   - Update this guide with lessons learned
   - Document the specific issue and solution
   - Update team procedures

#### Long-term Actions (within 1 week)
1. **Process Improvement:**
   - Review change management process
   - Enhance automated testing
   - Improve rollback automation

2. **Team Training:**
   - Share lessons learned
   - Update team documentation
   - Practice improved procedures

---

## Quick Reference

### Emergency Contact Commands
```bash
# Test CORS quickly
curl -H "Origin: https://app.resumebuilderai.com" -X OPTIONS https://app.resumebuilderai.com/api/health/overall

# Check environment (Vercel)
vercel env ls production

# Emergency rollback (Vercel)
vercel rollback

# View logs (Vercel)
vercel logs
```

### Critical Environment Variables
```bash
PRODUCTION_DOMAIN=https://app.resumebuilderai.com
ALLOWED_ORIGINS=https://app.resumebuilderai.com,https://www.resumebuilderai.com
CORS_SECURITY_LEVEL=strict
ENABLE_CORS_MONITORING=true
```

### Support Contacts
- **Primary Engineer**: [Contact Information]
- **DevOps Team**: [Contact Information]
- **Platform Support**: [Vercel/Netlify/AWS Support Contacts]

---

*This guide should be reviewed and updated quarterly to ensure accuracy and completeness. Last updated: [Current Date]*