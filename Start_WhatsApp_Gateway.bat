@echo off
title ARK Infra - WhatsApp Free Gateway
color 0A
echo ===================================================
echo     ARK INFRA VIZAG - WHATSAPP FREE GATEWAY
echo ===================================================
echo Starting Free WhatsApp Gateway on http://localhost:3300 ...
echo.
cd /d "%~dp0whatsapp-gateway"

REM Automatically open QR code dashboard in browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3300"

node server.js
pause
