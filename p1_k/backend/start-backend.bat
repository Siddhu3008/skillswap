@echo off
echo Starting SkillSwap Backend Server...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    echo After installing Node.js:
    echo 1. Close this window
    echo 2. Reopen PowerShell/Command Prompt
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not found!
    echo Node.js might not be installed correctly.
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting server on port 5000...
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
call npm run dev

pause







