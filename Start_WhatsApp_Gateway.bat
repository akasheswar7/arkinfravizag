@echo off
title ARK Infra - WhatsApp Free Gateway
color 0A
echo ===================================================
echo     ARK INFRA VIZAG - WHATSAPP FREE GATEWAY
echo ===================================================
echo.
echo Starting WhatsApp Gateway Engine in the background (24/7 Auto-Run)...

wscript.exe "C:\Users\ravid\OneDrive\Desktop\ARK INFRA\whatsapp-gateway\start-silent.vbs"

timeout /t 2 /nobreak >nul
start http://localhost:3300
echo.
echo [SUCCESS] Gateway Engine is now running silently in the background!
echo Even if you close this window, the Gateway will stay running.
timeout /t 3 /nobreak >nul
exit
