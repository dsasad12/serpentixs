import { useState, useEffect, useCallback } from 'react';
import { productsApi, type Product, type Category } from '../lib/api';

interface UseProductsOptions {
  autoFetch?: boolean;
  category?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  fetch: (params?: { category?: string; featured?: boolean; page?: number; limit?: number }) => Promise<void>;
  getById: (id: string) => Promise<Product | null>;
  getBySlug: (slug: string) => Promise<Product | null>;
  refetch: () => Promise<void>;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { autoFetch = true, category, featured, page = 1, limit = 10 } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseProductsReturn['pagination']>(null);

  const fetch = useCallback(async (params?: { 
    category?: string; 
    featured?: boolean; 
    page?: number; 
    limit?: number 
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsApi.getAll({
        category: params?.category ?? category,
        featured: params?.featured ?? featured,
        page: params?.page ?? page,
        limit: params?.limit ?? limit,
      });
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, featured, page, limit]);

  const getById = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const response = await productsApi.getById(id);
      return response.data;
    } catch (err) {
      console.error('Error al obtener producto:', err);
      return null;
    }
  }, []);

  const getBySlug = useCallback(async (slug: string): Promise<Product | null> => {
    try {
      const response = await productsApi.getBySlug(slug);
      return response.data;
    } catch (err) {
      console.error('Error al obtener producto por slug:', err);
      return null;
    }
  }, []);

  const refetch = useCallback(() => fetch(), [fetch]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  return {
    products,
    loading,
    error,
    pagination,
    fetch,
    getById,
    getBySlug,
    refetch,
  };
}

// Hook para categorías
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsApi.getCategories();
      setCategories(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar categorías';
      setError(message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { categories, loading, error, refetch: fetch };
}

// Hook para un producto individual
export function useProduct(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await productsApi.getById(productId);
      setProduct(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar producto';
      setError(message);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { product, loading, error, refetch: fetch };
}
