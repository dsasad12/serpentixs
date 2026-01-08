@echo off
echo ============================================
echo   SERPENTIXPAY - DETENIENDO SISTEMA
echo ============================================
echo.

:: Matar procesos de Node.js que usan los puertos
echo Deteniendo procesos...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    taskkill /F /PID %%a >nul 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    taskkill /F /PID %%a >nul 2>nul
)

echo [OK] Sistema detenido
echo.
pause
