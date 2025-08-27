@echo off
echo ========================================
echo JARVIS Voice Assistant - Local Deployment
echo ========================================
echo.

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found

echo.
echo [2/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [3/5] Checking environment configuration...
if not exist ".env.local" (
    echo ERROR: .env.local file not found
    echo Please ensure the environment file is configured
    pause
    exit /b 1
)
echo ✓ Environment file found

echo.
echo [4/5] Starting local development server...
echo.
echo JARVIS will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start

echo.
echo Deployment completed successfully!
pause
