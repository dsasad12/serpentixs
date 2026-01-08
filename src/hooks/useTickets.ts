import { useState, useEffect, useCallback } from 'react';
import { ticketsApi, type Ticket, type CreateTicketRequest, type TicketReply } from '../lib/api';

interface UseTicketsOptions {
  autoFetch?: boolean;
  status?: string;
  page?: number;
  limit?: number;
}

interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  fetch: (params?: { status?: string; page?: number; limit?: number }) => Promise<void>;
  getById: (id: string) => Promise<Ticket | null>;
  create: (data: CreateTicketRequest) => Promise<Ticket | null>;
  reply: (id: string, message: string, attachments?: File[]) => Promise<TicketReply | null>;
  close: (id: string) => Promise<boolean>;
  reopen: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useTickets(options: UseTicketsOptions = {}): UseTicketsReturn {
  const { autoFetch = true, status, page = 1, limit = 10 } = options;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseTicketsReturn['pagination']>(null);

  const fetch = useCallback(async (params?: { status?: string; page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ticketsApi.getAll({
        status: params?.status ?? status,
        page: params?.page ?? page,
        limit: params?.limit ?? limit,
      });
      setTickets(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar tickets';
      setError(message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [status, page, limit]);

  const getById = useCallback(async (id: string): Promise<Ticket | null> => {
    try {
      const response = await ticketsApi.getById(id);
      return response.data;
    } catch (err) {
      console.error('Error al obtener ticket:', err);
      return null;
    }
  }, []);

  const create = useCallback(async (data: CreateTicketRequest): Promise<Ticket | null> => {
    try {
      const response = await ticketsApi.create(data);
      await fetch(); // Refetch list after creating
      return response.data;
    } catch (err) {
      console.error('Error al crear ticket:', err);
      return null;
    }
  }, [fetch]);

  const reply = useCallback(async (
    id: string, 
    message: string, 
    attachments?: File[]
  ): Promise<TicketReply | null> => {
    try {
      const response = await ticketsApi.reply(id, message, attachments);
      return response.data;
    } catch (err) {
      console.error('Error al responder ticket:', err);
      return null;
    }
  }, []);

  const close = useCallback(async (id: string): Promise<boolean> => {
    try {
      await ticketsApi.close(id);
      await fetch(); // Refetch list after closing
      return true;
    } catch (err) {
      console.error('Error al cerrar ticket:', err);
      return false;
    }
  }, [fetch]);

  const reopen = useCallback(async (id: string): Promise<boolean> => {
    try {
      await ticketsApi.reopen(id);
      await fetch(); // Refetch list after reopening
      return true;
    } catch (err) {
      console.error('Error al reabrir ticket:', err);
      return false;
    }
  }, [fetch]);

  const refetch = useCallback(() => fetch(), [fetch]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  return {
    tickets,
    loading,
    error,
    pagination,
    fetch,
    getById,
    create,
    reply,
    close,
    reopen,
    refetch,
  };
}

// Hook para un ticket individual
export function useTicket(ticketId: string | undefined) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!ticketId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await ticketsApi.getById(ticketId);
      setTicket(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar ticket';
      setError(message);
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  const reply = useCallback(async (message: string, attachments?: File[]): Promise<boolean> => {
    if (!ticketId) return false;
    try {
      await ticketsApi.reply(ticketId, message, attachments);
      await fetch(); // Refetch to get updated replies
      return true;
    } catch (err) {
      console.error('Error al responder:', err);
      return false;
    }
  }, [ticketId, fetch]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ticket, loading, error, refetch: fetch, reply };
}
