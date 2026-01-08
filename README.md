<p align="center">
  <img src="public/logo.svg" alt="SerpentixPay" width="200">
</p>

<h1 align="center">SerpentixPay</h1>

<p align="center">
  Sistema de facturación moderno, seguro y fácil de instalar para empresas de hosting
</p>

<p align="center">
  <a href="#características">Características</a> •
  <a href="#instalación-rápida">Instalación</a> •
  <a href="#documentación">Documentación</a> •
  <a href="#tecnologías">Tecnologías</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node">
</p>

---

## ✨ Características

### 🎮 Integraciones de Servidores
- **Pterodactyl Panel** - Servidores de juegos (Minecraft, Rust, ARK, etc.)
- **Virtualizor** - VPS y servidores virtuales
- **cPanel/WHM** - Hosting web (próximamente)
- **Proxmox** - Virtualización (próximamente)
- **Plesk/DirectAdmin** - Paneles de control web (próximamente)

### 💳 Pasarelas de Pago
- **PayPal** - Pagos internacionales con tarjeta y saldo PayPal
- **MercadoPago** - Todos los países de Latinoamérica (AR, BR, CL, CO, MX, PE, UY)
- **Criptomonedas** - CoinGate, NOWPayments, CoinPayments
- **Transferencia Bancaria** - SEPA (Europa), ACH/Wire (USA), SPEI (México) via Meru

### 🔒 Seguridad
- Autenticación JWT con refresh tokens
- Autenticación de dos factores (2FA)
- Rate limiting y protección CSRF
- Encriptación de contraseñas con bcrypt
- HTTPS forzado en producción

### 🎨 Interfaz Moderna
- Diseño responsive inspirado en Shockbyte
- Modo oscuro/claro
- Panel de cliente intuitivo
- Panel de administración completo
- Completamente personalizable

### 📊 Gestión Completa
- Facturación automática
- Sistema de tickets de soporte
- Notificaciones por email
- Reportes y estadísticas
- API RESTful completa

---

## 🚀 Instalación Rápida

### Método 1: Instalador Automático (Recomendado)

Compatible con Ubuntu 20.04+, Debian 11+, CentOS 8+

```bash
# Descargar y ejecutar
wget https://raw.githubusercontent.com/serpentix/serpentixpay/main/scripts/install.sh
chmod +x install.sh
sudo bash install.sh
```

El instalador te guiará a través de:
- Configuración de dominio y SSL
- Selección de base de datos (SQLite, MySQL, PostgreSQL)
- Configuración de pasarelas de pago (PayPal, MercadoPago, Crypto, Banco)
- Configuración de integraciones (Pterodactyl, Virtualizor)

### Método 2: Docker

```bash
git clone https://github.com/serpentix/serpentixpay.git
cd serpentixpay
cp .env.docker .env
docker compose up -d
```

### Método 3: Manual

Consulta la [guía de instalación completa](docs/INSTALLATION.md).

---

## 📦 Scripts de Gestión

| Script | Descripción |
|--------|-------------|
| `scripts/install.sh` | Instalación completa |
| `scripts/update.sh` | Actualizar a nueva versión |
| `scripts/backup.sh` | Crear backup manual |
| `scripts/setup-cron.sh` | Configurar tareas programadas |
| `scripts/uninstall.sh` | Desinstalar completamente |

---

## 📖 Documentación

| Documento | Descripción |
|-----------|-------------|
| [Instalación](docs/INSTALLATION.md) | Guía completa de instalación |
| [Configuración](docs/CONFIGURATION.md) | Opciones de configuración |
| [API](docs/API.md) | Documentación de la API |

---

## 🛠️ Tecnologías

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultra rápido
- **Tailwind CSS v4** - Estilos utilitarios
- **Zustand** - Gestión de estado
- **React Router v7** - Enrutamiento

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **Prisma** - ORM
- **JWT** - Autenticación
- **Winston** - Logging

### Base de Datos
- SQLite (desarrollo)
- MySQL (producción)
- PostgreSQL (producción)

### DevOps
- Docker & Docker Compose
- Nginx
- Systemd
- Certbot (SSL)

---

## 📁 Estructura del Proyecto

```
serpentixpay/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizables
│   ├── pages/              # Páginas de la aplicación
│   ├── stores/             # Estados globales (Zustand)
│   └── lib/                # Utilidades
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/         # Endpoints de la API
│   │   ├── middleware/     # Middleware (auth, etc.)
│   │   └── config/         # Configuración
│   └── prisma/             # Esquema de BD
├── scripts/                # Scripts de instalación
├── docker/                 # Configuración Docker
└── docs/                   # Documentación
```

---

## ⚙️ Requisitos del Sistema

### Hardware Mínimo
- 1 CPU core
- 1 GB RAM
- 10 GB disco

### Software
- Node.js 18+
- npm o yarn
- Nginx (producción)
- MySQL/PostgreSQL (producción)

### Sistemas Operativos Soportados
- Ubuntu 20.04 / 22.04 LTS
- Debian 11 / 12
- CentOS 8 / Rocky Linux 8

---

## 🔧 Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/serpentix/serpentixpay.git
cd serpentixpay

# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd server
npm install
cp .env.example .env

# Configurar base de datos
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# Iniciar en desarrollo
cd ..
npm run dev          # Frontend (puerto 5173)
cd server && npm run dev  # Backend (puerto 3001)
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 💬 Soporte

- 📧 Email: soporte@serpentixpay.com
- 💬 Discord: [discord.gg/serpentixpay](https://discord.gg/serpentixpay)
- 🐛 Issues: [GitHub Issues](https://github.com/serpentix/serpentixpay/issues)

---

<p align="center">
  Hecho con ❤️ por el equipo de SerpentixPay
</p>
