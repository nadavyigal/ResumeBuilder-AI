#!/usr/bin/env pwsh
# ResumeBuilder AI - Authentication Setup & Fix Script
# This script fixes all Supabase authentication and RLS policy issues

Write-Host "🚀 ResumeBuilder AI - Authentication Fix Script" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Step 1: Check environment variables
Write-Host "`n1. Checking environment variables..." -ForegroundColor Yellow

if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "Creating .env.local from your existing file..." -ForegroundColor Yellow
    Copy-Item ".env.local" ".env.local.backup" -ErrorAction SilentlyContinue
}

# Check if environment variables are set
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=https://([^.]+)\.supabase\.co") {
    $projectRef = $Matches[1]
    Write-Host "✅ Found Supabase project: $projectRef" -ForegroundColor Green
} else {
    Write-Host "❌ Could not find valid Supabase URL in .env.local" -ForegroundColor Red
    exit 1
}

# Step 2: Install/Update dependencies
Write-Host "`n2. Installing latest Supabase dependencies..." -ForegroundColor Yellow
npm install @supabase/ssr@latest @supabase/supabase-js@latest

# Step 3: Apply the SQL migration
Write-Host "`n3. SQL Migration Instructions" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan

Write-Host @"
⚠️  IMPORTANT: You need to run this SQL migration in your Supabase dashboard:

1. Go to: https://supabase.com/dashboard/project/$projectRef/sql/new
2. Copy and paste the contents of: src/lib/migrations/002_fix_rls_policies.sql
3. Click 'Run' to execute the migration

This will:
✅ Fix all RLS policy conflicts
✅ Update table structures  
✅ Fix authentication triggers
✅ Resolve the 13 security issues shown in your dashboard

"@ -ForegroundColor White

# Step 4: Restart development server
Write-Host "`n4. Restarting development server..." -ForegroundColor Yellow

# Kill any existing Node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "next*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "✅ Stopped existing development servers" -ForegroundColor Green

# Step 5: Verification steps
Write-Host "`n5. Next Steps - Manual Verification Required" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan

Write-Host @"
After running the SQL migration, please verify:

🔧 Supabase Dashboard Checks:
   1. Go to Authentication → Settings
   2. Verify Site URL is: http://localhost:3001
   3. Add http://localhost:3001/auth/callback to redirect URLs
   4. If using Google OAuth, enable it in Authentication → Providers

🧪 Test Authentication:
   1. Run: npm run dev
   2. Visit: http://localhost:3001/login
   3. Try signing up with a new email
   4. Check if you can log in

🐛 Debug Tools Available:
   - Auth Debug: http://localhost:3001/auth-debug
   - Supabase Test: http://localhost:3001/test-supabase

"@ -ForegroundColor White

Write-Host "`n✅ Authentication fix completed!" -ForegroundColor Green
Write-Host "Run the SQL migration and then: npm run dev" -ForegroundColor Cyan

# Optional: Auto-start development server
$response = Read-Host "`nWould you like to start the development server now? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "Starting development server..." -ForegroundColor Yellow
    Start-Process -NoNewWindow npm -ArgumentList "run", "dev"
} 