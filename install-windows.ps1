# ============================================
# SERPENTIXPAY - Script de Instalación Windows
# Para MariaDB 12.1 (PowerShell)
# ============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SERPENTIXPAY - INSTALADOR WINDOWS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$MYSQL_PATH = "C:\Program Files\MariaDB 12.1\bin"
$DB_NAME = "serpentixpay"
$DB_USER = "root"
$PROJECT_PATH = "E:\serpentixspay"

# Solicitar contraseña
$DB_PASS = Read-Host "Ingresa la contraseña de root de MariaDB (Enter si no tiene)"

Write-Host ""
Write-Host "[1/6] Creando base de datos $DB_NAME..." -ForegroundColor Yellow

try {
    if ([string]::IsNullOrEmpty($DB_PASS)) {
        & "$MYSQL_PATH\mysql.exe" -u $DB_USER -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    } else {
        & "$MYSQL_PATH\mysql.exe" -u $DB_USER "-p$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    }
    Write-Host "[OK] Base de datos creada exitosamente." -ForegroundColor Green
} catch {
    Write-Host "[ERROR] No se pudo crear la base de datos. Verifica tu contraseña." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/6] Actualizando archivo .env con la contraseña..." -ForegroundColor Yellow

Set-Location "$PROJECT_PATH\server"

# Actualizar DATABASE_URL en .env
$envContent = Get-Content .env -Raw
if ([string]::IsNullOrEmpty($DB_PASS)) {
    $newUrl = 'DATABASE_URL="mysql://root:@localhost:3306/serpentixpay"'
} else {
    $newUrl = "DATABASE_URL=`"mysql://root:$DB_PASS@localhost:3306/serpentixpay`""
}
$envContent = $envContent -replace 'DATABASE_URL="mysql://root:.*@localhost:3306/serpentixpay"', $newUrl
Set-Content .env $envContent
Write-Host "[OK] Archivo .env actualizado." -ForegroundColor Green

Write-Host ""
Write-Host "[3/6] Instalando dependencias del servidor..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error instalando dependencias del servidor." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Dependencias del servidor instaladas." -ForegroundColor Green

Write-Host ""
Write-Host "[4/6] Generando cliente Prisma y migrando base de datos..." -ForegroundColor Yellow
npx prisma generate
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error en la migración de la base de datos." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Base de datos migrada correctamente." -ForegroundColor Green

Write-Host ""
Write-Host "[5/6] Ejecutando seed de datos iniciales..." -ForegroundColor Yellow
npx prisma db seed
Write-Host "[OK] Datos iniciales creados." -ForegroundColor Green

Write-Host ""
Write-Host "[6/6] Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location $PROJECT_PATH
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error instalando dependencias del frontend." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Dependencias del frontend instaladas." -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  INSTALACIÓN COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el sistema:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Backend:  cd server; npm run dev" -ForegroundColor White
Write-Host "  2. Frontend: npm run dev (en otra terminal)" -ForegroundColor White
Write-Host ""
Write-Host "  URLs:" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "  Credenciales de prueba:" -ForegroundColor Cyan
Write-Host "  - Admin: admin@serpentixs.com / Admin123!" -ForegroundColor White
Write-Host "  - Cliente: cliente@test.com / Cliente123!" -ForegroundColor White
Write-Host ""

Read-Host "Presiona Enter para continuar"
