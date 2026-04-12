@echo off
title DocForge - Startup Script
color 0B

echo.
echo  ============================================
echo     DocForge - Multipurpose Application
echo  ============================================
echo.
echo  Starting Backend (Spring Boot) on port 8080
echo  Starting Frontend (Angular) on port 4200
echo  ============================================
echo.

:: Start Backend in a new window (using Maven Wrapper - no Maven install needed)
echo [1/2] Launching Spring Boot Backend...
start "DocForge Backend - Port 8080" cmd /k "cd /d "%~dp0backend" && echo Starting Spring Boot... && mvnw.cmd spring-boot:run"

:: Wait a few seconds for backend to begin initializing
echo       Waiting 5 seconds before starting frontend...
timeout /t 5 /nobreak >nul

:: Start Frontend in a new window
echo [2/2] Launching Angular Frontend...
start "DocForge Frontend - Port 4200" cmd /k "cd /d "%~dp0frontend" && echo Starting Angular Dev Server... && npm start"

echo.
echo  ============================================
echo   Both servers are starting!
echo.
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:4200
echo.
echo   Close this window anytime.
echo   To stop servers, close their windows.
echo  ============================================
echo.

:: Wait and then open browser
timeout /t 20 /nobreak >nul
echo  Opening browser...
start http://localhost:4200

pause
