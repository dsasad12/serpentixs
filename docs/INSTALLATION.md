# Guía de Instalación Completa

Esta guía te llevará paso a paso a través del proceso de instalación de SerpentixPay en tu servidor Linux.

## Requisitos Previos

### Hardware Mínimo
- **CPU**: 1 core (2+ recomendado para producción)
- **RAM**: 1GB (2GB+ recomendado)
- **Disco**: 10GB disponibles
- **Ancho de banda**: 100 Mbps

### Sistemas Operativos Soportados
- Ubuntu 20.04 LTS / 22.04 LTS
- Debian 11 / 12
- CentOS 8 / Rocky Linux 8 / AlmaLinux 8

### Acceso Requerido
- Acceso root o sudo al servidor
- Dominio apuntando al servidor (DNS configurado)
- Puerto 80 y 443 abiertos en el firewall

---

## Método 1: Instalación Automática

Este es el método más sencillo y recomendado.

### Paso 1: Ejecutar el instalador

```bash
# Conectar al servidor
ssh root@tu-servidor

# Descargar y ejecutar el instalador
curl -sSL https://install.serpentixpay.com | bash
```

### Paso 2: Seguir el asistente

El instalador te pedirá:

1. **Dominio**: Ingresa tu dominio (ej: `billing.miempresa.com`)
2. **Email**: Para el certificado SSL
3. **Base de datos**: Elige entre SQLite, MySQL o PostgreSQL
4. **SSL**: Si deseas configurar HTTPS automáticamente

### Paso 3: Completar la instalación

El instalador:
- Instalará todas las dependencias
- Configurará la base de datos
- Creará el usuario del sistema
- Configurará Nginx y SSL
- Iniciará el servicio

---

## Método 2: Instalación Manual

Si prefieres más control sobre la instalación.

### Paso 1: Preparar el sistema

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip nginx

# CentOS/Rocky
sudo dnf update -y
sudo dnf install -y curl wget git unzip nginx epel-release
```

### Paso 2: Instalar Node.js

```bash
# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version
```

### Paso 3: Crear usuario del sistema

```bash
sudo useradd -m -d /home/serpentixpay -s /bin/bash serpentixpay
```

### Paso 4: Descargar SerpentixPay

```bash
sudo mkdir -p /var/www/serpentixpay
cd /var/www/serpentixpay
sudo git clone https://github.com/serpentix/serpentixpay.git .
sudo chown -R serpentixpay:serpentixpay /var/www/serpentixpay
```

### Paso 5: Instalar dependencias

```bash
cd /var/www/serpentixpay

# Frontend
sudo -u serpentixpay npm install
sudo -u serpentixpay npm run build

# Backend
cd server
sudo -u serpentixpay npm install
sudo -u serpentixpay npm run build
```

### Paso 6: Configurar entorno

```bash
# Copiar archivo de ejemplo
sudo -u serpentixpay cp .env.example .env

# Generar secretos
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH=$(openssl rand -base64 64 | tr -d '\n')
SESSION=$(openssl rand -base64 32 | tr -d '\n')

# Editar configuración
sudo -u serpentixpay nano .env
```

Edita el archivo `.env` con tus valores:

```env
APP_NAME="Tu Empresa Hosting"
APP_URL="https://billing.tudominio.com"
APP_ENV="production"

DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./data/serpentixpay.db"

JWT_SECRET="tu-jwt-secret-generado"
JWT_REFRESH_SECRET="tu-refresh-secret-generado"
SESSION_SECRET="tu-session-secret-generado"
```

### Paso 7: Inicializar base de datos

```bash
cd /var/www/serpentixpay/server

# Generar cliente Prisma
sudo -u serpentixpay npx prisma generate

# Crear tablas
sudo -u serpentixpay npx prisma db push

# Cargar datos iniciales
sudo -u serpentixpay npx tsx prisma/seed.ts
```

### Paso 8: Configurar Nginx

Crear `/etc/nginx/sites-available/serpentixpay`:

```nginx
server {
    listen 80;
    server_name billing.tudominio.com;

    root /var/www/serpentixpay/dist;
    index index.html;

    # API
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Activar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/serpentixpay /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Paso 9: Crear servicio systemd

Crear `/etc/systemd/system/serpentixpay.service`:

```ini
[Unit]
Description=SerpentixPay
After=network.target

[Service]
Type=simple
User=serpentixpay
WorkingDirectory=/var/www/serpentixpay/server
ExecStart=/usr/bin/node dist/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Iniciar servicio:

```bash
sudo systemctl daemon-reload
sudo systemctl enable serpentixpay
sudo systemctl start serpentixpay
```

### Paso 10: Configurar SSL (Opcional pero recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d billing.tudominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

---

## Método 3: Instalación con Docker

La forma más rápida para un entorno aislado.

### Paso 1: Instalar Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin
```

### Paso 2: Configurar

```bash
git clone https://github.com/serpentix/serpentixpay.git
cd serpentixpay

# Copiar y editar configuración
cp .env.docker .env
nano .env
```

### Paso 3: Iniciar

```bash
docker compose up -d

# Ver logs
docker compose logs -f
```

---

## Post-Instalación

### Acceder al Panel

1. Abre tu navegador y ve a `https://billing.tudominio.com`
2. Inicia sesión con las credenciales por defecto:
   - **Admin**: `admin@serpentixpay.com` / `admin123`
   - **Demo**: `demo@example.com` / `demo123`

### ⚠️ Importante: Cambiar Contraseñas

Inmediatamente después de iniciar sesión:

1. Ve a **Configuración > Mi Perfil**
2. Cambia la contraseña por una segura
3. Habilita la autenticación de dos factores (2FA)

### Configuración Inicial Recomendada

1. **General**: Configura el nombre de tu empresa, logo, etc.
2. **Email**: Configura el servidor SMTP para notificaciones
3. **Pagos**: Habilita las pasarelas de pago
4. **Productos**: Crea tus categorías y productos

---

## Solución de Problemas

### El sitio no carga

```bash
# Verificar que Nginx está corriendo
sudo systemctl status nginx

# Verificar configuración de Nginx
sudo nginx -t

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### Error de conexión a la API

```bash
# Verificar que el backend está corriendo
sudo systemctl status serpentixpay

# Ver logs del backend
sudo journalctl -u serpentixpay -f
```

### Error de base de datos

```bash
# Verificar permisos
ls -la /var/www/serpentixpay/server/data/

# Regenerar base de datos (¡BORRA DATOS!)
cd /var/www/serpentixpay/server
rm -f data/serpentixpay.db
npx prisma db push
npx tsx prisma/seed.ts
```

---

## Siguiente: Configuración

Continúa con la [Guía de Configuración](CONFIGURATION.md) para personalizar tu instalación.
