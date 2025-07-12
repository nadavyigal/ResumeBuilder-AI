Write-Host "Fixing ChunkLoadError..." -ForegroundColor Yellow

# Kill all Node processes
Write-Host "Stopping all Node processes..." -ForegroundColor Cyan
Get-Process | Where-Object {$_.ProcessName -like "node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Remove build directories
Write-Host "Removing build directories..." -ForegroundColor Cyan
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Cyan
npm cache clean --force

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

# Start dev server
Write-Host "Starting development server on port 3000..." -ForegroundColor Green
Write-Host "Please clear your browser cache (Ctrl+Shift+Delete) and try again!" -ForegroundColor Yellow
npm run dev 