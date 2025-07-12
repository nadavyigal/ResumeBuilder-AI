Write-Host "ResumeBuilder AI - Setup and Diagnostic Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path .env.local) {
    Write-Host "✓ .env.local file found" -ForegroundColor Green
    
    # Read current values
    $envContent = Get-Content .env.local
    $supabaseUrl = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_URL=").Line.Split("=")[1]
    $supabaseAnon = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_ANON_KEY=").Line.Split("=")[1]
    $openaiKey = ($envContent | Select-String "OPENAI_API_KEY=").Line.Split("=")[1]
    
    Write-Host ""
    Write-Host "Current Configuration:" -ForegroundColor Yellow
    Write-Host "- Supabase URL: $supabaseUrl" -ForegroundColor Gray
    
    if ($supabaseAnon -eq "YOUR_ANON_KEY_HERE") {
        Write-Host "- Supabase Anon Key: ❌ NOT SET (placeholder found)" -ForegroundColor Red
        Write-Host ""
        Write-Host "ACTION REQUIRED:" -ForegroundColor Red
        Write-Host "1. Go to: https://supabase.com/dashboard/project/krkscarxayskwaeazate/settings/api" -ForegroundColor Yellow
        Write-Host "2. Copy the 'anon public' key (starts with 'eyJ...')" -ForegroundColor Yellow
        Write-Host "3. Replace 'YOUR_ANON_KEY_HERE' in .env.local with the copied key" -ForegroundColor Yellow
    } else {
        Write-Host "- Supabase Anon Key: ✓ Set" -ForegroundColor Green
    }
    
    if ($openaiKey -eq "YOUR_OPENAI_API_KEY_HERE") {
        Write-Host "- OpenAI API Key: ❌ NOT SET (placeholder found)" -ForegroundColor Red
        Write-Host ""
        Write-Host "ACTION REQUIRED:" -ForegroundColor Red
        Write-Host "1. Go to: https://platform.openai.com/api-keys" -ForegroundColor Yellow
        Write-Host "2. Create a new API key" -ForegroundColor Yellow
        Write-Host "3. Replace 'YOUR_OPENAI_API_KEY_HERE' in .env.local with the API key" -ForegroundColor Yellow
    } else {
        Write-Host "- OpenAI API Key: ✓ Set" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "Creating from template..." -ForegroundColor Yellow
    Copy-Item ENV_TEMPLATE.txt .env.local
    Write-Host "✓ Created .env.local - Please update with your API keys" -ForegroundColor Green
}

Write-Host ""
Write-Host "Checking Node.js dependencies..." -ForegroundColor Cyan
if (Test-Path node_modules) {
    Write-Host "✓ node_modules found" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules not found - running npm install..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Cleaning build cache..." -ForegroundColor Cyan
if (Test-Path .next) {
    Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Cleaned .next directory" -ForegroundColor Green
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "========" -ForegroundColor Cyan

$ready = $true
if ($supabaseAnon -eq "YOUR_ANON_KEY_HERE") {
    Write-Host "❌ Missing Supabase Anon Key" -ForegroundColor Red
    $ready = $false
}
if ($openaiKey -eq "YOUR_OPENAI_API_KEY_HERE") {
    Write-Host "❌ Missing OpenAI API Key" -ForegroundColor Red
    $ready = $false
}

if ($ready) {
    Write-Host ""
    Write-Host "✓ All API keys are configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to start the application. Run:" -ForegroundColor Green
    Write-Host "  npm run dev" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then visit:" -ForegroundColor Green
    Write-Host "  http://localhost:3000" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Please configure the missing API keys before starting the application." -ForegroundColor Red
    Write-Host ""
    Write-Host "After updating .env.local, run this script again to verify." -ForegroundColor Yellow
} 