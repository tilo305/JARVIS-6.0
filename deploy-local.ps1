# JARVIS Voice Assistant - Local Deployment Script
# PowerShell Version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JARVIS Voice Assistant - Local Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "[2/5] Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check environment configuration
Write-Host ""
Write-Host "[3/5] Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found" -ForegroundColor Red
    Write-Host "Please ensure the environment file is configured" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Environment file found" -ForegroundColor Green

# Display configuration
Write-Host ""
Write-Host "[4/5] Environment Configuration:" -ForegroundColor Yellow
Get-Content ".env.local" | ForEach-Object {
    if ($_ -match "REACT_APP_") {
        Write-Host "  $_" -ForegroundColor Gray
    }
}

# Start development server
Write-Host ""
Write-Host "[5/5] Starting local development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "JARVIS will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

try {
    npm start
} catch {
    Write-Host ""
    Write-Host "Server stopped or encountered an error" -ForegroundColor Red
}

Write-Host ""
Write-Host "Deployment completed!" -ForegroundColor Green
Read-Host "Press Enter to exit"
