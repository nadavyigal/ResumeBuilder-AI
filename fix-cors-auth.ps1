#!/usr/bin/env pwsh
# ResumeBuilder AI - CORS and Authentication Fix Script

Write-Host "🔧 Fixing Supabase CORS and Authentication Issues" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Step 1: Kill all Node processes
Write-Host "`n1. Stopping all development servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Check environment variables
Write-Host "`n2. Verifying environment variables..." -ForegroundColor Yellow
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=https://([^.]+)\.supabase\.co") {
    $projectRef = $Matches[1]
    Write-Host "✅ Found Supabase project: $projectRef" -ForegroundColor Green
    Write-Host "   URL: https://$projectRef.supabase.co" -ForegroundColor Gray
} else {
    Write-Host "❌ Could not find valid Supabase URL!" -ForegroundColor Red
    exit 1
}

# Step 3: Create a debug configuration
Write-Host "`n3. Creating debug configuration..." -ForegroundColor Yellow

# Create .env.development.local for explicit development config
@"
# Development environment overrides
NEXT_PUBLIC_SUPABASE_URL=https://$projectRef.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=$($envContent -match 'NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)' | Out-Null; $Matches[1])

# Force development mode
NODE_ENV=development
"@ | Out-File -FilePath ".env.development.local" -Encoding UTF8

Write-Host "✅ Created .env.development.local" -ForegroundColor Green

# Step 4: Show required Supabase dashboard settings
Write-Host "`n4. REQUIRED Supabase Dashboard Settings" -ForegroundColor Red
Write-Host "=======================================" -ForegroundColor Red

Write-Host @"
⚠️  CRITICAL: You MUST update these settings in your Supabase dashboard:

1. Go to: https://supabase.com/dashboard/project/$projectRef/settings/auth

2. Under "URL Configuration", ADD ALL these URLs to "Redirect URLs":
   • http://localhost:3000/auth/callback
   • http://localhost:3001/auth/callback
   • http://localhost:3002/auth/callback
   • http://localhost:3000
   • http://localhost:3001
   • http://localhost:3002

3. Set "Site URL" to:
   • http://localhost:3001

4. Click "Save" and wait 30 seconds for changes to propagate

"@ -ForegroundColor White

# Step 5: Test CORS
Write-Host "`n5. Testing CORS configuration..." -ForegroundColor Yellow

$testUrl = "https://$projectRef.supabase.co/rest/v1/"
try {
    $response = Invoke-WebRequest -Uri $testUrl -Method OPTIONS -Headers @{
        "Origin" = "http://localhost:3001"
        "Access-Control-Request-Method" = "GET"
    } -ErrorAction Stop
    Write-Host "✅ CORS test passed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  CORS not fully configured yet" -ForegroundColor Yellow
    Write-Host "   This is normal if you haven't updated Supabase settings" -ForegroundColor Gray
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update Supabase Auth settings as shown above"
Write-Host "2. Wait 30 seconds for changes to propagate"
Write-Host "3. Run: npm run dev"
Write-Host "4. Visit: http://localhost:3001/auth-test"

$response = Read-Host "`nPress Enter after updating Supabase settings to continue..."

# Start development server
Write-Host "`nStarting development server on port 3001..." -ForegroundColor Yellow
$env:PORT = "3001"
npm run dev 