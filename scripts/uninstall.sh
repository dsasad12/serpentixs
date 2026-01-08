#!/bin/bash

# ============================================
# SerpentixPay - Script de Desinstalación
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

INSTALL_DIR="/var/www/serpentixpay"
USER="serpentixpay"
BACKUP_DIR="/var/backups/serpentixpay"

print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_info() { echo -e "[INFO] $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}Este script debe ejecutarse como root${NC}"
    exit 1
fi

echo -e "${RED}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              DESINSTALACIÓN DE SERPENTIXPAY                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_warning "Esta acción eliminará SerpentixPay y todos sus datos"
echo ""
read -p "¿Crear backup antes de desinstalar? (S/n): " BACKUP_CHOICE
read -p "¿Estás seguro de continuar? (escribir 'ELIMINAR' para confirmar): " CONFIRM

if [[ "$CONFIRM" != "ELIMINAR" ]]; then
    print_info "Desinstalación cancelada"
    exit 0
fi

# Create backup
if [[ ! "$BACKUP_CHOICE" =~ ^[Nn]$ ]]; then
    print_info "Creando backup final..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    mkdir -p $BACKUP_DIR/final_$TIMESTAMP
    
    if [[ -d "$INSTALL_DIR/server/data" ]]; then
        cp -r $INSTALL_DIR/server/data $BACKUP_DIR/final_$TIMESTAMP/
    fi
    if [[ -f "$INSTALL_DIR/server/.env" ]]; then
        cp $INSTALL_DIR/server/.env $BACKUP_DIR/final_$TIMESTAMP/
    fi
    if [[ -d "$INSTALL_DIR/server/uploads" ]]; then
        cp -r $INSTALL_DIR/server/uploads $BACKUP_DIR/final_$TIMESTAMP/
    fi
    
    print_success "Backup creado en $BACKUP_DIR/final_$TIMESTAMP"
fi

# Stop and disable service
print_info "Deteniendo servicio..."
systemctl stop serpentixpay 2>/dev/null || true
systemctl disable serpentixpay 2>/dev/null || true
rm -f /etc/systemd/system/serpentixpay.service
systemctl daemon-reload

# Remove Nginx config
print_info "Eliminando configuración de Nginx..."
rm -f /etc/nginx/sites-enabled/serpentixpay
rm -f /etc/nginx/sites-available/serpentixpay
rm -f /etc/nginx/conf.d/serpentixpay.conf
systemctl reload nginx 2>/dev/null || true

# Remove application files
print_info "Eliminando archivos de la aplicación..."
rm -rf $INSTALL_DIR

# Remove user (optional)
read -p "¿Eliminar usuario del sistema '$USER'? (s/N): " DEL_USER
if [[ "$DEL_USER" =~ ^[Ss]$ ]]; then
    userdel -r $USER 2>/dev/null || true
    print_success "Usuario eliminado"
fi

# Remove SSL certificates (optional)
read -p "¿Eliminar certificados SSL? (s/N): " DEL_SSL
if [[ "$DEL_SSL" =~ ^[Ss]$ ]]; then
    certbot delete --cert-name $(ls /etc/letsencrypt/live/ 2>/dev/null | head -1) 2>/dev/null || true
    print_success "Certificados eliminados"
fi

print_success "SerpentixPay ha sido desinstalado"
echo ""
if [[ ! "$BACKUP_CHOICE" =~ ^[Nn]$ ]]; then
    echo "Backup disponible en: $BACKUP_DIR/final_$TIMESTAMP"
fi
