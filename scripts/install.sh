#!/bin/bash

# ============================================
# SerpentixPay - Script de Instalación
# Compatible con Ubuntu 20.04+, Debian 11+, CentOS 8+
# Versión: 2.0.0
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variables
INSTALL_DIR="/var/www/serpentixpay"
USER="serpentixpay"
NODE_VERSION="20"
DB_TYPE="mariadb"
DOMAIN=""
EMAIL=""
SETUP_SSL=false

# Payment Gateway Variables
PAYPAL_ENABLED="false"
PAYPAL_CLIENT_ID=""
PAYPAL_SECRET=""
PAYPAL_MODE="sandbox"

MERCADOPAGO_ENABLED="false"
MERCADOPAGO_COUNTRY=""
MERCADOPAGO_PUBLIC_KEY=""
MERCADOPAGO_ACCESS_TOKEN=""

CRYPTO_ENABLED="false"
CRYPTO_PROVIDER=""
CRYPTO_API_KEY=""

BANK_TRANSFER_ENABLED="false"

# Integration Variables
PTERODACTYL_ENABLED="false"
PTERODACTYL_URL=""
PTERODACTYL_API_KEY=""

VIRTUALIZOR_ENABLED="false"
VIRTUALIZOR_HOST=""
VIRTUALIZOR_API_KEY=""
VIRTUALIZOR_API_PASS=""

# Banner
print_banner() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║   ███████╗███████╗██████╗ ██████╗ ███████╗███╗   ██╗████████╗ ║"
    echo "║   ██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝████╗  ██║╚══██╔══╝ ║"
    echo "║   ███████╗█████╗  ██████╔╝██████╔╝█████╗  ██╔██╗ ██║   ██║    ║"
    echo "║   ╚════██║██╔══╝  ██╔══██╗██╔═══╝ ██╔══╝  ██║╚██╗██║   ██║    ║"
    echo "║   ███████║███████╗██║  ██║██║     ███████╗██║ ╚████║   ██║    ║"
    echo "║   ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═══╝   ╚═╝    ║"
    echo "║                     I X   P A Y                                ║"
    echo "║                                                               ║"
    echo "║           Sistema de Facturación para Hosting                 ║"
    echo "║                      v2.0.0                                   ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }
print_step() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Este script debe ejecutarse como root"
        print_info "Ejecuta: sudo bash $0"
        exit 1
    fi
}

detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    else
        print_error "No se pudo detectar el sistema operativo"
        exit 1
    fi

    case $OS in
        ubuntu)
            [[ "${OS_VERSION%%.*}" -lt 20 ]] && { print_error "Se requiere Ubuntu 20.04+"; exit 1; }
            PACKAGE_MANAGER="apt"
            ;;
        debian)
            [[ "${OS_VERSION%%.*}" -lt 11 ]] && { print_error "Se requiere Debian 11+"; exit 1; }
            PACKAGE_MANAGER="apt"
            ;;
        centos|rhel|rocky|almalinux)
            [[ "${OS_VERSION%%.*}" -lt 8 ]] && { print_error "Se requiere CentOS/RHEL 8+"; exit 1; }
            PACKAGE_MANAGER="dnf"
            ;;
        *)
            print_error "Sistema operativo no soportado: $OS"
            exit 1
            ;;
    esac
    print_success "Sistema operativo detectado: $OS $OS_VERSION"
}

configure_installation() {
    print_step "Configuración de la instalación"
    
    while [[ -z "$DOMAIN" ]]; do
        read -p "Ingresa tu dominio (ej: billing.ejemplo.com): " DOMAIN
        [[ -z "$DOMAIN" ]] && print_warning "El dominio es requerido"
    done
    
    read -p "Ingresa tu email (para certificado SSL): " EMAIL
    
    echo -e "\nSelecciona el tipo de base de datos:"
    echo "  1) SQLite (recomendado para pruebas)"
    echo "  2) MySQL/MariaDB"
    echo "  3) PostgreSQL"
    read -p "Opción [1]: " DB_CHOICE
    
    case $DB_CHOICE in
        2)
            DB_TYPE="mysql"
            read -p "Host de MySQL [localhost]: " DB_HOST; DB_HOST=${DB_HOST:-localhost}
            read -p "Puerto de MySQL [3306]: " DB_PORT; DB_PORT=${DB_PORT:-3306}
            read -p "Nombre de la base de datos [serpentixpay]: " DB_NAME; DB_NAME=${DB_NAME:-serpentixpay}
            read -p "Usuario de MySQL [serpentixpay]: " DB_USER; DB_USER=${DB_USER:-serpentixpay}
            read -sp "Contraseña de MySQL: " DB_PASS; echo
            ;;
        3)
            DB_TYPE="postgresql"
            read -p "Host de PostgreSQL [localhost]: " DB_HOST; DB_HOST=${DB_HOST:-localhost}
            read -p "Puerto de PostgreSQL [5432]: " DB_PORT; DB_PORT=${DB_PORT:-5432}
            read -p "Nombre de la base de datos [serpentixpay]: " DB_NAME; DB_NAME=${DB_NAME:-serpentixpay}
            read -p "Usuario de PostgreSQL [serpentixpay]: " DB_USER; DB_USER=${DB_USER:-serpentixpay}
            read -sp "Contraseña de PostgreSQL: " DB_PASS; echo
            ;;
        *) DB_TYPE="sqlite" ;;
    esac
    
    if [[ -n "$EMAIL" ]]; then
        read -p "¿Configurar certificado SSL con Let's Encrypt? (s/N): " SSL_CHOICE
        [[ "$SSL_CHOICE" =~ ^[Ss]$ ]] && SETUP_SSL=true
    fi
}

configure_payment_gateways() {
    print_step "Configuración de Pasarelas de Pago"
    
    read -p "¿Configurar pasarelas de pago ahora? (s/N): " CONFIGURE_PAYMENTS
    [[ ! "$CONFIGURE_PAYMENTS" =~ ^[Ss]$ ]] && return
    
    # PayPal
    echo -e "\n${CYAN}── PayPal ──${NC}"
    read -p "¿Habilitar PayPal? (s/N): " ENABLE_PAYPAL
    if [[ "$ENABLE_PAYPAL" =~ ^[Ss]$ ]]; then
        PAYPAL_ENABLED="true"
        read -p "Client ID de PayPal: " PAYPAL_CLIENT_ID
        read -sp "Client Secret de PayPal: " PAYPAL_SECRET; echo
        read -p "Modo (sandbox/live) [sandbox]: " PAYPAL_MODE; PAYPAL_MODE=${PAYPAL_MODE:-sandbox}
    fi
    
    # MercadoPago
    echo -e "\n${CYAN}── MercadoPago ──${NC}"
    read -p "¿Habilitar MercadoPago? (s/N): " ENABLE_MP
    if [[ "$ENABLE_MP" =~ ^[Ss]$ ]]; then
        MERCADOPAGO_ENABLED="true"
        echo "Países: AR, BR, CL, CO, MX, PE, UY"
        read -p "Código de país [MX]: " MERCADOPAGO_COUNTRY; MERCADOPAGO_COUNTRY=${MERCADOPAGO_COUNTRY:-MX}
        read -p "Public Key: " MERCADOPAGO_PUBLIC_KEY
        read -sp "Access Token: " MERCADOPAGO_ACCESS_TOKEN; echo
    fi
    
    # Crypto
    echo -e "\n${CYAN}── Criptomonedas ──${NC}"
    read -p "¿Habilitar pagos con crypto? (s/N): " ENABLE_CRYPTO
    if [[ "$ENABLE_CRYPTO" =~ ^[Ss]$ ]]; then
        CRYPTO_ENABLED="true"
        echo "Proveedores: coingate, nowpayments, coinpayments"
        read -p "Proveedor [coingate]: " CRYPTO_PROVIDER; CRYPTO_PROVIDER=${CRYPTO_PROVIDER:-coingate}
        read -sp "API Key: " CRYPTO_API_KEY; echo
    fi
    
    # Bank Transfer
    echo -e "\n${CYAN}── Transferencia Bancaria ──${NC}"
    read -p "¿Habilitar transferencias bancarias? (s/N): " ENABLE_BANK
    [[ "$ENABLE_BANK" =~ ^[Ss]$ ]] && BANK_TRANSFER_ENABLED="true"
}

configure_integrations() {
    print_step "Configuración de Integraciones de Servidores"
    
    read -p "¿Configurar integraciones ahora? (s/N): " CONFIGURE_INT
    [[ ! "$CONFIGURE_INT" =~ ^[Ss]$ ]] && return
    
    # Pterodactyl
    echo -e "\n${CYAN}── Pterodactyl Panel ──${NC}"
    read -p "¿Habilitar Pterodactyl? (s/N): " ENABLE_PTERO
    if [[ "$ENABLE_PTERO" =~ ^[Ss]$ ]]; then
        PTERODACTYL_ENABLED="true"
        read -p "URL del Panel (ej: https://panel.example.com): " PTERODACTYL_URL
        read -sp "Application API Key (ptla_xxx): " PTERODACTYL_API_KEY; echo
    fi
    
    # Virtualizor
    echo -e "\n${CYAN}── Virtualizor ──${NC}"
    read -p "¿Habilitar Virtualizor? (s/N): " ENABLE_VIRT
    if [[ "$ENABLE_VIRT" =~ ^[Ss]$ ]]; then
        VIRTUALIZOR_ENABLED="true"
        read -p "Host de Virtualizor: " VIRTUALIZOR_HOST
        read -sp "API Key: " VIRTUALIZOR_API_KEY; echo
        read -sp "API Pass: " VIRTUALIZOR_API_PASS; echo
    fi
}

show_summary() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}                   RESUMEN DE CONFIGURACIÓN                     ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
    echo -e "  ${YELLOW}General:${NC} Dominio: $DOMAIN | DB: $DB_TYPE | SSL: $SETUP_SSL"
    echo -e "  ${YELLOW}Pagos:${NC} PayPal: $PAYPAL_ENABLED | MercadoPago: $MERCADOPAGO_ENABLED | Crypto: $CRYPTO_ENABLED | Banco: $BANK_TRANSFER_ENABLED"
    echo -e "  ${YELLOW}Integraciones:${NC} Pterodactyl: $PTERODACTYL_ENABLED | Virtualizor: $VIRTUALIZOR_ENABLED\n"
    
    read -p "¿Continuar con la instalación? (S/n): " CONFIRM
    [[ "$CONFIRM" =~ ^[Nn]$ ]] && { print_info "Instalación cancelada"; exit 0; }
}

update_system() {
    print_step "Actualizando sistema"
    if [[ "$PACKAGE_MANAGER" == "apt" ]]; then
        apt update -y && apt upgrade -y
        apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    else
        dnf update -y
        dnf install -y curl wget git unzip epel-release
    fi
    print_success "Sistema actualizado"
}

install_nodejs() {
    print_step "Instalando Node.js $NODE_VERSION"
    if command -v node &> /dev/null; then
        CURRENT_NODE=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        [[ "$CURRENT_NODE" -ge "$NODE_VERSION" ]] && { print_success "Node.js ya instalado (v$(node -v))"; return; }
    fi
    
    if [[ "$PACKAGE_MANAGER" == "apt" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt install -y nodejs
    else
        curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash -
        dnf install -y nodejs
    fi
    npm install -g pnpm
    print_success "Node.js $(node -v) instalado"
}

install_nginx() {
    print_step "Instalando Nginx"
    [[ "$PACKAGE_MANAGER" == "apt" ]] && apt install -y nginx || dnf install -y nginx
    systemctl enable nginx && systemctl start nginx
    print_success "Nginx instalado"
}

install_database() {
    print_step "Configurando base de datos"
    case $DB_TYPE in
        mysql)
            [[ "$PACKAGE_MANAGER" == "apt" ]] && apt install -y mariadb-server mariadb-client || dnf install -y mariadb-server mariadb
            systemctl enable mariadb && systemctl start mariadb
            mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
            mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost'; FLUSH PRIVILEGES;"
            DATABASE_URL="mysql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
            ;;
        postgresql)
            [[ "$PACKAGE_MANAGER" == "apt" ]] && apt install -y postgresql postgresql-contrib || { dnf install -y postgresql-server postgresql; postgresql-setup --initdb; }
            systemctl enable postgresql && systemctl start postgresql
            sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
            sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
            DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
            ;;
        sqlite) DATABASE_URL="file:./data/serpentixpay.db" ;;
    esac
    print_success "Base de datos configurada"
}

create_user() {
    print_step "Creando usuario del sistema"
    id "$USER" &>/dev/null || useradd -m -d /home/$USER -s /bin/bash $USER
    print_success "Usuario $USER listo"
}

install_application() {
    print_step "Instalando SerpentixPay"
    mkdir -p $INSTALL_DIR && cd $INSTALL_DIR
    
    print_info "Instalando dependencias del servidor..."
    cd $INSTALL_DIR/server && { pnpm install --frozen-lockfile 2>/dev/null || npm install; }
    
    print_info "Instalando dependencias del cliente..."
    cd $INSTALL_DIR && { pnpm install --frozen-lockfile 2>/dev/null || npm install; }
    
    print_info "Compilando frontend..."
    pnpm build 2>/dev/null || npm run build
    
    print_info "Compilando backend..."
    cd $INSTALL_DIR/server && { pnpm build 2>/dev/null || npm run build; }
    
    chown -R $USER:$USER $INSTALL_DIR
    print_success "Aplicación instalada"
}

configure_environment() {
    print_step "Configurando entorno"
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    SESSION_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    
    cat > $INSTALL_DIR/server/.env << EOF
# SerpentixPay Configuration - $(date)
APP_NAME="SerpentixPay"
APP_URL="https://$DOMAIN"
APP_ENV="production"
APP_DEBUG="false"

PORT=3001
HOST="127.0.0.1"
CORS_ORIGIN="https://$DOMAIN"

DATABASE_PROVIDER="$DB_TYPE"
DATABASE_URL="$DATABASE_URL"

JWT_SECRET="$JWT_SECRET"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
JWT_REFRESH_EXPIRES_IN="30d"

BCRYPT_ROUNDS="12"
SESSION_SECRET="$SESSION_SECRET"

# PayPal
PAYPAL_ENABLED="$PAYPAL_ENABLED"
PAYPAL_CLIENT_ID="$PAYPAL_CLIENT_ID"
PAYPAL_CLIENT_SECRET="$PAYPAL_SECRET"
PAYPAL_MODE="$PAYPAL_MODE"

# MercadoPago
MERCADOPAGO_ENABLED="$MERCADOPAGO_ENABLED"
MERCADOPAGO_${MERCADOPAGO_COUNTRY:-MX}_PUBLIC_KEY="$MERCADOPAGO_PUBLIC_KEY"
MERCADOPAGO_${MERCADOPAGO_COUNTRY:-MX}_ACCESS_TOKEN="$MERCADOPAGO_ACCESS_TOKEN"

# Crypto
CRYPTO_ENABLED="$CRYPTO_ENABLED"
CRYPTO_PROVIDER="$CRYPTO_PROVIDER"
COINGATE_API_KEY="$CRYPTO_API_KEY"

# Bank Transfer
BANK_TRANSFER_ENABLED="$BANK_TRANSFER_ENABLED"

# Pterodactyl
PTERODACTYL_ENABLED="$PTERODACTYL_ENABLED"
PTERODACTYL_URL="$PTERODACTYL_URL"
PTERODACTYL_API_KEY="$PTERODACTYL_API_KEY"

# Virtualizor
VIRTUALIZOR_ENABLED="$VIRTUALIZOR_ENABLED"
VIRTUALIZOR_HOST="$VIRTUALIZOR_HOST"
VIRTUALIZOR_PORT="4085"
VIRTUALIZOR_SSL="true"
VIRTUALIZOR_API_KEY="$VIRTUALIZOR_API_KEY"
VIRTUALIZOR_API_PASS="$VIRTUALIZOR_API_PASS"

COMPANY_NAME="Mi Empresa Hosting"
COMPANY_EMAIL="contacto@$DOMAIN"
CURRENCY="USD"
TAX_ENABLED="true"
TAX_RATE="16"
LOG_LEVEL="info"
EOF
    
    chown $USER:$USER $INSTALL_DIR/server/.env && chmod 600 $INSTALL_DIR/server/.env
    mkdir -p $INSTALL_DIR/server/{logs,data,uploads}
    chown -R $USER:$USER $INSTALL_DIR/server/{logs,data,uploads}
    print_success "Entorno configurado"
}

setup_database() {
    print_step "Inicializando base de datos"
    cd $INSTALL_DIR/server
    sudo -u $USER npx prisma generate
    sudo -u $USER npx prisma db push
    sudo -u $USER npx tsx prisma/seed.ts
    print_success "Base de datos inicializada"
}

configure_nginx() {
    print_step "Configurando Nginx"
    cat > /etc/nginx/sites-available/serpentixpay << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $INSTALL_DIR/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads {
        alias $INSTALL_DIR/server/uploads;
        expires 30d;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    
    [[ "$PACKAGE_MANAGER" == "apt" ]] && { ln -sf /etc/nginx/sites-available/serpentixpay /etc/nginx/sites-enabled/; rm -f /etc/nginx/sites-enabled/default; } || mv /etc/nginx/sites-available/serpentixpay /etc/nginx/conf.d/serpentixpay.conf
    nginx -t && systemctl reload nginx
    print_success "Nginx configurado"
}

setup_ssl() {
    [[ "$SETUP_SSL" != true ]] && return
    print_step "Configurando SSL con Let's Encrypt"
    [[ "$PACKAGE_MANAGER" == "apt" ]] && apt install -y certbot python3-certbot-nginx || dnf install -y certbot python3-certbot-nginx
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL
    print_success "SSL configurado"
}

create_service() {
    print_step "Creando servicio systemd"
    cat > /etc/systemd/system/serpentixpay.service << EOF
[Unit]
Description=SerpentixPay - Sistema de Facturación
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR/server
ExecStart=/usr/bin/node dist/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload && systemctl enable serpentixpay && systemctl start serpentixpay
    sleep 3
    systemctl is-active --quiet serpentixpay && print_success "Servicio iniciado" || { print_error "Error al iniciar"; journalctl -u serpentixpay -n 20 --no-pager; }
}

configure_firewall() {
    print_step "Configurando firewall"
    command -v ufw &> /dev/null && { ufw allow 'Nginx Full'; ufw allow ssh; }
    command -v firewall-cmd &> /dev/null && { firewall-cmd --permanent --add-service=http; firewall-cmd --permanent --add-service=https; firewall-cmd --reload; }
    print_success "Firewall configurado"
}

print_completion() {
    echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════╗"
    echo "║           ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!              ║"
    echo -e "╚═══════════════════════════════════════════════════════════════╝${NC}\n"
    
    [[ "$SETUP_SSL" == true ]] && echo -e "URL: ${GREEN}https://$DOMAIN${NC}" || echo -e "URL: ${GREEN}http://$DOMAIN${NC}"
    echo -e "\n${YELLOW}Credenciales Admin:${NC} admin@serpentixpay.com / admin123"
    echo -e "${RED}⚠️  ¡Cambia las contraseñas inmediatamente!${NC}\n"
    
    echo -e "${CYAN}Pasarelas configuradas:${NC}"
    [[ "$PAYPAL_ENABLED" == "true" ]] && echo "  ✓ PayPal"
    [[ "$MERCADOPAGO_ENABLED" == "true" ]] && echo "  ✓ MercadoPago ($MERCADOPAGO_COUNTRY)"
    [[ "$CRYPTO_ENABLED" == "true" ]] && echo "  ✓ Crypto ($CRYPTO_PROVIDER)"
    [[ "$BANK_TRANSFER_ENABLED" == "true" ]] && echo "  ✓ Transferencia Bancaria"
    
    echo -e "\n${CYAN}Integraciones configuradas:${NC}"
    [[ "$PTERODACTYL_ENABLED" == "true" ]] && echo "  ✓ Pterodactyl Panel"
    [[ "$VIRTUALIZOR_ENABLED" == "true" ]] && echo "  ✓ Virtualizor"
    
    echo -e "\n${CYAN}Comandos útiles:${NC}"
    echo "  Ver estado:  systemctl status serpentixpay"
    echo "  Ver logs:    journalctl -u serpentixpay -f"
    echo "  Reiniciar:   systemctl restart serpentixpay"
    
    echo -e "\n${CYAN}Webhooks (configura en cada pasarela):${NC}"
    local PROTO=$([[ "$SETUP_SSL" == true ]] && echo "https" || echo "http")
    echo "  PayPal:      $PROTO://$DOMAIN/api/payments/paypal/webhook"
    echo "  MercadoPago: $PROTO://$DOMAIN/api/payments/mercadopago/webhook"
    echo "  Crypto:      $PROTO://$DOMAIN/api/payments/crypto/coingate/callback"
}

main() {
    print_banner
    check_root
    detect_os
    configure_installation
    configure_payment_gateways
    configure_integrations
    show_summary
    update_system
    install_nodejs
    install_nginx
    install_database
    create_user
    install_application
    configure_environment
    setup_database
    configure_nginx
    setup_ssl
    create_service
    configure_firewall
    print_completion
}

main "$@"
