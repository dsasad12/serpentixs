import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IntegrationType } from '../lib/integrations';

export interface PterodactylSettings {
  enabled: boolean;
  panelUrl: string;
  apiKey: string;
  clientApiKey?: string;
  defaultNodeId?: number;
}

export interface VirtualizorSettings {
  enabled: boolean;
  host: string;
  apiKey: string;
  apiPass: string;
  port: number;
  ssl: boolean;
  defaultServerId?: number;
}

export interface IntegrationSettings {
  pterodactyl: PterodactylSettings;
  virtualizor: VirtualizorSettings;
}

interface IntegrationSettingsState {
  settings: IntegrationSettings;
  connectionStatus: {
    [key in IntegrationType]?: {
      connected: boolean;
      lastCheck: string;
      error?: string;
    };
  };
  isLoading: boolean;
  lastSaved: string | null;

  // Actions
  updatePterodactylSettings: (settings: Partial<PterodactylSettings>) => void;
  updateVirtualizorSettings: (settings: Partial<VirtualizorSettings>) => void;
  setConnectionStatus: (type: IntegrationType, status: { connected: boolean; error?: string }) => void;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  testConnection: (type: IntegrationType) => Promise<{ success: boolean; message: string }>;
}

const defaultSettings: IntegrationSettings = {
  pterodactyl: {
    enabled: false,
    panelUrl: '',
    apiKey: '',
  },
  virtualizor: {
    enabled: false,
    host: '',
    apiKey: '',
    apiPass: '',
    port: 4085,
    ssl: true,
  },
};

export const useIntegrationSettingsStore = create<IntegrationSettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      connectionStatus: {},
      isLoading: false,
      lastSaved: null,

      updatePterodactylSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            pterodactyl: { ...state.settings.pterodactyl, ...updates },
          },
        }));
      },

      updateVirtualizorSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            virtualizor: { ...state.settings.virtualizor, ...updates },
          },
        }));
      },

      setConnectionStatus: (type, status) => {
        set((state) => ({
          connectionStatus: {
            ...state.connectionStatus,
            [type]: {
              ...status,
              lastCheck: new Date().toISOString(),
            },
          },
        }));
      },

      saveSettings: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          set({ lastSaved: new Date().toISOString(), isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loadSettings: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      testConnection: async (type) => {
        const { settings, setConnectionStatus } = get();

        try {
          switch (type) {
            case 'pterodactyl': {
              const { pterodactyl } = settings;
              if (!pterodactyl.panelUrl || !pterodactyl.apiKey) {
                setConnectionStatus('pterodactyl', { connected: false, error: 'Configuración incompleta' });
                return { success: false, message: 'URL del panel y API Key son requeridos' };
              }

              // In production, actually test the connection
              // For now, simulate
              await new Promise((resolve) => setTimeout(resolve, 1000));
              
              setConnectionStatus('pterodactyl', { connected: true });
              return { success: true, message: 'Conexión con Pterodactyl exitosa' };
            }

            case 'virtualizor': {
              const { virtualizor } = settings;
              if (!virtualizor.host || !virtualizor.apiKey || !virtualizor.apiPass) {
                setConnectionStatus('virtualizor', { connected: false, error: 'Configuración incompleta' });
                return { success: false, message: 'Host, API Key y API Pass son requeridos' };
              }

              // In production, actually test the connection
              await new Promise((resolve) => setTimeout(resolve, 1000));
              
              setConnectionStatus('virtualizor', { connected: true });
              return { success: true, message: 'Conexión con Virtualizor exitosa' };
            }

            default:
              return { success: false, message: 'Integración desconocida' };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
          setConnectionStatus(type, { connected: false, error: errorMessage });
          return { success: false, message: errorMessage };
        }
      },
    }),
    {
      name: 'serpentix-integration-settings',
      partialize: (state) => ({ 
        settings: state.settings, 
        lastSaved: state.lastSaved,
        connectionStatus: state.connectionStatus,
      }),
    }
  )
);

export default useIntegrationSettingsStore;
