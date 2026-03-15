@echo off
title Restart Backend with MongoDB Connection
color 0A
echo.
echo ========================================
echo   Restarting Backend with MongoDB
echo ========================================
echo.

REM Add Node.js to PATH
set "PATH=%PATH%;%ProgramFiles%\nodejs"

REM Check MongoDB status
echo [1/3] Checking MongoDB...
netstat -ano | findstr ":27017" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] MongoDB is running on port 27017
) else (
    echo [ERROR] MongoDB is not running!
    echo Please start MongoDB first.
    pause
    exit /b 1
)

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    pause
    exit /b 1
)

echo [2/3] Node.js found
node --version
echo.

REM Navigate to backend
cd /d "%~dp0backend"
if not exist "package.json" (
    echo [ERROR] Backend folder not found!
    pause
    exit /b 1
)

echo [3/3] Starting backend server...
echo.
echo ========================================
echo   Backend Server Starting...
echo ========================================
echo.
echo MongoDB Status: RUNNING ✓
echo Backend will connect to MongoDB automatically
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
call npm run dev

pause







