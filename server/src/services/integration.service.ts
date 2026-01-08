import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API Response interfaces
interface PterodactylErrorResponse {
  errors?: Array<{ detail?: string }>;
}

interface PterodactylApiResponse<T = unknown> {
  data?: Array<{ attributes: T }>;
  attributes?: T;
  error?: string;
}

interface VirtualizorApiResponse {
  error?: string;
  vs?: Record<number, unknown>;
  servergroups?: Record<string, unknown>;
  plans?: Record<string, unknown>;
  ostemplates?: Record<string, unknown>;
  [key: string]: unknown;
}

// ============================================
// PTERODACTYL SERVICE
// ============================================

interface PterodactylConfig {
  panelUrl: string;
  apiKey: string;
  clientApiKey?: string;
}

export const PterodactylService = {
  getConfig(): PterodactylConfig {
    return {
      panelUrl: process.env.PTERODACTYL_URL || '',
      apiKey: process.env.PTERODACTYL_API_KEY || '',
      clientApiKey: process.env.PTERODACTYL_CLIENT_API_KEY,
    };
  },

  async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const config = this.getConfig();
    
    const response = await fetch(`${config.panelUrl}/api/application${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as PterodactylErrorResponse;
      throw new Error(error.errors?.[0]?.detail || `Pterodactyl API error: ${response.status}`);
    }

    return response.json() as Promise<PterodactylApiResponse>;
  },

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/');
      return true;
    } catch {
      return false;
    }
  },

  // Get nodes
  async getNodes() {
    const response = await this.makeRequest('/nodes') as PterodactylApiResponse;
    return response.data;
  },

  // Get locations
  async getLocations() {
    const response = await this.makeRequest('/locations') as PterodactylApiResponse;
    return response.data;
  },

  // Get nests
  async getNests() {
    const response = await this.makeRequest('/nests') as PterodactylApiResponse;
    return response.data;
  },

  // Get eggs for a nest
  async getEggs(nestId: number) {
    const response = await this.makeRequest(`/nests/${nestId}/eggs`) as PterodactylApiResponse;
    return response.data;
  },

  // Create user
  async createUser(userData: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await this.makeRequest('/users', 'POST', {
      email: userData.email,
      username: userData.username,
      first_name: userData.firstName,
      last_name: userData.lastName,
    }) as PterodactylApiResponse;
    return response.attributes;
  },

  // Get user by email
  async getUserByEmail(email: string) {
    const response = await this.makeRequest(`/users?filter[email]=${encodeURIComponent(email)}`) as PterodactylApiResponse<{ id: number; email: string }>;
    return response.data?.[0]?.attributes;
  },

  // Create server
  async createServer(serverData: {
    name: string;
    userId: number;
    nestId: number;
    eggId: number;
    dockerImage: string;
    startup: string;
    environment: Record<string, string>;
    limits: {
      memory: number;
      swap: number;
      disk: number;
      io: number;
      cpu: number;
    };
    featureLimits: {
      databases: number;
      backups: number;
      allocations: number;
    };
    allocation?: { default: number };
    deploy?: {
      locations: number[];
      dedicatedIp: boolean;
      portRange: string[];
    };
  }) {
    const response = await this.makeRequest('/servers', 'POST', {
      name: serverData.name,
      user: serverData.userId,
      nest: serverData.nestId,
      egg: serverData.eggId,
      docker_image: serverData.dockerImage,
      startup: serverData.startup,
      environment: serverData.environment,
      limits: serverData.limits,
      feature_limits: serverData.featureLimits,
      allocation: serverData.allocation,
      deploy: serverData.deploy,
    }) as PterodactylApiResponse;
    return response.attributes;
  },

  // Suspend server
  async suspendServer(serverId: number) {
    await this.makeRequest(`/servers/${serverId}/suspend`, 'POST');
  },

  // Unsuspend server
  async unsuspendServer(serverId: number) {
    await this.makeRequest(`/servers/${serverId}/unsuspend`, 'POST');
  },

  // Delete server
  async deleteServer(serverId: number) {
    await this.makeRequest(`/servers/${serverId}`, 'DELETE');
  },

  // Get server details
  async getServer(serverId: number) {
    const response = await this.makeRequest(`/servers/${serverId}`) as PterodactylApiResponse;
    return response.attributes;
  },
};

// ============================================
// VIRTUALIZOR SERVICE
// ============================================

interface VirtualizorConfig {
  host: string;
  port: number;
  useSSL: boolean;
  apiKey: string;
  apiPass: string;
}

export const VirtualizorService = {
  getConfig(): VirtualizorConfig {
    return {
      host: process.env.VIRTUALIZOR_HOST || '',
      port: parseInt(process.env.VIRTUALIZOR_PORT || '4085'),
      useSSL: process.env.VIRTUALIZOR_SSL === 'true',
      apiKey: process.env.VIRTUALIZOR_API_KEY || '',
      apiPass: process.env.VIRTUALIZOR_API_PASS || '',
    };
  },

  getBaseUrl(): string {
    const config = this.getConfig();
    const protocol = config.useSSL ? 'https' : 'http';
    return `${protocol}://${config.host}:${config.port}`;
  },

  async makeRequest(action: string, params: Record<string, any> = {}): Promise<VirtualizorApiResponse> {
    const config = this.getConfig();
    const baseUrl = this.getBaseUrl();

    const queryParams = new URLSearchParams({
      api: 'json',
      apikey: config.apiKey,
      apipass: config.apiPass,
      act: action,
      ...params,
    });

    const response = await fetch(`${baseUrl}/index.php?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Virtualizor API error: ${response.status}`);
    }

    return response.json() as Promise<VirtualizorApiResponse>;
  },

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('listvs');
      return !response.error;
    } catch {
      return false;
    }
  },

  // Get VPS list
  async listVPS() {
    const response = await this.makeRequest('listvs');
    return response.vs || {};
  },

  // Get server groups
  async getServerGroups() {
    const response = await this.makeRequest('servergroups');
    return response.servergroups || {};
  },

  // Get plans
  async getPlans() {
    const response = await this.makeRequest('plans');
    return response.plans || {};
  },

  // Get OS templates
  async getOSTemplates() {
    const response = await this.makeRequest('ostemplates');
    return response.ostemplates || {};
  },

  // Create VPS
  async createVPS(vpsData: {
    hostname: string;
    rootPass: string;
    email: string;
    planId: number;
    osId: number;
    serverId?: number;
  }) {
    const response = await this.makeRequest('addvs', {
      hostname: vpsData.hostname,
      rootpass: vpsData.rootPass,
      email: vpsData.email,
      plid: vpsData.planId.toString(),
      osid: vpsData.osId.toString(),
      serid: vpsData.serverId?.toString() || '0',
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return response;
  },

  // Suspend VPS
  async suspendVPS(vpsId: number) {
    const response = await this.makeRequest('suspend', { vpsid: vpsId.toString() });
    
    if (response.error) {
      throw new Error(response.error);
    }

    return response;
  },

  // Unsuspend VPS
  async unsuspendVPS(vpsId: number) {
    const response = await this.makeRequest('unsuspend', { vpsid: vpsId.toString() });
    
    if (response.error) {
      throw new Error(response.error);
    }

    return response;
  },

  // Delete VPS
  async deleteVPS(vpsId: number) {
    const response = await this.makeRequest('vs', {
      delete: vpsId.toString(),
    });
    
    if (response.error) {
      throw new Error(response.error);
    }

    return response;
  },

  // Get VPS details
  async getVPS(vpsId: number) {
    const response = await this.makeRequest('vs', { vpsid: vpsId.toString() });
    return response.vs?.[vpsId] || null;
  },
};

// ============================================
// INTEGRATION SERVICE (Common functions)
// ============================================

export const IntegrationService = {
  // Create provisioned server record
  async createProvisionedServer(data: {
    serviceId: string;
    integrationType: string;
    externalId: string;
    externalUserId?: string;
    serverName: string;
    serverIp?: string;
    metadata?: any;
  }) {
    return prisma.provisionedServer.create({
      data: {
        serviceId: data.serviceId,
        integrationType: data.integrationType as any,
        externalId: data.externalId,
        serverId: data.externalUserId,
        hostname: data.serverName,
        ipAddress: data.serverIp,
        status: 'ACTIVE',
        metadata: data.metadata,
      },
    });
  },

  // Get provisioned server by service ID
  async getProvisionedServer(serviceId: string) {
    return prisma.provisionedServer.findFirst({
      where: { serviceId },
    });
  },

  // Update server status
  async updateServerStatus(serviceId: string, status: string) {
    const server = await prisma.provisionedServer.findFirst({
      where: { serviceId },
    });
    
    if (!server) {
      throw new Error('Server not found');
    }

    return prisma.provisionedServer.update({
      where: { id: server.id },
      data: { status: status as any },
    });
  },

  // Delete provisioned server record
  async deleteProvisionedServer(serviceId: string) {
    const server = await prisma.provisionedServer.findFirst({
      where: { serviceId },
    });
    
    if (!server) {
      throw new Error('Server not found');
    }

    return prisma.provisionedServer.delete({
      where: { id: server.id },
    });
  },

  // Get active integrations
  async getActiveIntegrations() {
    return prisma.integration.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  },
};

export default {
  PterodactylService,
  VirtualizorService,
  IntegrationService,
};
