import { useState, useEffect, useCallback } from 'react';
import { invoicesApi, type Invoice } from '../lib/api';

interface UseInvoicesOptions {
  autoFetch?: boolean;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

interface UseInvoicesReturn {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  fetch: (params?: UseInvoicesOptions) => Promise<void>;
  getById: (id: string) => Promise<Invoice | null>;
  downloadPdf: (id: string) => Promise<void>;
  pay: (id: string, gateway: string, returnUrl?: string) => Promise<string | null>;
  refetch: () => Promise<void>;
}

export function useInvoices(options: UseInvoicesOptions = {}): UseInvoicesReturn {
  const { autoFetch = true, status, from, to, page = 1, limit = 10 } = options;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseInvoicesReturn['pagination']>(null);

  const fetch = useCallback(async (params?: UseInvoicesOptions) => {
    setLoading(true);
    setError(null);
    try {
      const response = await invoicesApi.getAll({
        status: params?.status ?? status,
        from: params?.from ?? from,
        to: params?.to ?? to,
        page: params?.page ?? page,
        limit: params?.limit ?? limit,
      });
      setInvoices(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar facturas';
      setError(message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [status, from, to, page, limit]);

  const getById = useCallback(async (id: string): Promise<Invoice | null> => {
    try {
      const response = await invoicesApi.getById(id);
      return response.data;
    } catch (err) {
      console.error('Error al obtener factura:', err);
      return null;
    }
  }, []);

  const downloadPdf = useCallback(async (id: string): Promise<void> => {
    try {
      const blob = await invoicesApi.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      throw err;
    }
  }, []);

  const pay = useCallback(async (
    id: string, 
    gateway: string, 
    returnUrl?: string
  ): Promise<string | null> => {
    try {
      const response = await invoicesApi.pay(id, gateway, returnUrl);
      return response.data.paymentUrl;
    } catch (err) {
      console.error('Error al procesar pago:', err);
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
    invoices,
    loading,
    error,
    pagination,
    fetch,
    getById,
    downloadPdf,
    pay,
    refetch,
  };
}

// Hook para una factura individual
export function useInvoice(invoiceId: string | undefined) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!invoiceId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await invoicesApi.getById(invoiceId);
      setInvoice(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar factura';
      setError(message);
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { invoice, loading, error, refetch: fetch };
}
