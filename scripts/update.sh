#!/bin/bash

# ============================================
# SerpentixPay - Script de Actualización
# Versión: 2.0.0
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

INSTALL_DIR="/var/www/serpentixpay"
USER="serpentixpay"
BACKUP_DIR="/var/backups/serpentixpay"

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  SerpentixPay - Actualización del Sistema${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    print_error "Este script debe ejecutarse como root"
    exit 1
fi

# Check install directory
if [[ ! -d "$INSTALL_DIR" ]]; then
    print_error "Directorio de instalación no encontrado: $INSTALL_DIR"
    exit 1
fi

cd $INSTALL_DIR

# Create backup
print_info "Creando backup..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
if [[ -f "$INSTALL_DIR/server/data/serpentixpay.db" ]]; then
    cp $INSTALL_DIR/server/data/serpentixpay.db $BACKUP_DIR/serpentixpay_$TIMESTAMP.db
    print_success "Base de datos respaldada"
fi

# Backup .env
if [[ -f "$INSTALL_DIR/server/.env" ]]; then
    cp $INSTALL_DIR/server/.env $BACKUP_DIR/.env_$TIMESTAMP
    print_success "Configuración respaldada"
fi

# Backup uploads
if [[ -d "$INSTALL_DIR/server/uploads" ]]; then
    tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz -C $INSTALL_DIR/server uploads 2>/dev/null || true
    print_success "Uploads respaldados"
fi

print_success "Backup creado en $BACKUP_DIR"

# Stop service
print_info "Deteniendo servicio..."
systemctl stop serpentixpay || true

# Pull updates (if using git)
if [[ -d ".git" ]]; then
    print_info "Descargando actualizaciones..."
    sudo -u $USER git fetch origin
    sudo -u $USER git pull origin main
fi

# Install dependencies
print_info "Actualizando dependencias del servidor..."
cd $INSTALL_DIR/server
sudo -u $USER npm install --legacy-peer-deps 2>/dev/null || sudo -u $USER npm install

print_info "Actualizando dependencias del cliente..."
cd $INSTALL_DIR
sudo -u $USER npm install --legacy-peer-deps 2>/dev/null || sudo -u $USER npm install

# Build
print_info "Compilando frontend..."
sudo -u $USER npm run build

print_info "Compilando backend..."
cd $INSTALL_DIR/server
sudo -u $USER npm run build

# Run migrations
print_info "Ejecutando migraciones de base de datos..."
sudo -u $USER npx prisma generate
sudo -u $USER npx prisma db push --accept-data-loss 2>/dev/null || sudo -u $USER npx prisma db push

# Clear cache (if any)
rm -rf $INSTALL_DIR/.vite 2>/dev/null || true
rm -rf $INSTALL_DIR/node_modules/.vite 2>/dev/null || true

# Set permissions
chown -R $USER:$USER $INSTALL_DIR

# Start service
print_info "Iniciando servicio..."
systemctl start serpentixpay

# Wait and check
sleep 3
if systemctl is-active --quiet serpentixpay; then
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ Actualización completada exitosamente${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    print_info "Backup disponible en: $BACKUP_DIR"
else
    print_error "Error al iniciar el servicio después de la actualización"
    print_warning "Restaurando backup..."
    
    # Restore backup
    cp $BACKUP_DIR/.env_$TIMESTAMP $INSTALL_DIR/server/.env
    if [[ -f "$BACKUP_DIR/serpentixpay_$TIMESTAMP.db" ]]; then
        cp $BACKUP_DIR/serpentixpay_$TIMESTAMP.db $INSTALL_DIR/server/data/serpentixpay.db
    fi
    
    chown -R $USER:$USER $INSTALL_DIR
    systemctl start serpentixpay || true
    print_info "Backup restaurado - revisa los logs: journalctl -u serpentixpay -f"
fi
    exit 1
fi

# Cleanup old backups (keep last 5)
cd $BACKUP_DIR
ls -t *.db 2>/dev/null | tail -n +6 | xargs -r rm --
ls -t .env_* 2>/dev/null | tail -n +6 | xargs -r rm --

print_success "¡Actualización completada!"
echo ""
echo "Versión actual: $(cat $INSTALL_DIR/package.json | grep version | head -1 | cut -d'"' -f4)"
