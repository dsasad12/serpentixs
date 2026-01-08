import { useState, useEffect, useCallback } from 'react';
import { ordersApi, type Order, type CreateOrderRequest } from '../lib/api';

interface UseOrdersOptions {
  autoFetch?: boolean;
  status?: string;
  page?: number;
  limit?: number;
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  fetch: (params?: { status?: string; page?: number; limit?: number }) => Promise<void>;
  getById: (id: string) => Promise<Order | null>;
  create: (data: CreateOrderRequest) => Promise<Order | null>;
  checkout: (orderId: string, paymentGateway: string) => Promise<string | null>;
  applyCoupon: (orderId: string, couponCode: string) => Promise<Order | null>;
  refetch: () => Promise<void>;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const { autoFetch = true, status, page = 1, limit = 10 } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseOrdersReturn['pagination']>(null);

  const fetch = useCallback(async (params?: { status?: string; page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersApi.getAll({
        status: params?.status ?? status,
        page: params?.page ?? page,
        limit: params?.limit ?? limit,
      });
      setOrders(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar pedidos';
      setError(message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [status, page, limit]);

  const getById = useCallback(async (id: string): Promise<Order | null> => {
    try {
      const response = await ordersApi.getById(id);
      return response.data;
    } catch (err) {
      console.error('Error al obtener pedido:', err);
      return null;
    }
  }, []);

  const create = useCallback(async (data: CreateOrderRequest): Promise<Order | null> => {
    try {
      const response = await ordersApi.create(data);
      await fetch(); // Refetch list after creating
      return response.data;
    } catch (err) {
      console.error('Error al crear pedido:', err);
      return null;
    }
  }, [fetch]);

  const checkout = useCallback(async (
    orderId: string, 
    paymentGateway: string
  ): Promise<string | null> => {
    try {
      const response = await ordersApi.checkout(orderId, paymentGateway);
      return response.data.paymentUrl;
    } catch (err) {
      console.error('Error en checkout:', err);
      return null;
    }
  }, []);

  const applyCoupon = useCallback(async (
    orderId: string, 
    couponCode: string
  ): Promise<Order | null> => {
    try {
      const response = await ordersApi.applyCoupon(orderId, couponCode);
      return response.data;
    } catch (err) {
      console.error('Error al aplicar cupón:', err);
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
    orders,
    loading,
    error,
    pagination,
    fetch,
    getById,
    create,
    checkout,
    applyCoupon,
    refetch,
  };
}

// Hook para el carrito
export function useCart() {
  const [cart, setCart] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersApi.getCart();
      setCart(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar carrito';
      setError(message);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkout = useCallback(async (paymentGateway: string): Promise<string | null> => {
    if (!cart?.id) return null;
    try {
      const response = await ordersApi.checkout(cart.id, paymentGateway);
      return response.data.paymentUrl;
    } catch (err) {
      console.error('Error en checkout:', err);
      return null;
    }
  }, [cart?.id]);

  const applyCoupon = useCallback(async (couponCode: string): Promise<boolean> => {
    if (!cart?.id) return false;
    try {
      const response = await ordersApi.applyCoupon(cart.id, couponCode);
      setCart(response.data);
      return true;
    } catch (err) {
      console.error('Error al aplicar cupón:', err);
      return false;
    }
  }, [cart?.id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { cart, loading, error, refetch: fetch, checkout, applyCoupon };
}
