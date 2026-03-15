@echo off
title MongoDB Setup Helper
color 0E
echo.
echo ========================================
echo   MongoDB Setup Helper
echo ========================================
echo.

REM Check if MongoDB is installed
where mongod >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] MongoDB is installed!
    mongod --version
    echo.
    
    REM Check if service is running
    sc query MongoDB >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [INFO] Checking MongoDB service...
        for /f "tokens=3" %%a in ('sc query MongoDB ^| findstr "STATE"') do set STATE=%%a
        if "!STATE!"=="RUNNING" (
            echo [OK] MongoDB service is RUNNING
            echo.
            echo MongoDB is ready to use!
            echo Restart your backend server to connect.
            echo.
        ) else (
            echo [WARNING] MongoDB service is not running
            echo Attempting to start...
            net start MongoDB
            if %ERRORLEVEL% EQU 0 (
                echo [OK] MongoDB service started!
            ) else (
                echo [ERROR] Could not start MongoDB service
                echo You may need administrator rights.
            )
        )
    ) else (
        echo [INFO] MongoDB service not found
        echo MongoDB might be installed but not as a service.
    )
    
    echo.
    pause
    exit /b 0
)

echo [INFO] MongoDB is NOT installed
echo.
echo ========================================
echo   Installation Options
echo ========================================
echo.
echo Option 1: Install MongoDB Community Server (Local)
echo   - Download: https://www.mongodb.com/try/download/community
echo   - Works offline, faster
echo   - Requires ~200MB installation
echo.
echo Option 2: Use MongoDB Atlas (Cloud)
echo   - No installation needed
echo   - Free tier available
echo   - Requires internet
echo   - Sign up: https://www.mongodb.com/cloud/atlas/register
echo.
echo ========================================
echo.

REM Open download page
echo Opening MongoDB download page...
start https://www.mongodb.com/try/download/community

echo.
echo Instructions:
echo 1. Download MongoDB Community Server
echo 2. Install it (check "Install as a Service")
echo 3. Run this script again to verify
echo.
pause







