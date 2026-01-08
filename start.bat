@echo off
echo ============================================
echo   SERPENTIXPAY - INICIANDO SISTEMA
echo ============================================
echo.

cd /d "%~dp0"

echo Iniciando Backend (Puerto 3001)...
start "SerpentixPay Backend" cmd /k "cd server && npm run dev"

:: Esperar 3 segundos para que el backend inicie
timeout /t 3 /nobreak >nul

echo Iniciando Frontend (Puerto 5173)...
start "SerpentixPay Frontend" cmd /k "npm run dev"

:: Esperar 5 segundos
timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo   SISTEMA INICIADO
echo ============================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

start http://localhost:5173
