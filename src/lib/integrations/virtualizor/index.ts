/**
 * Virtualizor Integration
 * API wrapper for Virtualizor - VPS Management Panel
 * Similar to Paymenter's implementation
 */

export interface VirtualizorConfig {
  host: string;
  apiKey: string;
  apiPass: string;
  port?: number;
  ssl?: boolean;
}

export interface VirtualizorVPS {
  vpsid: number;
  vps_name: string;
  hostname: string;
  os_name: string;
  os_distro: string;
  iso: string;
  space: number;
  inodes: number;
  ram: number;
  burst: number;
  swap: number;
  cpu: number;
  cores: number;
  cpupin: number;
  cpu_percent: number;
  bandwidth: number;
  network_speed: number;
  upload_speed: number;
  io_priority: number;
  io_read: number;
  io_write: number;
  ubc: string;
  virt: string;
  uid: number;
  plid: number;
  nid: number;
  vnc: number;
  vncport: number;
  vnc_passwd: string;
  acpi: number;
  apic: number;
  pae: number;
  shadow: number;
  status: number;
  suspended: number;
  suspend_reason: string | null;
  nw_suspended: number;
  rescue: number;
  band_suspend: number;
  tuntap: number;
  ppp: number;
  ploop: number;
  dns_nameserver: string;
  osreinstall_limit: number;
  preferences: string;
  nic_type: string;
  vif_type: string;
  virtio: number;
  kvm_cache: string;
  io_mode: string;
  cpu_mode: string;
  total_iops_sec: number;
  read_bytes_sec: number;
  write_bytes_sec: number;
  vnc_keymap: string;
  osid: number;
  mg: string;
  used_bandwidth: number;
  webuzo: number;
  disable_ebtables: number;
  install_date: string;
  ipv6: number;
  ipv6_num: number;
  mac2: string;
  ips: string[];
  ips6: string[];
}

export interface VirtualizorNode {
  serid: number;
  name: string;
  ip: string;
  status: number;
  locked: number;
  hostname: string;
  os: string;
  ram: number;
  used_ram: number;
  disk: number;
  used_disk: number;
  bandwidth: number;
  used_bandwidth: number;
  virt: string;
  num_vs: number;
  max_vs: number;
}

export interface VirtualizorOSTemplate {
  osid: number;
  type: string;
  name: string;
  filename: string;
  distro: string;
  arch: number;
  url: string;
  size: number;
  pygrub: number;
  drive: string;
  hvm: number;
  perf_ops: number;
  fstype: string;
}

export interface VirtualizorPlan {
  plid: number;
  plan_name: string;
  virt: string;
  disk_space: number;
  guaranteed_ram: number;
  burstable_ram: number;
  swap_ram: number;
  bandwidth: number;
  network_speed: number;
  cpu_units: number;
  cpu_cores: number;
  percent_cpu: number;
  io_priority: number;
  num_ips: number;
  num_ips6: number;
  space: number;
  inodes: number;
  cpu: number;
}

export interface VirtualizorUser {
  uid: number;
  email: string;
  type: number;
  pid: number;
  num_vs: number;
  max_vs: number;
  num_users: number;
  max_users: number;
  space: number;
  ram: number;
  burst: number;
  bandwidth: number;
  max_cores: number;
  max_cpu: number;
  max_space: number;
  max_ram: number;
  max_burst: number;
  max_bandwidth: number;
  max_ipv4: number;
  max_ipv6: number;
}

export interface CreateVPSParams {
  serid: number; // Server/Node ID
  plid: number;  // Plan ID
  osid: number;  // OS Template ID
  hostname: string;
  rootpass: string;
  num_ips?: number;
  num_ips6?: number;
  uid?: number;
  email?: string;
  ips?: string[];
  ips6?: string[];
  space?: number;
  ram?: number;
  burst?: number;
  bandwidth?: number;
  cpu?: number;
  cores?: number;
  cpu_percent?: number;
  vnc?: number;
  vncpass?: string;
  addvps?: number;
}

class VirtualizorAPI {
  private config: VirtualizorConfig;
  private baseUrl: string;

  constructor(config: VirtualizorConfig) {
    this.config = config;
    const protocol = config.ssl !== false ? 'https' : 'http';
    const port = config.port || 4085;
    this.baseUrl = `${protocol}://${config.host}:${port}`;
  }

  private buildUrl(action: string, params: Record<string, string | number | boolean> = {}): string {
    const url = new URL(`${this.baseUrl}/index.php`);
    url.searchParams.set('act', action);
    url.searchParams.set('api', 'json');
    url.searchParams.set('apikey', this.config.apiKey);
    url.searchParams.set('apipass', this.config.apiPass);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  }

  private async request<T>(action: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
    const url = this.buildUrl(action, params);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Virtualizor API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Virtualizor API Error');
    }

    return data;
  }

  private async postRequest<T>(action: string, body: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}/index.php?act=${action}&api=json&apikey=${this.config.apiKey}&apipass=${this.config.apiPass}`;
    
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v, i) => formData.append(`${key}[${i}]`, String(v)));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Virtualizor API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Virtualizor API Error');
    }

    return data;
  }

  // ============ VPS MANAGEMENT ============

  async listVPS(): Promise<{ vs: Record<string, VirtualizorVPS> }> {
    return this.request('vs');
  }

  async getVPS(vpsId: number): Promise<{ vps: VirtualizorVPS }> {
    return this.request('vs', { vpsid: vpsId });
  }

  async createVPS(params: CreateVPSParams): Promise<{ done: boolean; vpsid: number; rootpass: string }> {
    return this.postRequest('addvs', {
      ...params,
      addvps: 1,
    });
  }

  async deleteVPS(vpsId: number): Promise<{ done: boolean }> {
    return this.postRequest('vs', {
      delete: vpsId,
      delvs: 1,
    });
  }

  async startVPS(vpsId: number): Promise<{ done: boolean }> {
    return this.postRequest('vs', {
      vpsid: vpsId,
      action: 'start',
    });
  }

  async stopVPS(vpsId: number): Promise<{ done: boolean }> {
    return this.postRequest('vs', {
      vpsid: vpsId,
      action: 'stop',
    });
  }

  async restartVPS(vpsId: number): Promise<{ done: boolean }> {
    return this.postRequest('vs', {
      vpsid: vpsId,
      action: 'restart',
    });
  }

  async suspendVPS(vpsId: number, reason?: string): Promise<{ done: boolean }> {
    return this.postRequest('vs', {
      vpsid: vpsId,
      action: 'suspend',
      suspend_reason: reason || 'Suspended by billing system',
    });
  }

  async unsuspendVPS(vpsId: number): Promise<{ done: boolean }> {
    return this.postRequest('vs', {
      vpsid: vpsId,
      action: 'unsuspend',
    });
  }

  async reinstallVPS(vpsId: number, osId: number, password: string): Promise<{ done: boolean }> {
    return this.postRequest('rebuild', {
      vpsid: vpsId,
      osid: osId,
      newpass: password,
      rebuild: 1,
    });
  }

  async changeVPSPassword(vpsId: number, newPassword: string): Promise<{ done: boolean }> {
    return this.postRequest('vs', {
      vpsid: vpsId,
      rootpass: newPassword,
      changepassword: 1,
    });
  }

  async changeVPSHostname(vpsId: number, hostname: string): Promise<{ done: boolean }> {
    return this.postRequest('vs', {
      vpsid: vpsId,
      hostname,
      changehostname: 1,
    });
  }

  async getVPSStatus(vpsId: number): Promise<{ status: 'running' | 'stopped' | 'suspended' }> {
    const data = await this.getVPS(vpsId);
    if (data.vps.suspended) {
      return { status: 'suspended' };
    }
    return { status: data.vps.status === 1 ? 'running' : 'stopped' };
  }

  async getVPSBandwidth(vpsId: number): Promise<{
    used: number;
    limit: number;
    percent: number;
  }> {
    const data = await this.getVPS(vpsId);
    const used = data.vps.used_bandwidth || 0;
    const limit = data.vps.bandwidth || 0;
    const percent = limit > 0 ? (used / limit) * 100 : 0;
    return { used, limit, percent };
  }

  async getVNCInfo(vpsId: number): Promise<{ port: number; password: string; url: string }> {
    const data = await this.getVPS(vpsId);
    return {
      port: data.vps.vncport,
      password: data.vps.vnc_passwd,
      url: `${this.baseUrl}/vnc.php?novnc=1&vpsid=${vpsId}`,
    };
  }

  // ============ NODES/SERVERS ============

  async listNodes(): Promise<{ servers: Record<string, VirtualizorNode> }> {
    return this.request('servers');
  }

  async getNode(serverId: number): Promise<{ servers: VirtualizorNode }> {
    return this.request('servers', { serid: serverId });
  }

  // ============ OS TEMPLATES ============

  async listOSTemplates(virt?: string): Promise<{ oslist: Record<string, VirtualizorOSTemplate> }> {
    return this.request('ostemplates', virt ? { virt } : {});
  }

  // ============ PLANS ============

  async listPlans(): Promise<{ plans: Record<string, VirtualizorPlan> }> {
    return this.request('plans');
  }

  async getPlan(planId: number): Promise<{ plans: VirtualizorPlan }> {
    return this.request('plans', { plid: planId });
  }

  // ============ USERS ============

  async listUsers(): Promise<{ users: Record<string, VirtualizorUser> }> {
    return this.request('users');
  }

  async getUser(userId: number): Promise<{ users: VirtualizorUser }> {
    return this.request('users', { uid: userId });
  }

  async createUser(data: {
    email: string;
    password: string;
    firstname?: string;
    lastname?: string;
  }): Promise<{ done: boolean; uid: number }> {
    return this.postRequest('adduser', {
      ...data,
      adduser: 1,
    });
  }

  // ============ IPs ============

  async listIPs(serverId?: number): Promise<{ ips: Record<string, { ip: string; vpsid: number | null }> }> {
    return this.request('ips', serverId ? { serid: serverId } : {});
  }

  async getAvailableIPs(serverId: number): Promise<string[]> {
    const data = await this.listIPs(serverId);
    return Object.values(data.ips)
      .filter(ip => ip.vpsid === null)
      .map(ip => ip.ip);
  }

  // ============ HELPER METHODS ============

  async testConnection(): Promise<boolean> {
    try {
      await this.listNodes();
      return true;
    } catch {
      return false;
    }
  }

  async provisionVPS(options: {
    userId: string;
    orderId: string;
    productConfig: {
      serverId: number;
      planId: number;
      osId: number;
      hostname: string;
      customRam?: number;
      customDisk?: number;
      customBandwidth?: number;
      customCpu?: number;
      numIps?: number;
    };
  }): Promise<{ vpsId: number; password: string; ips: string[] }> {
    const { productConfig } = options;

    // Generate random password
    const password = this.generatePassword(16);

    // Get available IPs
    const availableIps = await this.getAvailableIPs(productConfig.serverId);
    const numIps = productConfig.numIps || 1;
    
    if (availableIps.length < numIps) {
      throw new Error(`Not enough available IPs. Required: ${numIps}, Available: ${availableIps.length}`);
    }

    const assignedIps = availableIps.slice(0, numIps);

    // Create VPS
    const result = await this.createVPS({
      serid: productConfig.serverId,
      plid: productConfig.planId,
      osid: productConfig.osId,
      hostname: productConfig.hostname,
      rootpass: password,
      num_ips: numIps,
      ips: assignedIps,
      space: productConfig.customDisk,
      ram: productConfig.customRam,
      bandwidth: productConfig.customBandwidth,
      cpu: productConfig.customCpu,
    });

    return {
      vpsId: result.vpsid,
      password: result.rootpass || password,
      ips: assignedIps,
    };
  }

  private generatePassword(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

export default VirtualizorAPI;

// Singleton instance
let virtualizorInstance: VirtualizorAPI | null = null;

export const initVirtualizor = (config: VirtualizorConfig): VirtualizorAPI => {
  virtualizorInstance = new VirtualizorAPI(config);
  return virtualizorInstance;
};

export const getVirtualizor = (): VirtualizorAPI | null => {
  return virtualizorInstance;
};
