@echo off
title SkillSwap Backend Server
color 0A
echo.
echo ========================================
echo   SkillSwap Backend Server
echo ========================================
echo.

REM Add Node.js to PATH
set "PATH=%PATH%;%ProgramFiles%\nodejs"

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found in PATH!
    echo.
    echo Please add Node.js to your system PATH, or install Node.js from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
npm --version
echo.

REM Navigate to backend directory
cd /d "%~dp0backend"
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Make sure you're running this from the correct directory.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

echo [INFO] Starting backend server on port 5000...
echo [INFO] Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

REM Start the server
call npm run dev

echo.
echo ========================================
echo Server stopped.
pause







