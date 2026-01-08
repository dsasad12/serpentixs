import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  menuSection: 'hostings' | 'other-services' | 'none';
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  image?: string;
  price: {
    monthly: number;
    quarterly: number;
    semiannually: number;
    annually: number;
    setup: number;
  };
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  stockLimit: number;
  salesCount: number;
  createdAt: string;
}

interface CatalogState {
  categories: Category[];
  products: Product[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'salesCount'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getCategoriesBySection: (section: Category['menuSection']) => Category[];
  getProductsByCategory: (categoryId: string) => Product[];
}

const defaultCategories: Category[] = [
  {
    id: 'game-hosting',
    name: 'Game Hosting',
    slug: 'game-hosting',
    description: 'Servidores de juegos optimizados',
    icon: 'Gamepad2',
    menuSection: 'hostings',
    isActive: true,
    order: 1,
    createdAt: '2024-01-01',
  },
  {
    id: 'web-hosting',
    name: 'Web Hosting',
    slug: 'web-hosting',
    description: 'Hosting web de alta velocidad',
    icon: 'Globe',
    menuSection: 'hostings',
    isActive: true,
    order: 2,
    createdAt: '2024-01-01',
  },
  {
    id: 'vps',
    name: 'VPS',
    slug: 'vps',
    description: 'Servidores virtuales potentes',
    icon: 'Server',
    menuSection: 'hostings',
    isActive: true,
    order: 3,
    createdAt: '2024-01-01',
  },
  {
    id: 'dedicated',
    name: 'Servidores Dedicados',
    slug: 'dedicated',
    description: 'Hardware dedicado exclusivo',
    icon: 'HardDrive',
    menuSection: 'other-services',
    isActive: true,
    order: 1,
    createdAt: '2024-01-01',
  },
  {
    id: 'domains',
    name: 'Dominios',
    slug: 'domains',
    description: 'Registra tu dominio',
    icon: 'AtSign',
    menuSection: 'other-services',
    isActive: true,
    order: 2,
    createdAt: '2024-01-01',
  },
  {
    id: 'email',
    name: 'Email Profesional',
    slug: 'email',
    description: 'Correo corporativo profesional',
    icon: 'Mail',
    menuSection: 'other-services',
    isActive: true,
    order: 3,
    createdAt: '2024-01-01',
  },
];

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Minecraft Starter',
    categoryId: 'game-hosting',
    description: 'Servidor básico para empezar tu aventura',
    price: { monthly: 4.99, quarterly: 13.99, semiannually: 26.99, annually: 49.99, setup: 0 },
    features: ['2GB RAM', '10 Slots', 'SSD NVMe', 'Soporte 24/7'],
    isActive: true,
    isFeatured: true,
    stockLimit: 0,
    salesCount: 156,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Minecraft Pro',
    categoryId: 'game-hosting',
    description: 'Para comunidades en crecimiento',
    price: { monthly: 9.99, quarterly: 27.99, semiannually: 53.99, annually: 99.99, setup: 0 },
    features: ['4GB RAM', '25 Slots', 'SSD NVMe', 'Protección DDoS'],
    isActive: true,
    isFeatured: false,
    stockLimit: 0,
    salesCount: 234,
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    name: 'Web Starter',
    categoryId: 'web-hosting',
    description: 'Perfecto para sitios pequeños',
    price: { monthly: 3.99, quarterly: 10.99, semiannually: 20.99, annually: 39.99, setup: 0 },
    features: ['10GB SSD', '1 Dominio', 'SSL Gratis', 'Email incluido'],
    isActive: true,
    isFeatured: false,
    stockLimit: 0,
    salesCount: 89,
    createdAt: '2024-02-10',
  },
  {
    id: '4',
    name: 'VPS Starter',
    categoryId: 'vps',
    description: 'Tu propio servidor virtual',
    price: { monthly: 9.99, quarterly: 27.99, semiannually: 53.99, annually: 99.99, setup: 0 },
    features: ['2 vCPU', '4GB RAM', '50GB SSD', 'Root Access'],
    isActive: true,
    isFeatured: true,
    stockLimit: 50,
    salesCount: 45,
    createdAt: '2024-03-05',
  },
  {
    id: '5',
    name: 'Dedicado E3',
    categoryId: 'dedicated',
    description: 'Servidor dedicado de alto rendimiento',
    price: { monthly: 89.99, quarterly: 254.99, semiannually: 485.99, annually: 899.99, setup: 49.99 },
    features: ['Intel E3-1270', '32GB RAM', '2x1TB SSD', '1Gbps'],
    isActive: true,
    isFeatured: false,
    stockLimit: 10,
    salesCount: 12,
    createdAt: '2024-04-20',
  },
  {
    id: '6',
    name: 'Dominio .com',
    categoryId: 'domains',
    description: 'El dominio más popular',
    price: { monthly: 0, quarterly: 0, semiannually: 0, annually: 12.99, setup: 0 },
    features: ['WHOIS Privado', 'DNS Gestión', 'Auto-renovación'],
    isActive: true,
    isFeatured: false,
    stockLimit: 0,
    salesCount: 234,
    createdAt: '2024-01-01',
  },
];

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      categories: defaultCategories,
      products: defaultProducts,

      addCategory: (categoryData) => {
        const newCategory: Category = {
          ...categoryData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ categories: [...state.categories, newCategory] }));
      },

      updateCategory: (id, data) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...data } : cat
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        }));
      },

      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: Date.now().toString(),
          salesCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ products: [...state.products, newProduct] }));
      },

      updateProduct: (id, data) => {
        set((state) => ({
          products: state.products.map((prod) =>
            prod.id === id ? { ...prod, ...data } : prod
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((prod) => prod.id !== id),
        }));
      },

      getCategoriesBySection: (section) => {
        return get()
          .categories.filter((cat) => cat.menuSection === section && cat.isActive)
          .sort((a, b) => a.order - b.order);
      },

      getProductsByCategory: (categoryId) => {
        return get().products.filter((prod) => prod.categoryId === categoryId && prod.isActive);
      },
    }),
    {
      name: 'catalog-storage',
    }
  )
);
