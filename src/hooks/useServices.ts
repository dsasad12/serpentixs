import { useState, useEffect, useCallback } from 'react';
import { servicesApi, type Service } from '../lib/api';

interface UseServicesOptions {
  autoFetch?: boolean;
  status?: string;
  page?: number;
  limit?: number;
}

interface UseServicesReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  fetch: (params?: { status?: string; page?: number; limit?: number }) => Promise<void>;
  getById: (id: string) => Promise<Service | null>;
  performAction: (id: string, action: 'start' | 'stop' | 'restart' | 'reinstall') => Promise<boolean>;
  getStats: (id: string) => Promise<{ cpu: number; memory: number; disk: number } | null>;
  refetch: () => Promise<void>;
}

export function useServices(options: UseServicesOptions = {}): UseServicesReturn {
  const { autoFetch = true, status, page = 1, limit = 10 } = options;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseServicesReturn['pagination']>(null);

  const fetch = useCallback(async (params?: { status?: string; page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await servicesApi.getAll({
        status: params?.status ?? status,
        page: params?.page ?? page,
        limit: params?.limit ?? limit,
      });
      setServices(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar servicios';
      setError(message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [status, page, limit]);

  const getById = useCallback(async (id: string): Promise<Service | null> => {
    try {
      const response = await servicesApi.getById(id);
      return response.data;
    } catch (err) {
      console.error('Error al obtener servicio:', err);
      return null;
    }
  }, []);

  const performAction = useCallback(async (
    id: string, 
    action: 'start' | 'stop' | 'restart' | 'reinstall'
  ): Promise<boolean> => {
    try {
      await servicesApi.performAction(id, action);
      return true;
    } catch (err) {
      console.error('Error al realizar acción:', err);
      return false;
    }
  }, []);

  const getStats = useCallback(async (id: string) => {
    try {
      const response = await servicesApi.getStats(id);
      return response.data;
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
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
    services,
    loading,
    error,
    pagination,
    fetch,
    getById,
    performAction,
    getStats,
    refetch,
  };
}

// Hook para un servicio individual
export function useService(serviceId: string | undefined) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!serviceId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await servicesApi.getById(serviceId);
      setService(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar servicio';
      setError(message);
      setService(null);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { service, loading, error, refetch: fetch };
}
