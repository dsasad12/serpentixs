/**
 * Integrations Index
 * Export all server integrations (Pterodactyl, Virtualizor)
 */

// Pterodactyl Panel - import for local use
import { getPterodactyl } from './pterodactyl';
import { getVirtualizor } from './virtualizor';

// Re-export Pterodactyl
export {
  default as PterodactylAPI,
  initPterodactyl,
  getPterodactyl,
  type PterodactylConfig,
  type PterodactylUser,
  type PterodactylServer,
  type PterodactylNode,
  type PterodactylLocation,
  type PterodactylNest,
  type PterodactylEgg,
  type CreateServerParams,
} from './pterodactyl';

// Re-export Virtualizor
export {
  default as VirtualizorAPI,
  initVirtualizor,
  getVirtualizor,
  type VirtualizorConfig,
  type VirtualizorVPS,
  type VirtualizorNode,
  type VirtualizorOSTemplate,
  type VirtualizorPlan,
  type VirtualizorUser,
  type CreateVPSParams,
} from './virtualizor';

// Integration types
export type IntegrationType = 'pterodactyl' | 'virtualizor';

export interface IntegrationStatus {
  type: IntegrationType;
  name: string;
  isConfigured: boolean;
  isConnected: boolean;
  lastCheck: string | null;
  error?: string;
}

// Helper to check all integrations status
export const checkIntegrationsStatus = async (): Promise<IntegrationStatus[]> => {
  const results: IntegrationStatus[] = [];

  // Check Pterodactyl
  const pterodactyl = getPterodactyl();
  if (pterodactyl) {
    const isConnected = await pterodactyl.testConnection();
    results.push({
      type: 'pterodactyl',
      name: 'Pterodactyl Panel',
      isConfigured: true,
      isConnected,
      lastCheck: new Date().toISOString(),
    });
  } else {
    results.push({
      type: 'pterodactyl',
      name: 'Pterodactyl Panel',
      isConfigured: false,
      isConnected: false,
      lastCheck: null,
    });
  }

  // Check Virtualizor
  const virtualizor = getVirtualizor();
  if (virtualizor) {
    const isConnected = await virtualizor.testConnection();
    results.push({
      type: 'virtualizor',
      name: 'Virtualizor',
      isConfigured: true,
      isConnected,
      lastCheck: new Date().toISOString(),
    });
  } else {
    results.push({
      type: 'virtualizor',
      name: 'Virtualizor',
      isConfigured: false,
      isConnected: false,
      lastCheck: null,
    });
  }

  return results;
};
