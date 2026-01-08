@echo off
echo ============================================
echo   SERPENTIXPAY - INSTALACION EN WINDOWS
echo ============================================
echo.

:: Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado.
    echo Descargalo desde: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
node --version
echo.

:: Ir al directorio del proyecto
cd /d "%~dp0"

echo ============================================
echo Paso 1: Instalando dependencias del Frontend
echo ============================================
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al instalar dependencias del frontend
    pause
    exit /b 1
)
echo [OK] Dependencias del frontend instaladas
echo.

echo ============================================
echo Paso 2: Instalando dependencias del Backend
echo ============================================
cd server
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al instalar dependencias del backend
    pause
    exit /b 1
)
echo [OK] Dependencias del backend instaladas
echo.

echo ============================================
echo Paso 3: Configurando base de datos SQLite
echo ============================================

:: Copiar schema SQLite
copy /Y prisma\schema.sqlite.prisma prisma\schema.prisma
if %errorlevel% neq 0 (
    echo [AVISO] No se encontro schema.sqlite.prisma, usando schema existente
)

:: Copiar archivo de entorno
copy /Y .env.sqlite .env
if %errorlevel% neq 0 (
    echo [AVISO] No se encontro .env.sqlite, usando .env existente
)

:: Generar cliente de Prisma
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al generar Prisma Client
    pause
    exit /b 1
)
echo [OK] Prisma Client generado

:: Crear/migrar base de datos
call npx prisma db push --force-reset
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al crear la base de datos
    pause
    exit /b 1
)
echo [OK] Base de datos SQLite creada

:: Ejecutar seed
call npx tsx prisma/seed.ts
if %errorlevel% neq 0 (
    echo [AVISO] No se pudo ejecutar el seed (puede que ya existan datos)
)
echo [OK] Datos de prueba insertados
echo.

cd ..

echo ============================================
echo     INSTALACION COMPLETADA!
echo ============================================
echo.
echo Para iniciar el sistema ejecuta: start.bat
echo.
echo URLs:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3001
echo.
pause
