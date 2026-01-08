# Documentación de la API

SerpentixPay proporciona una API RESTful completa para integrar el sistema con aplicaciones externas.

## Base URL

```
https://tu-dominio.com/api/v1
```

## Autenticación

### Obtener Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "tu-contraseña"
}
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "abc123",
      "email": "usuario@ejemplo.com",
      "name": "Usuario"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Usar Token

Incluir el token en todas las peticiones:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Renovar Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Endpoints Públicos

### Obtener Configuración Pública

```http
GET /api/v1/settings/public
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "appName": "Mi Empresa Hosting",
    "currency": "EUR",
    "currencySymbol": "€",
    "supportEmail": "soporte@miempresa.com"
  }
}
```

### Listar Productos Públicos

```http
GET /api/v1/products?category=game-hosting
```

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| category | string | Filtrar por categoría |
| page | number | Número de página |
| limit | number | Resultados por página |

---

## Endpoints de Usuario

### Obtener Perfil

```http
GET /api/v1/user/profile
Authorization: Bearer {token}
```

### Actualizar Perfil

```http
PUT /api/v1/user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nuevo Nombre",
  "phone": "+34 612 345 678",
  "address": {
    "street": "Calle Principal 123",
    "city": "Madrid",
    "country": "ES",
    "postalCode": "28001"
  }
}
```

### Cambiar Contraseña

```http
POST /api/v1/user/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "contraseña-actual",
  "newPassword": "nueva-contraseña"
}
```

---

## Servicios

### Listar Mis Servicios

```http
GET /api/v1/services
Authorization: Bearer {token}
```

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| status | string | active, suspended, cancelled |
| page | number | Número de página |

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": "srv_abc123",
      "productId": "prod_xyz",
      "productName": "Servidor Minecraft 4GB",
      "status": "active",
      "domain": "mi-servidor.example.com",
      "nextDueDate": "2024-02-15T00:00:00Z",
      "price": 9.99,
      "billingCycle": "monthly"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  }
}
```

### Obtener Detalle de Servicio

```http
GET /api/v1/services/{id}
Authorization: Bearer {token}
```

### Acciones del Servicio

```http
POST /api/v1/services/{id}/action
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "restart"  // restart, start, stop, reinstall
}
```

---

## Facturas

### Listar Facturas

```http
GET /api/v1/invoices
Authorization: Bearer {token}
```

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| status | string | pending, paid, overdue, cancelled |
| from | date | Fecha inicio (YYYY-MM-DD) |
| to | date | Fecha fin |

### Obtener Factura

```http
GET /api/v1/invoices/{id}
Authorization: Bearer {token}
```

### Descargar PDF

```http
GET /api/v1/invoices/{id}/pdf
Authorization: Bearer {token}
```

### Pagar Factura

```http
POST /api/v1/invoices/{id}/pay
Authorization: Bearer {token}
Content-Type: application/json

{
  "gateway": "stripe",
  "returnUrl": "https://miapp.com/payment/complete"
}
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://checkout.stripe.com/...",
    "transactionId": "txn_abc123"
  }
}
```

---

## Pedidos

### Crear Pedido

```http
POST /api/v1/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "productId": "prod_abc123",
      "pricingId": "price_monthly",
      "quantity": 1,
      "domain": "mi-servidor",
      "options": {
        "location": "eu-west"
      }
    }
  ],
  "couponCode": "DESCUENTO10"
}
```

### Obtener Carrito

```http
GET /api/v1/orders/cart
Authorization: Bearer {token}
```

### Procesar Checkout

```http
POST /api/v1/orders/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "ord_abc123",
  "paymentGateway": "stripe"
}
```

---

## Tickets de Soporte

### Listar Tickets

```http
GET /api/v1/tickets
Authorization: Bearer {token}
```

### Crear Ticket

```http
POST /api/v1/tickets
Authorization: Bearer {token}
Content-Type: application/json

{
  "subject": "Problema con mi servidor",
  "department": "technical",
  "priority": "medium",
  "message": "Descripción detallada del problema...",
  "serviceId": "srv_abc123"  // Opcional
}
```

### Responder a Ticket

```http
POST /api/v1/tickets/{id}/reply
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Contenido de la respuesta..."
}
```

### Cerrar Ticket

```http
POST /api/v1/tickets/{id}/close
Authorization: Bearer {token}
```

---

## API de Administración

Los endpoints de administración requieren un usuario con rol `admin` o `staff`.

### Dashboard

```http
GET /api/v1/admin/dashboard
Authorization: Bearer {admin-token}
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 15420.50,
    "monthlyRevenue": 2340.00,
    "activeServices": 156,
    "totalUsers": 89,
    "pendingTickets": 5,
    "recentOrders": [...],
    "revenueChart": [...]
  }
}
```

### Gestión de Usuarios

```http
# Listar usuarios
GET /api/v1/admin/users

# Obtener usuario
GET /api/v1/admin/users/{id}

# Crear usuario
POST /api/v1/admin/users

# Actualizar usuario
PUT /api/v1/admin/users/{id}

# Eliminar usuario
DELETE /api/v1/admin/users/{id}
```

### Gestión de Productos

```http
# Listar productos
GET /api/v1/admin/products

# Crear producto
POST /api/v1/admin/products
Content-Type: application/json

{
  "name": "Servidor Minecraft 4GB",
  "categoryId": "cat_gamehosting",
  "description": "Servidor dedicado de Minecraft...",
  "features": ["4GB RAM", "2 vCPUs", "SSD NVMe"],
  "pricing": [
    {
      "cycle": "monthly",
      "price": 9.99,
      "setupFee": 0
    },
    {
      "cycle": "yearly",
      "price": 99.99,
      "setupFee": 0
    }
  ]
}
```

### Configuración del Sistema

```http
# Obtener configuración
GET /api/v1/admin/settings

# Actualizar configuración
PUT /api/v1/admin/settings
Content-Type: application/json

{
  "appName": "Nuevo Nombre",
  "currency": "USD",
  "settings": {
    "invoicePrefix": "INV-",
    "gracePeriod": 7
  }
}
```

---

## Webhooks

### Eventos Disponibles

| Evento | Descripción |
|--------|-------------|
| `order.created` | Nuevo pedido creado |
| `order.paid` | Pedido pagado |
| `invoice.created` | Nueva factura |
| `invoice.paid` | Factura pagada |
| `invoice.overdue` | Factura vencida |
| `service.created` | Servicio creado |
| `service.suspended` | Servicio suspendido |
| `service.terminated` | Servicio terminado |
| `ticket.created` | Nuevo ticket |
| `ticket.replied` | Respuesta en ticket |

### Configurar Webhook

```http
POST /api/v1/admin/webhooks
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "url": "https://tu-app.com/webhook",
  "events": ["order.paid", "invoice.paid"],
  "secret": "tu-secreto-para-verificar"
}
```

### Formato del Webhook

```json
{
  "event": "order.paid",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "orderId": "ord_abc123",
    "userId": "usr_xyz",
    "total": 29.99
  },
  "signature": "sha256=..."
}
```

### Verificar Firma

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === expected;
}
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Solicitud inválida |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | Recurso no encontrado |
| 422 | Error de validación |
| 429 | Demasiadas peticiones |
| 500 | Error del servidor |

### Formato de Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos proporcionados no son válidos",
    "details": {
      "email": "El email ya está registrado"
    }
  }
}
```

---

## Límites de la API

| Plan | Peticiones/minuto |
|------|-------------------|
| Usuario | 60 |
| Staff | 120 |
| Admin | 300 |

Headers de rate limit:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705312800
```

---

## SDKs y Librerías

### JavaScript/TypeScript

```bash
npm install @serpentixpay/sdk
```

```javascript
import { SerpentixPay } from '@serpentixpay/sdk';

const client = new SerpentixPay({
  baseUrl: 'https://billing.miempresa.com',
  apiKey: 'tu-api-key'
});

// Obtener servicios
const services = await client.services.list();

// Crear ticket
const ticket = await client.tickets.create({
  subject: 'Ayuda',
  message: 'Necesito ayuda con...'
});
```

### PHP

```bash
composer require serpentixpay/sdk
```

```php
use SerpentixPay\Client;

$client = new Client([
    'base_url' => 'https://billing.miempresa.com',
    'api_key' => 'tu-api-key'
]);

$services = $client->services()->list();
```

---

## Soporte

¿Necesitas ayuda con la API?

- 📧 Email: api@serpentixpay.com
- 💬 Discord: discord.gg/serpentixpay
- 📖 Ejemplos: github.com/serpentixpay/api-examples
