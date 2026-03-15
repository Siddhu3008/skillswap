@echo off
title SkillSwap - Starting Servers
color 0B
echo.
echo ========================================
echo   SkillSwap - Starting Website
echo ========================================
echo.

REM Add Node.js to PATH
set "PATH=%PATH%;%ProgramFiles%\nodejs"

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version
echo.

REM Start Backend
echo [1/2] Starting Backend Server (port 5000)...
start "SkillSwap Backend" cmd /k "cd /d %~dp0backend && set PATH=%PATH%;%ProgramFiles%\nodejs && npm run dev"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Frontend Server (port 5173)...
start "SkillSwap Frontend" cmd /k "cd /d %~dp0frontend && set PATH=%PATH%;%ProgramFiles%\nodejs && npm run dev"

REM Wait for servers to start
echo.
echo [INFO] Waiting for servers to start...
timeout /t 8 /nobreak >nul

REM Open browser
echo [INFO] Opening website in browser...
start http://localhost:5173

echo.
echo ========================================
echo   ✅ Website is starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Two windows opened:
echo   - Backend server (keep it open)
echo   - Frontend server (keep it open)
echo.
echo Your browser should open automatically.
echo If not, go to: http://localhost:5173
echo.
pause







