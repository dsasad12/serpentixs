/**
 * Pterodactyl Panel Integration
 * API wrapper for Pterodactyl Panel - Game Server Management
 * Similar to Paymenter's implementation
 */

export interface PterodactylConfig {
  panelUrl: string;
  apiKey: string;
  clientApiKey?: string;
}

export interface PterodactylUser {
  id: number;
  external_id: string | null;
  uuid: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  language: string;
  root_admin: boolean;
  '2fa': boolean;
  created_at: string;
  updated_at: string;
}

export interface PterodactylServer {
  id: number;
  external_id: string | null;
  uuid: string;
  identifier: string;
  name: string;
  description: string;
  status: string | null;
  suspended: boolean;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
    threads: string | null;
    oom_disabled: boolean;
  };
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  user: number;
  node: number;
  allocation: number;
  nest: number;
  egg: number;
  container: {
    startup_command: string;
    image: string;
    installed: number;
    environment: Record<string, string>;
  };
  created_at: string;
  updated_at: string;
}

export interface PterodactylNode {
  id: number;
  uuid: string;
  public: boolean;
  name: string;
  description: string | null;
  location_id: number;
  fqdn: string;
  scheme: string;
  behind_proxy: boolean;
  maintenance_mode: boolean;
  memory: number;
  memory_overallocate: number;
  disk: number;
  disk_overallocate: number;
  upload_size: number;
  daemon_listen: number;
  daemon_sftp: number;
  daemon_base: string;
  created_at: string;
  updated_at: string;
  allocated_resources: {
    memory: number;
    disk: number;
  };
}

export interface PterodactylLocation {
  id: number;
  short: string;
  long: string;
  created_at: string;
  updated_at: string;
}

export interface PterodactylNest {
  id: number;
  uuid: string;
  author: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PterodactylEgg {
  id: number;
  uuid: string;
  name: string;
  nest: number;
  author: string;
  description: string | null;
  docker_image: string;
  docker_images: Record<string, string>;
  config: {
    files: Record<string, unknown>;
    startup: Record<string, unknown>;
    stop: string;
    logs: Record<string, unknown>;
    file_denylist: string[];
    extends: string | null;
  };
  startup: string;
  script: {
    privileged: boolean;
    install: string;
    entry: string;
    container: string;
    extends: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateServerParams {
  name: string;
  user: number;
  egg: number;
  docker_image: string;
  startup: string;
  environment: Record<string, string>;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
  };
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  allocation: {
    default: number;
    additional?: number[];
  };
  deploy?: {
    locations: number[];
    dedicated_ip: boolean;
    port_range: string[];
  };
  start_on_completion?: boolean;
  external_id?: string;
}

class PterodactylAPI {
  private config: PterodactylConfig;
  private baseUrl: string;

  constructor(config: PterodactylConfig) {
    this.config = config;
    this.baseUrl = config.panelUrl.replace(/\/$/, '');
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: unknown,
    useClientApi = false
  ): Promise<T> {
    const apiKey = useClientApi ? this.config.clientApiKey : this.config.apiKey;
    const url = `${this.baseUrl}/api/${useClientApi ? 'client' : 'application'}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ errors: [{ detail: 'Unknown error' }] }));
      throw new Error(error.errors?.[0]?.detail || `Pterodactyl API Error: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ============ USERS ============

  async getUsers(): Promise<{ data: { attributes: PterodactylUser }[] }> {
    return this.request('/users');
  }

  async getUser(id: number): Promise<{ attributes: PterodactylUser }> {
    return this.request(`/users/${id}`);
  }

  async getUserByExternalId(externalId: string): Promise<{ attributes: PterodactylUser }> {
    return this.request(`/users/external/${externalId}`);
  }

  async createUser(data: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password?: string;
    external_id?: string;
  }): Promise<{ attributes: PterodactylUser }> {
    return this.request('/users', 'POST', data);
  }

  async updateUser(id: number, data: Partial<{
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    external_id: string;
  }>): Promise<{ attributes: PterodactylUser }> {
    return this.request(`/users/${id}`, 'PATCH', data);
  }

  async deleteUser(id: number): Promise<void> {
    return this.request(`/users/${id}`, 'DELETE');
  }

  // ============ SERVERS ============

  async getServers(): Promise<{ data: { attributes: PterodactylServer }[] }> {
    return this.request('/servers');
  }

  async getServer(id: number): Promise<{ attributes: PterodactylServer }> {
    return this.request(`/servers/${id}`);
  }

  async getServerByExternalId(externalId: string): Promise<{ attributes: PterodactylServer }> {
    return this.request(`/servers/external/${externalId}`);
  }

  async createServer(data: CreateServerParams): Promise<{ attributes: PterodactylServer }> {
    return this.request('/servers', 'POST', data);
  }

  async updateServerDetails(id: number, data: {
    name?: string;
    user?: number;
    external_id?: string;
    description?: string;
  }): Promise<{ attributes: PterodactylServer }> {
    return this.request(`/servers/${id}/details`, 'PATCH', data);
  }

  async updateServerBuild(id: number, data: {
    allocation?: number;
    memory?: number;
    swap?: number;
    disk?: number;
    io?: number;
    cpu?: number;
    threads?: string;
    feature_limits?: {
      databases?: number;
      allocations?: number;
      backups?: number;
    };
    oom_disabled?: boolean;
  }): Promise<{ attributes: PterodactylServer }> {
    return this.request(`/servers/${id}/build`, 'PATCH', data);
  }

  async updateServerStartup(id: number, data: {
    startup?: string;
    environment?: Record<string, string>;
    egg?: number;
    image?: string;
    skip_scripts?: boolean;
  }): Promise<{ attributes: PterodactylServer }> {
    return this.request(`/servers/${id}/startup`, 'PATCH', data);
  }

  async suspendServer(id: number): Promise<void> {
    return this.request(`/servers/${id}/suspend`, 'POST');
  }

  async unsuspendServer(id: number): Promise<void> {
    return this.request(`/servers/${id}/unsuspend`, 'POST');
  }

  async reinstallServer(id: number): Promise<void> {
    return this.request(`/servers/${id}/reinstall`, 'POST');
  }

  async deleteServer(id: number, force = false): Promise<void> {
    return this.request(`/servers/${id}${force ? '/force' : ''}`, 'DELETE');
  }

  // ============ NODES ============

  async getNodes(): Promise<{ data: { attributes: PterodactylNode }[] }> {
    return this.request('/nodes');
  }

  async getNode(id: number): Promise<{ attributes: PterodactylNode }> {
    return this.request(`/nodes/${id}`);
  }

  async getNodeAllocations(nodeId: number): Promise<{ data: { attributes: { id: number; ip: string; port: number; assigned: boolean } }[] }> {
    return this.request(`/nodes/${nodeId}/allocations`);
  }

  // ============ LOCATIONS ============

  async getLocations(): Promise<{ data: { attributes: PterodactylLocation }[] }> {
    return this.request('/locations');
  }

  async getLocation(id: number): Promise<{ attributes: PterodactylLocation }> {
    return this.request(`/locations/${id}`);
  }

  // ============ NESTS & EGGS ============

  async getNests(): Promise<{ data: { attributes: PterodactylNest }[] }> {
    return this.request('/nests');
  }

  async getNest(id: number): Promise<{ attributes: PterodactylNest }> {
    return this.request(`/nests/${id}`);
  }

  async getEggs(nestId: number): Promise<{ data: { attributes: PterodactylEgg }[] }> {
    return this.request(`/nests/${nestId}/eggs`);
  }

  async getEgg(nestId: number, eggId: number): Promise<{ attributes: PterodactylEgg }> {
    return this.request(`/nests/${nestId}/eggs/${eggId}`);
  }

  // ============ CLIENT API (Server Power/Console) ============

  async getClientServers(): Promise<{ data: { attributes: unknown }[] }> {
    return this.request('/', 'GET', undefined, true);
  }

  async sendPowerAction(serverId: string, action: 'start' | 'stop' | 'restart' | 'kill'): Promise<void> {
    return this.request(`/servers/${serverId}/power`, 'POST', { signal: action }, true);
  }

  async sendCommand(serverId: string, command: string): Promise<void> {
    return this.request(`/servers/${serverId}/command`, 'POST', { command }, true);
  }

  async getServerResources(serverId: string): Promise<{
    attributes: {
      current_state: string;
      is_suspended: boolean;
      resources: {
        memory_bytes: number;
        cpu_absolute: number;
        disk_bytes: number;
        network_rx_bytes: number;
        network_tx_bytes: number;
        uptime: number;
      };
    };
  }> {
    return this.request(`/servers/${serverId}/resources`, 'GET', undefined, true);
  }

  // ============ HELPER METHODS ============

  async testConnection(): Promise<boolean> {
    try {
      await this.getUsers();
      return true;
    } catch {
      return false;
    }
  }

  async findAvailableAllocation(nodeId: number): Promise<number | null> {
    const allocations = await this.getNodeAllocations(nodeId);
    const available = allocations.data.find(a => !a.attributes.assigned);
    return available?.attributes.id || null;
  }

  async provisionGameServer(options: {
    userId: string;
    orderId: string;
    productConfig: {
      nodeId: number;
      nestId: number;
      eggId: number;
      memory: number;
      disk: number;
      cpu: number;
      databases?: number;
      backups?: number;
      serverName: string;
      startupCommand?: string;
      environment?: Record<string, string>;
      dockerImage?: string;
    };
  }): Promise<PterodactylServer> {
    const { userId, orderId, productConfig } = options;

    // Find or create user
    let pterodactylUser: PterodactylUser;
    try {
      const existingUser = await this.getUserByExternalId(userId);
      pterodactylUser = existingUser.attributes;
    } catch {
      // Create new user - in real implementation, get user details from your database
      const newUser = await this.createUser({
        email: `user-${userId}@temp.com`,
        username: `user_${userId}`,
        first_name: 'User',
        last_name: userId,
        external_id: userId,
      });
      pterodactylUser = newUser.attributes;
    }

    // Get egg details
    const egg = await this.getEgg(productConfig.nestId, productConfig.eggId);

    // Find available allocation
    const allocationId = await this.findAvailableAllocation(productConfig.nodeId);
    if (!allocationId) {
      throw new Error('No available allocations on the selected node');
    }

    // Create server
    const server = await this.createServer({
      name: productConfig.serverName,
      user: pterodactylUser.id,
      egg: productConfig.eggId,
      docker_image: productConfig.dockerImage || egg.attributes.docker_image,
      startup: productConfig.startupCommand || egg.attributes.startup,
      environment: productConfig.environment || {},
      limits: {
        memory: productConfig.memory,
        swap: 0,
        disk: productConfig.disk,
        io: 500,
        cpu: productConfig.cpu,
      },
      feature_limits: {
        databases: productConfig.databases || 0,
        allocations: 1,
        backups: productConfig.backups || 0,
      },
      allocation: {
        default: allocationId,
      },
      external_id: orderId,
      start_on_completion: true,
    });

    return server.attributes;
  }
}

export default PterodactylAPI;

// Singleton instance for the application
let pterodactylInstance: PterodactylAPI | null = null;

export const initPterodactyl = (config: PterodactylConfig): PterodactylAPI => {
  pterodactylInstance = new PterodactylAPI(config);
  return pterodactylInstance;
};

export const getPterodactyl = (): PterodactylAPI | null => {
  return pterodactylInstance;
};
