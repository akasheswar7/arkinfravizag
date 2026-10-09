@echo off
title ARK Infra - WhatsApp Free Gateway
color 0A
echo ===================================================
echo     ARK INFRA VIZAG - WHATSAPP FREE GATEWAY
echo ===================================================

if exist "%~dp0whatsapp-gateway\server.js" (
    cd /d "%~dp0whatsapp-gateway"
) else if exist "%~dp0ARK INFRA\whatsapp-gateway\server.js" (
    cd /d "%~dp0ARK INFRA\whatsapp-gateway"
) else if exist "C:\Users\ravid\OneDrive\Desktop\ARK INFRA\whatsapp-gateway\server.js" (
    cd /d "C:\Users\ravid\OneDrive\Desktop\ARK INFRA\whatsapp-gateway"
) else (
    echo [ERROR] Could not locate whatsapp-gateway directory.
    pause
    exit /b 1
)

echo Starting Free WhatsApp Gateway on http://localhost:3300 ...
echo.

REM Automatically open QR code dashboard in browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3300"

node server.js
pause
