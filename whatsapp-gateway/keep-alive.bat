@echo off
cd /d "C:\Users\ravid\OneDrive\Desktop\ARK INFRA\whatsapp-gateway"
:loop
netstat -ano | findstr ":3300 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    node server.js >> gateway.log 2>&1
)
timeout /t 4 /nobreak >nul
goto loop
