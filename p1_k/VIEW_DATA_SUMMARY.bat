@echo off
title SkillSwap - View Database Summary
color 0B
echo.
echo ========================================
echo   SkillSwap - Database Summary Viewer
echo ========================================
echo.

cd /d "%~dp0backend"

echo [INFO] Connecting to MongoDB and fetching data summary...
echo.

node view-data.js

echo.
pause






