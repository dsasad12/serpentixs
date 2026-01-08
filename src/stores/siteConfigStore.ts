import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Game category with customizable image
export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string; // URL de la imagen
  icon?: string; // Nombre del icono de Lucide (opcional)
  price: string;
  popular: boolean;
  enabled: boolean;
  order: number;
}

// Service category for main services section
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  icon: string;
  price: string;
  color: string;
  popular: boolean;
  enabled: boolean;
  order: number;
}

// Site branding configuration
export interface SiteBranding {
  siteName: string;
  siteSlogan: string;
  siteDescription: string;
  logoUrl: string;
  logoAlt: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  darkMode: boolean;
}

// Hero section configuration
export interface HeroConfig {
  title: string;
  highlightedTitle: string;
  subtitle: string;
  badge: string;
  showBadge: boolean;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  backgroundImage?: string;
}

// Stats configuration
export interface StatItem {
  id: string;
  value: string;
  label: string;
  enabled: boolean;
  order: number;
}

// Discord integration configuration
export interface DiscordConfig {
  enabled: boolean;
  webhookUrl: string;
  guildId: string;
  categoryId: string;
  supportRoleId: string;
  botToken: string;
  inviteUrl: string;
  ticketChannelPrefix: string;
  welcomeMessage: string;
  notifications: {
    newTicket: boolean;
    ticketReply: boolean;
    ticketClosed: boolean;
  };
}

// Full site configuration
export interface SiteConfig {
  branding: SiteBranding;
  hero: HeroConfig;
  stats: StatItem[];
  serviceCategories: ServiceCategory[];
  gameCategories: GameCategory[];
  discord: DiscordConfig;
}

interface SiteConfigState {
  config: SiteConfig;
  isLoading: boolean;
  lastSaved: string | null;
  
  // Actions
  updateBranding: (branding: Partial<SiteBranding>) => void;
  updateHero: (hero: Partial<HeroConfig>) => void;
  updateStats: (stats: StatItem[]) => void;
  addStat: (stat: StatItem) => void;
  updateStat: (id: string, updates: Partial<StatItem>) => void;
  removeStat: (id: string) => void;
  updateServiceCategories: (categories: ServiceCategory[]) => void;
  addServiceCategory: (category: ServiceCategory) => void;
  updateServiceCategory: (id: string, updates: Partial<ServiceCategory>) => void;
  removeServiceCategory: (id: string) => void;
  updateGameCategories: (categories: GameCategory[]) => void;
  addGameCategory: (category: GameCategory) => void;
  updateGameCategory: (id: string, updates: Partial<GameCategory>) => void;
  removeGameCategory: (id: string) => void;
  updateDiscord: (discord: Partial<DiscordConfig>) => void;
  saveConfig: () => Promise<void>;
  loadConfig: () => Promise<void>;
  resetToDefaults: () => void;
}

const defaultConfig: SiteConfig = {
  branding: {
    siteName: 'Serpentixs',
    siteSlogan: 'Hosting de Alto Rendimiento',
    siteDescription: 'Servidores de juegos, web hosting, VPS y dedicados con la mejor tecnología y soporte 24/7',
    logoUrl: 'https://cdn.discordapp.com/attachments/1332402929772265505/1450207022145605682/logo.png?ex=694aec89&is=69499b09&hm=b6d5c4c2132bbdac22bb64e8e9e7c59508f297b1e0f21b967e1c2801d3476bcc&',
    logoAlt: 'Serpentixs Logo',
    faviconUrl: '/favicon.ico',
    primaryColor: '#6366f1',
    accentColor: '#d946ef',
    darkMode: true,
  },
  hero: {
    title: 'Hosting de',
    highlightedTitle: 'Alto Rendimiento',
    subtitle: 'Servidores de juegos, web hosting, VPS y dedicados con la mejor tecnología y soporte 24/7 para tu negocio o proyecto.',
    badge: 'Nuevo: Panel de control mejorado disponible',
    showBadge: true,
    primaryButtonText: 'Ver Planes',
    primaryButtonLink: '/services/game-hosting',
    secondaryButtonText: 'Contactar Ventas',
    secondaryButtonLink: '/contact',
  },
  stats: [
    { id: '1', value: '50K+', label: 'Clientes Activos', enabled: true, order: 1 },
    { id: '2', value: '99.99%', label: 'Uptime Garantizado', enabled: true, order: 2 },
    { id: '3', value: '24/7', label: 'Soporte Técnico', enabled: true, order: 3 },
    { id: '4', value: '15+', label: 'Ubicaciones Globales', enabled: true, order: 4 },
  ],
  serviceCategories: [
    {
      id: '1',
      name: 'Game Hosting',
      slug: 'game-hosting',
      description: 'Servidores optimizados para Minecraft, Rust, ARK, Valheim y más de 50 juegos.',
      icon: 'Gamepad2',
      price: 'Desde €2.99/mes',
      color: 'from-green-500 to-emerald-600',
      popular: true,
      enabled: true,
      order: 1,
    },
    {
      id: '2',
      name: 'Web Hosting',
      slug: 'web-hosting',
      description: 'Hosting web ultrarrápido con SSD NVMe, SSL gratis y panel cPanel.',
      icon: 'Globe',
      price: 'Desde €3.99/mes',
      color: 'from-blue-500 to-cyan-600',
      popular: false,
      enabled: true,
      order: 2,
    },
    {
      id: '3',
      name: 'VPS',
      slug: 'vps',
      description: 'Servidores virtuales con recursos garantizados y root access completo.',
      icon: 'Server',
      price: 'Desde €4.99/mes',
      color: 'from-purple-500 to-violet-600',
      popular: true,
      enabled: true,
      order: 3,
    },
    {
      id: '4',
      name: 'Dedicados',
      slug: 'dedicated',
      description: 'Hardware dedicado exclusivo con máximo rendimiento y control total.',
      icon: 'HardDrive',
      price: 'Desde €49.99/mes',
      color: 'from-orange-500 to-red-600',
      popular: false,
      enabled: true,
      order: 4,
    },
  ],
  gameCategories: [
    {
      id: '1',
      name: 'Minecraft',
      slug: 'minecraft',
      description: 'Servidores Minecraft Java y Bedrock con mods, plugins y panel dedicado.',
      image: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/CC-702x400.jpg',
      icon: 'Blocks',
      price: 'Desde €2.99/mes',
      popular: true,
      enabled: true,
      order: 1,
    },
    {
      id: '2',
      name: 'Rust',
      slug: 'rust',
      description: 'Servidores Rust con protección DDoS y rendimiento optimizado.',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/header.jpg',
      icon: 'Skull',
      price: 'Desde €9.99/mes',
      popular: true,
      enabled: true,
      order: 2,
    },
    {
      id: '3',
      name: 'ARK: Survival',
      slug: 'ark',
      description: 'Servidores ARK con clusters, mods y backups automáticos.',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/346110/header.jpg',
      icon: 'Bird',
      price: 'Desde €12.99/mes',
      popular: false,
      enabled: true,
      order: 3,
    },
    {
      id: '4',
      name: 'Valheim',
      slug: 'valheim',
      description: 'Servidores Valheim optimizados para exploración vikinga.',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/892970/header.jpg',
      icon: 'Axe',
      price: 'Desde €4.99/mes',
      popular: false,
      enabled: true,
      order: 4,
    },
    {
      id: '5',
      name: 'Terraria',
      slug: 'terraria',
      description: 'Servidores Terraria con tShock y soporte para mods.',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/105600/header.jpg',
      icon: 'Pickaxe',
      price: 'Desde €2.99/mes',
      popular: false,
      enabled: true,
      order: 5,
    },
    {
      id: '6',
      name: 'CS:GO / CS2',
      slug: 'csgo',
      description: 'Servidores Counter-Strike con tickrate 128 y plugins.',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
      icon: 'Crosshair',
      price: 'Desde €5.99/mes',
      popular: true,
      enabled: true,
      order: 6,
    },
    {
      id: '7',
      name: 'GTA V (FiveM)',
      slug: 'fivem',
      description: 'Servidores FiveM para roleplay con scripts y recursos.',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/271590/header.jpg',
      icon: 'Car',
      price: 'Desde €14.99/mes',
      popular: true,
      enabled: true,
      order: 7,
    },
    {
      id: '8',
      name: 'Palworld',
      slug: 'palworld',
      description: 'Servidores Palworld con rendimiento estable y backups.',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1623730/header.jpg',
      icon: 'Heart',
      price: 'Desde €8.99/mes',
      popular: true,
      enabled: true,
      order: 8,
    },
  ],
  discord: {
    enabled: true,
    webhookUrl: '',
    guildId: '',
    categoryId: '1452819195678163047',
    supportRoleId: '',
    botToken: '',
    inviteUrl: '',
    ticketChannelPrefix: 'ticket-',
    welcomeMessage: '¡Hola! Un agente de soporte de Serpentixs se conectará contigo en breve. Mientras tanto, puedes describir tu consulta.',
    notifications: {
      newTicket: true,
      ticketReply: true,
      ticketClosed: true,
    },
  },
};

export const useSiteConfigStore = create<SiteConfigState>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      isLoading: false,
      lastSaved: null,

      updateBranding: (branding) => {
        set((state) => ({
          config: {
            ...state.config,
            branding: { ...state.config.branding, ...branding },
          },
        }));
      },

      updateHero: (hero) => {
        set((state) => ({
          config: {
            ...state.config,
            hero: { ...state.config.hero, ...hero },
          },
        }));
      },

      updateStats: (stats) => {
        set((state) => ({
          config: { ...state.config, stats },
        }));
      },

      addStat: (stat) => {
        set((state) => ({
          config: {
            ...state.config,
            stats: [...state.config.stats, stat],
          },
        }));
      },

      updateStat: (id, updates) => {
        set((state) => ({
          config: {
            ...state.config,
            stats: state.config.stats.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          },
        }));
      },

      removeStat: (id) => {
        set((state) => ({
          config: {
            ...state.config,
            stats: state.config.stats.filter((s) => s.id !== id),
          },
        }));
      },

      updateServiceCategories: (categories) => {
        set((state) => ({
          config: { ...state.config, serviceCategories: categories },
        }));
      },

      addServiceCategory: (category) => {
        set((state) => ({
          config: {
            ...state.config,
            serviceCategories: [...state.config.serviceCategories, category],
          },
        }));
      },

      updateServiceCategory: (id, updates) => {
        set((state) => ({
          config: {
            ...state.config,
            serviceCategories: state.config.serviceCategories.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          },
        }));
      },

      removeServiceCategory: (id) => {
        set((state) => ({
          config: {
            ...state.config,
            serviceCategories: state.config.serviceCategories.filter((c) => c.id !== id),
          },
        }));
      },

      updateGameCategories: (categories) => {
        set((state) => ({
          config: { ...state.config, gameCategories: categories },
        }));
      },

      addGameCategory: (category) => {
        set((state) => ({
          config: {
            ...state.config,
            gameCategories: [...state.config.gameCategories, category],
          },
        }));
      },

      updateGameCategory: (id, updates) => {
        set((state) => ({
          config: {
            ...state.config,
            gameCategories: state.config.gameCategories.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          },
        }));
      },

      removeGameCategory: (id) => {
        set((state) => ({
          config: {
            ...state.config,
            gameCategories: state.config.gameCategories.filter((c) => c.id !== id),
          },
        }));
      },

      updateDiscord: (discord) => {
        set((state) => ({
          config: {
            ...state.config,
            discord: { ...state.config.discord, ...discord },
          },
        }));
      },

      saveConfig: async () => {
        set({ isLoading: true });
        try {
          // Save to backend
          const response = await fetch('/api/admin/site-config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(get().config),
          });
          
          if (response.ok) {
            set({ lastSaved: new Date().toISOString() });
          }
        } catch (error) {
          console.error('Error saving site config:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      loadConfig: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/site-config');
          if (response.ok) {
            const data = await response.json();
            if (data.config) {
              set({ config: { ...defaultConfig, ...data.config } });
            }
          }
        } catch (error) {
          console.error('Error loading site config:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      resetToDefaults: () => {
        set({ config: defaultConfig, lastSaved: null });
      },
    }),
    {
      name: 'site-config-storage',
    }
  )
);
