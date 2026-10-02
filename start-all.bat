@echo off
title ARK Infra Services Launcher
echo ============================================================
echo           ARK INFRA - STARTING ALL SERVICES
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "ARK Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Node.js Web Server on http://localhost:3000 ...
start "ARK Web Server (Port 3000)" cmd /k "cd /d "%~dp0" && node server.js"

timeout /t 2 /nobreak >nul

echo.
echo ============================================================
echo Services started successfully!
echo - Web Server:     http://localhost:3000
echo - Admin Portal:   http://localhost:3000/admin.html
echo - Backend API:    http://127.0.0.1:8000/docs
echo ============================================================
echo.
echo Opening Admin Portal in your default browser...
start http://localhost:3000/admin.html
pause
