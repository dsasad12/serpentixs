@echo off
REM ============================================
REM SERPENTIXPAY - Script de Instalación Windows
REM Para MariaDB 12.1
REM ============================================

echo.
echo ============================================
echo   SERPENTIXPAY - INSTALADOR WINDOWS
echo ============================================
echo.

REM Configuración de MariaDB
set MYSQL_PATH=C:\Program Files\MariaDB 12.1\bin
set DB_NAME=serpentixpay
set DB_USER=root

REM Solicitar contraseña
set /p DB_PASS="Ingresa la contraseña de root de MariaDB (deja vacío si no tiene): "

echo.
echo [1/6] Creando base de datos %DB_NAME%...
if "%DB_PASS%"=="" (
    "%MYSQL_PATH%\mysql.exe" -u %DB_USER% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
) else (
    "%MYSQL_PATH%\mysql.exe" -u %DB_USER% -p%DB_PASS% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo crear la base de datos. Verifica tu contraseña.
    pause
    exit /b 1
)
echo [OK] Base de datos creada exitosamente.

echo.
echo [2/6] Actualizando archivo .env con la contraseña...
cd /d E:\serpentixspay\server

REM Actualizar DATABASE_URL en .env
if "%DB_PASS%"=="" (
    powershell -Command "(Get-Content .env) -replace 'DATABASE_URL=\"mysql://root:.*@localhost:3306/serpentixpay\"', 'DATABASE_URL=\"mysql://root:@localhost:3306/serpentixpay\"' | Set-Content .env"
) else (
    powershell -Command "(Get-Content .env) -replace 'DATABASE_URL=\"mysql://root:.*@localhost:3306/serpentixpay\"', 'DATABASE_URL=\"mysql://root:%DB_PASS%@localhost:3306/serpentixpay\"' | Set-Content .env"
)
echo [OK] Archivo .env actualizado.

echo.
echo [3/6] Instalando dependencias del servidor...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error instalando dependencias del servidor.
    pause
    exit /b 1
)
echo [OK] Dependencias del servidor instaladas.

echo.
echo [4/6] Generando cliente Prisma y migrando base de datos...
call npx prisma generate
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error en la migración de la base de datos.
    pause
    exit /b 1
)
echo [OK] Base de datos migrada correctamente.

echo.
echo [5/6] Ejecutando seed de datos iniciales...
call npx prisma db seed
echo [OK] Datos iniciales creados.

echo.
echo [6/6] Instalando dependencias del frontend...
cd /d E:\serpentixspay
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error instalando dependencias del frontend.
    pause
    exit /b 1
)
echo [OK] Dependencias del frontend instaladas.

echo.
echo ============================================
echo   INSTALACIÓN COMPLETADA EXITOSAMENTE!
echo ============================================
echo.
echo Para iniciar el sistema:
echo.
echo   1. Backend:  cd server ^&^& npm run dev
echo   2. Frontend: npm run dev (en otra terminal)
echo.
echo   URLs:
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:3001
echo.
echo   Credenciales de prueba:
echo   - Admin: admin@serpentixs.com / Admin123!
echo   - Cliente: cliente@test.com / Cliente123!
echo.
pause
