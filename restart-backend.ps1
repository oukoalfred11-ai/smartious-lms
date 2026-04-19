#!/usr/bin/env pwsh
# Restart backend server script

Write-Host "🔄 Restarting backend server..." -ForegroundColor Cyan

# Kill existing Node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✓ Old processes stopped" -ForegroundColor Green

# Wait for cleanup
Start-Sleep -Seconds 2

# Start fresh backend
Write-Host "✓ Starting new backend server..." -ForegroundColor Green
Set-Location C:\Users\Prodigy\smartious-lms\backend
node src/index.js


