import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(options: UseApiOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<{ data: T }>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await apiCall();
        setState({ data: response.data, loading: false, error: null });
        options.onSuccess?.(response.data);
        return response.data;
      } catch (err) {
        const error = err as AxiosError<{ error?: { message?: string } }>;
        const message = error.response?.data?.error?.message || error.message || 'Error desconocido';
        setState({ data: null, loading: false, error: message });
        options.onError?.(message);
        throw error;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData }>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<ApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await mutationFn(variables);
        setState({ data: response.data, loading: false, error: null });
        options.onSuccess?.(response.data);
        return response.data;
      } catch (err) {
        const error = err as AxiosError<{ error?: { message?: string } }>;
        const message = error.response?.data?.error?.message || error.message || 'Error desconocido';
        setState({ data: null, loading: false, error: message });
        options.onError?.(message);
        throw error;
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, mutate, reset };
}
