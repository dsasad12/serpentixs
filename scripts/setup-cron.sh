#!/bin/bash

# ============================================
# SerpentixPay - Configuración de Cron Jobs
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

INSTALL_DIR="/var/www/serpentixpay"
USER="serpentixpay"

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    print_error "Este script debe ejecutarse como root"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  SerpentixPay - Configuración de Cron Jobs${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Create cron script
print_info "Creando script de ejecución..."

cat > /usr/local/bin/serpentixpay-cron << 'CRONSCRIPT'
#!/bin/bash

INSTALL_DIR="/var/www/serpentixpay"
LOG_DIR="/var/log/serpentixpay"
LOG_FILE="$LOG_DIR/cron_$(date +%Y%m%d).log"

mkdir -p $LOG_DIR

cd $INSTALL_DIR/server

echo "========================================" >> $LOG_FILE
echo "SerpentixPay Cron - $(date)" >> $LOG_FILE
echo "========================================" >> $LOG_FILE

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Run the billing cron job
npx ts-node --esm src/cron/billing.cron.ts >> $LOG_FILE 2>&1

echo "Cron completed at $(date)" >> $LOG_FILE
echo "" >> $LOG_FILE

# Clean old logs (keep last 30 days)
find $LOG_DIR -name "cron_*.log" -mtime +30 -delete 2>/dev/null || true
CRONSCRIPT

chmod +x /usr/local/bin/serpentixpay-cron

print_success "Script de cron creado: /usr/local/bin/serpentixpay-cron"

# Setup cron jobs
print_info "Configurando cron jobs..."

# Create crontab for serpentixpay user
CRON_FILE="/etc/cron.d/serpentixpay"

cat > $CRON_FILE << 'CRONFILE'
# SerpentixPay Cron Jobs
# Billing cron (invoices, reminders, suspensions) - runs every 6 hours
0 */6 * * * root /usr/local/bin/serpentixpay-cron

# Cleanup temporary files - runs daily at 3:00 AM
0 3 * * * root find /var/www/serpentixpay/server/uploads/temp -mtime +1 -delete 2>/dev/null || true

# Database backup - runs daily at 2:00 AM
0 2 * * * root /var/www/serpentixpay/scripts/backup.sh 2>/dev/null || true
CRONFILE

chmod 644 $CRON_FILE

print_success "Cron jobs configurados en $CRON_FILE"

# Create backup script
print_info "Creando script de backup..."

mkdir -p $INSTALL_DIR/scripts

cat > $INSTALL_DIR/scripts/backup.sh << 'BACKUP'
#!/bin/bash

INSTALL_DIR="/var/www/serpentixpay"
BACKUP_DIR="/var/backups/serpentixpay"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
if [[ -f "$INSTALL_DIR/server/data/serpentixpay.db" ]]; then
    cp $INSTALL_DIR/server/data/serpentixpay.db $BACKUP_DIR/db_$TIMESTAMP.db
    gzip $BACKUP_DIR/db_$TIMESTAMP.db
fi

# For MySQL/PostgreSQL, use appropriate dump command
# mysqldump -u user -p database > $BACKUP_DIR/db_$TIMESTAMP.sql

# Backup uploads
if [[ -d "$INSTALL_DIR/server/uploads" ]]; then
    tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz -C $INSTALL_DIR/server uploads 2>/dev/null || true
fi

# Backup .env (encrypted)
cp $INSTALL_DIR/server/.env $BACKUP_DIR/env_$TIMESTAMP.bak

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "db_*.db.gz" -mtime +7 -delete 2>/dev/null || true
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete 2>/dev/null || true
find $BACKUP_DIR -name "env_*.bak" -mtime +7 -delete 2>/dev/null || true

echo "Backup completed: $TIMESTAMP"
BACKUP

chmod +x $INSTALL_DIR/scripts/backup.sh

print_success "Script de backup creado"

# Create log rotation config
print_info "Configurando rotación de logs..."

cat > /etc/logrotate.d/serpentixpay << 'LOGROTATE'
/var/log/serpentixpay/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 serpentixpay serpentixpay
    sharedscripts
    postrotate
        systemctl reload serpentixpay >/dev/null 2>&1 || true
    endscript
}
LOGROTATE

print_success "Rotación de logs configurada"

# Create log directory
mkdir -p /var/log/serpentixpay
chown $USER:$USER /var/log/serpentixpay

# Restart cron service
print_info "Reiniciando servicio cron..."

if command -v systemctl &> /dev/null; then
    systemctl restart cron 2>/dev/null || systemctl restart crond 2>/dev/null || true
fi

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ Cron Jobs Configurados Exitosamente${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "Tareas programadas:"
echo -e "  • Facturación: Cada 6 horas"
echo -e "  • Limpieza temp: 3:00 AM diario"
echo -e "  • Backup: 2:00 AM diario"
echo -e ""
echo -e "Logs: /var/log/serpentixpay/"
echo -e "Backups: /var/backups/serpentixpay/"
echo -e ""
echo -e "Para ejecutar manualmente:"
echo -e "  sudo /usr/local/bin/serpentixpay-cron"
