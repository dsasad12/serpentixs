# Guía de Configuración

Esta guía explica todas las opciones de configuración disponibles en SerpentixPay.

## Archivo de Configuración (.env)

El archivo `.env` contiene toda la configuración del sistema. Aquí están todas las opciones disponibles:

---

## Configuración General

```env
# Nombre de tu empresa
APP_NAME="Mi Empresa Hosting"

# URL completa del panel (sin barra final)
APP_URL="https://billing.miempresa.com"

# Entorno de ejecución
# Valores: development, production
APP_ENV="production"

# Clave secreta del servidor
SECRET_KEY="tu-clave-secreta-muy-larga-y-segura"
```

---

## Configuración de Base de Datos

### SQLite (Recomendado para empezar)

```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./data/serpentixpay.db"
```

### MySQL

```env
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/serpentixpay"
```

### PostgreSQL

```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/serpentixpay"
```

---

## Seguridad y Autenticación

```env
# Secreto para tokens JWT (genera con: openssl rand -base64 64)
JWT_SECRET="tu-jwt-secret-muy-largo-y-seguro"

# Secreto para refresh tokens
JWT_REFRESH_SECRET="otro-secreto-diferente"

# Tiempo de expiración del token de acceso
JWT_EXPIRES_IN="15m"

# Tiempo de expiración del refresh token
JWT_REFRESH_EXPIRES_IN="7d"

# Secreto para sesiones
SESSION_SECRET="otro-secreto-para-sesiones"
```

---

## Configuración del Servidor

```env
# Puerto del backend API
PORT=3001

# Host (dejar 0.0.0.0 para producción)
HOST="0.0.0.0"

# Límite de peticiones por IP (rate limiting)
RATE_LIMIT_WINDOW=15  # minutos
RATE_LIMIT_MAX=100    # peticiones máximas por ventana
```

---

## Configuración de Email

### SMTP Genérico

```env
MAIL_DRIVER="smtp"
MAIL_HOST="smtp.tuservidor.com"
MAIL_PORT=587
MAIL_USERNAME="usuario@tuservidor.com"
MAIL_PASSWORD="tu-contraseña"
MAIL_ENCRYPTION="tls"
MAIL_FROM_ADDRESS="noreply@tuservidor.com"
MAIL_FROM_NAME="Mi Empresa"
```

### Gmail

```env
MAIL_DRIVER="smtp"
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USERNAME="tu-email@gmail.com"
MAIL_PASSWORD="tu-app-password"
MAIL_ENCRYPTION="tls"
```

### SendGrid

```env
MAIL_DRIVER="sendgrid"
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
MAIL_FROM_ADDRESS="noreply@tuempresa.com"
```

---

## Pasarelas de Pago

### Stripe

```env
STRIPE_ENABLED=true
STRIPE_PUBLIC_KEY="pk_live_xxxx"
STRIPE_SECRET_KEY="sk_live_xxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxx"
```

### PayPal

```env
PAYPAL_ENABLED=true
PAYPAL_MODE="live"  # sandbox o live
PAYPAL_CLIENT_ID="xxxx"
PAYPAL_CLIENT_SECRET="xxxx"
PAYPAL_WEBHOOK_ID="xxxx"
```

Para configurar el webhook en PayPal:
1. Ve a [Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Crea una App o edita una existente
3. En "Webhooks", agrega: `https://tu-dominio.com/api/payments/paypal/webhook`
4. Copia el Webhook ID a la configuración

### MercadoPago

MercadoPago soporta múltiples países. Configura las credenciales del país correspondiente:

```env
# Argentina
MERCADOPAGO_AR_PUBLIC_KEY="APP_USR-xxxx"
MERCADOPAGO_AR_ACCESS_TOKEN="APP_USR-xxxx-xxxx-xxxx"

# Brasil
MERCADOPAGO_BR_PUBLIC_KEY="APP_USR-xxxx"
MERCADOPAGO_BR_ACCESS_TOKEN="APP_USR-xxxx-xxxx-xxxx"

# Chile
MERCADOPAGO_CL_PUBLIC_KEY="APP_USR-xxxx"
MERCADOPAGO_CL_ACCESS_TOKEN="APP_USR-xxxx-xxxx-xxxx"

# Colombia
MERCADOPAGO_CO_PUBLIC_KEY="APP_USR-xxxx"
MERCADOPAGO_CO_ACCESS_TOKEN="APP_USR-xxxx-xxxx-xxxx"

# México
MERCADOPAGO_MX_PUBLIC_KEY="APP_USR-xxxx"
MERCADOPAGO_MX_ACCESS_TOKEN="APP_USR-xxxx-xxxx-xxxx"

# Perú
MERCADOPAGO_PE_PUBLIC_KEY="APP_USR-xxxx"
MERCADOPAGO_PE_ACCESS_TOKEN="APP_USR-xxxx-xxxx-xxxx"

# Uruguay
MERCADOPAGO_UY_PUBLIC_KEY="APP_USR-xxxx"
MERCADOPAGO_UY_ACCESS_TOKEN="APP_USR-xxxx-xxxx-xxxx"
```

Webhook: `https://tu-dominio.com/api/payments/mercadopago/webhook`

### Pagos con Criptomonedas

#### CoinGate

```env
COINGATE_API_KEY="xxxx"
COINGATE_MODE="live"  # sandbox o live
```

Callback URL: `https://tu-dominio.com/api/payments/crypto/coingate/callback`

#### NOWPayments

```env
NOWPAYMENTS_API_KEY="xxxx"
NOWPAYMENTS_IPN_SECRET="xxxx"
```

IPN Callback: `https://tu-dominio.com/api/payments/crypto/nowpayments/callback`

#### CoinPayments

```env
COINPAYMENTS_MERCHANT_ID="xxxx"
COINPAYMENTS_IPN_SECRET="xxxx"
```

IPN URL: `https://tu-dominio.com/api/payments/crypto/coinpayments/callback`

### Transferencia Bancaria (Meru)

Configura las cuentas bancarias para cada región:

```env
# Europa (SEPA)
BANK_EU_ENABLED=true
BANK_EU_NAME="Mi Empresa"
BANK_EU_IBAN="ES00 1234 5678 9012 3456 7890"
BANK_EU_BIC="XXXXESXX"
BANK_EU_BANK="Nombre del Banco"

# Estados Unidos (ACH/Wire)
BANK_US_ENABLED=true
BANK_US_NAME="Mi Empresa LLC"
BANK_US_ROUTING="000000000"
BANK_US_ACCOUNT="0000000000"
BANK_US_BANK="Bank Name"
BANK_US_ADDRESS="123 Main St, City, ST 00000"

# México (SPEI)
BANK_MX_ENABLED=true
BANK_MX_NAME="Mi Empresa SA de CV"
BANK_MX_CLABE="000000000000000000"
BANK_MX_BANK="Nombre del Banco"
```

---

## Integraciones de Servidores

### Pterodactyl (Game Servers)

```env
PTERODACTYL_ENABLED=true
PTERODACTYL_URL="https://panel.tuservidor.com"
PTERODACTYL_API_KEY="ptla_xxxxxxxxxxxx"
PTERODACTYL_CLIENT_API_KEY="ptlc_xxxxxxxxxxxx"
PTERODACTYL_DEFAULT_NODE=1
```

Para obtener las API Keys:
1. En Pterodactyl, ve a Admin > Application API
2. Crea una nueva clave con permisos completos
3. Para cliente, ve a tu perfil > API Credentials

### Virtualizor

```env
VIRTUALIZOR_ENABLED=true
VIRTUALIZOR_HOST="vps.tuservidor.com"
VIRTUALIZOR_PORT=4085
VIRTUALIZOR_SSL=true
VIRTUALIZOR_API_KEY="xxxx"
VIRTUALIZOR_API_PASS="xxxx"
```

Para obtener credenciales:
1. En Virtualizor Admin > API Credentials
2. Crea nuevas credenciales con acceso completo

### cPanel/WHM

```env
CPANEL_ENABLED=true
CPANEL_HOST="tuservidor.com"
CPANEL_USERNAME="root"
CPANEL_API_TOKEN="xxxxxxxxxxxx"
```

### Proxmox (VPS)

```env
PROXMOX_ENABLED=true
PROXMOX_HOST="https://proxmox.tuservidor.com:8006"
PROXMOX_USER="root@pam"
PROXMOX_PASSWORD="tu-contraseña"
PROXMOX_NODE="pve"
```

---

## Personalización Visual

### Colores del Tema

Puedes personalizar los colores desde el panel de administración, pero también se pueden configurar por variables:

```env
# Color principal (hex sin #)
THEME_PRIMARY_COLOR="6366f1"

# Color de acento
THEME_ACCENT_COLOR="8b5cf6"

# Modo oscuro por defecto
THEME_DARK_MODE="true"
```

### Logo y Favicon

Los archivos de logo se configuran desde el panel de administración:
- **Logo claro**: Para el modo oscuro (fondo oscuro)
- **Logo oscuro**: Para el modo claro (fondo claro)
- **Favicon**: Icono de la pestaña del navegador

---

## Configuración Avanzada

### Logging

```env
# Nivel de logs: error, warn, info, debug
LOG_LEVEL="info"

# Directorio de logs
LOG_DIR="./logs"

# Máximo de archivos de log
LOG_MAX_FILES="14d"
```

### Cache

```env
# Driver de cache: memory, redis
CACHE_DRIVER="memory"

# Configuración de Redis (si se usa)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
```

### Workers y Jobs

```env
# Número de workers para tareas en segundo plano
QUEUE_WORKERS=2

# Intervalo de verificación de servicios (minutos)
SERVICE_CHECK_INTERVAL=5

# Envío de recordatorios de facturas (días antes)
INVOICE_REMINDER_DAYS="7,3,1"
```

---

## Configuración desde el Panel Admin

Además del archivo `.env`, muchas opciones se pueden configurar desde:

**Panel Admin > Configuración**

### Pestaña General
- Nombre de la empresa
- Logo y favicon
- Información de contacto
- Zona horaria
- Formato de moneda

### Pestaña Facturación
- Moneda por defecto
- Prefijo de facturas
- Términos y condiciones
- Días de gracia
- Penalizaciones por retraso

### Pestaña Pagos
- Activar/desactivar pasarelas
- Configurar credenciales
- Pagos mínimos/máximos

### Pestaña Notificaciones
- Plantillas de email
- Notificaciones push
- Webhooks

### Pestaña Integraciones
- Conectar Pterodactyl
- Conectar cPanel
- API externa

---

## Personalización de Plantillas

### Emails

Las plantillas de email se encuentran en:
```
server/templates/emails/
├── welcome.html
├── invoice.html
├── payment-received.html
├── service-suspended.html
└── ...
```

Puedes editarlas usando variables:
- `{{user.name}}` - Nombre del usuario
- `{{user.email}}` - Email del usuario
- `{{invoice.number}}` - Número de factura
- `{{invoice.total}}` - Total a pagar
- `{{company.name}}` - Nombre de tu empresa

### PDF de Facturas

La plantilla de PDF está en:
```
server/templates/pdf/invoice.html
```

---

## Variables de Entorno por Módulo

### Módulo de Game Hosting

```env
# Asignación automática de recursos
GAME_AUTO_ASSIGN_NODE=true

# Límites por defecto
GAME_DEFAULT_CPU=100
GAME_DEFAULT_RAM=1024
GAME_DEFAULT_DISK=5120
```

### Módulo de Web Hosting

```env
# Auto crear cuentas en cPanel
WEB_AUTO_PROVISION=true

# Paquete por defecto
WEB_DEFAULT_PACKAGE="default"
```

### Módulo de VPS

```env
# Plantillas de VM disponibles
VPS_TEMPLATES="ubuntu-22.04,debian-12,centos-8"

# Pool de almacenamiento
VPS_STORAGE_POOL="local-lvm"
```

### Módulo de Dominios

```env
# Proveedor de dominios
DOMAIN_PROVIDER="enom"
ENOM_API_URL="https://resellertest.enom.com/interface.asp"
ENOM_USERNAME="tu-usuario"
ENOM_PASSWORD="tu-contraseña"
```

---

## Migración de Datos

Si estás migrando desde otro sistema:

### Desde WHMCS

```bash
cd /var/www/serpentixpay
npm run migrate:whmcs -- --source=/ruta/al/backup/whmcs.sql
```

### Desde Paymenter

```bash
npm run migrate:paymenter -- --source=/ruta/a/paymenter
```

---

## Siguiente Paso

Una vez configurado, consulta la [Documentación de la API](API.md) para integraciones personalizadas.
