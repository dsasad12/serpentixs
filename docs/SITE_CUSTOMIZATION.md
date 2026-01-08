# Guía de Personalización del Sitio

## Descripción

El sistema de billing permite personalizar completamente el aspecto y contenido del sitio web desde el panel de administración.

## Acceso

1. Inicia sesión como administrador
2. Ve a **Admin Panel** → **Personalización** (o navega a `/admin/customization`)

## Secciones Configurables

### 🏷️ Marca (Branding)

- **Nombre del Sitio**: El nombre que aparece en el header, footer y título de la página
- **Eslogan**: Frase corta que describe tu negocio
- **Descripción del Sitio**: Texto usado para SEO y meta tags
- **Logo**: Sube tu logo personalizado o usa la URL de una imagen
- **Colores**: Personaliza los colores primario y de acento (próximamente)

### 🎯 Hero (Página Principal)

- **Título Principal**: El texto grande en la sección hero
- **Título Destacado**: Texto con gradiente decorativo
- **Subtítulo**: Descripción debajo del título
- **Badge**: Notificación o anuncio destacado (puede ocultarse)
- **Botones**: Configura texto y enlaces de los botones CTA

### 📊 Estadísticas

- Personaliza las estadísticas que aparecen en el hero
- Añade, edita o elimina estadísticas
- Activa/desactiva cada estadística individualmente
- Ejemplos: "50K+ Clientes", "99.99% Uptime", etc.

### 🖥️ Categorías de Servicios

Configura las tarjetas principales de servicios:

- **Nombre y Slug**: Nombre visible y URL
- **Descripción**: Texto descriptivo del servicio
- **Icono**: Selecciona entre iconos disponibles
- **Color**: Gradiente de fondo del icono
- **Precio**: Texto del precio (ej: "Desde €2.99/mes")
- **Popular**: Muestra badge "Popular"
- **Imagen**: Opcionalmente sube una imagen personalizada

### 🎮 Categorías de Juegos

Configura los juegos que aparecen en la sección de Game Hosting:

- **Nombre y Slug**: Nombre del juego y URL
- **Descripción**: Descripción corta del hosting
- **Imagen**: **Sube una imagen personalizada para cada juego**
- **Precio**: Texto del precio inicial
- **Popular**: Destaca juegos populares

## Subida de Imágenes

### Imágenes de Juegos

1. Ve a la pestaña "Juegos"
2. Encuentra el juego que quieres personalizar
3. Haz clic en "Subir" junto al campo de imagen
4. Selecciona una imagen (PNG, JPG, WebP)
5. La imagen se mostrará automáticamente

**Recomendaciones para imágenes de juegos:**
- Tamaño recomendado: 400x400px (cuadrado)
- Formato: PNG o JPG
- Peso máximo: 2MB

### Rutas de Imágenes

Las imágenes se pueden subir o usar URLs externas:

```
/images/games/minecraft.jpg
/images/games/rust.jpg
/images/games/ark.jpg
```

## Estructura de Datos

### Categoría de Servicio

```typescript
{
  id: string;
  name: string;          // "Game Hosting"
  slug: string;          // "game-hosting"
  description: string;
  image?: string;        // URL de imagen (opcional)
  icon: string;          // "Gamepad2", "Globe", etc.
  price: string;         // "Desde €2.99/mes"
  color: string;         // "from-green-500 to-emerald-600"
  popular: boolean;
  enabled: boolean;
  order: number;
}
```

### Categoría de Juego

```typescript
{
  id: string;
  name: string;          // "Minecraft"
  slug: string;          // "minecraft"
  description: string;
  image: string;         // URL de imagen
  price: string;
  popular: boolean;
  enabled: boolean;
  order: number;
}
```

## Persistencia

La configuración se guarda en:
1. **LocalStorage**: Para persistencia inmediata en el navegador
2. **Backend API**: Para sincronización entre sesiones (cuando esté configurado)

## Endpoint API (Backend)

El store intenta sincronizar con:
- `GET /api/site-config` - Cargar configuración
- `PUT /api/admin/site-config` - Guardar configuración

## Ejemplo de Uso

```tsx
import { useSiteConfigStore } from './stores';

const MyComponent = () => {
  const { config } = useSiteConfigStore();
  const { branding, gameCategories } = config;

  return (
    <div>
      <h1>{branding.siteName}</h1>
      {gameCategories.map(game => (
        <div key={game.id}>
          <img src={game.image} alt={game.name} />
          <h2>{game.name}</h2>
        </div>
      ))}
    </div>
  );
};
```
