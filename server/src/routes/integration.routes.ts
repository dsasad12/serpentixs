import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// PTERODACTYL INTEGRATION
// ============================================

interface PterodactylConfig {
  panelUrl: string;
  apiKey: string;
  clientApiKey?: string;
}

const getPterodactylConfig = (): PterodactylConfig => ({
  panelUrl: process.env.PTERODACTYL_URL || '',
  apiKey: process.env.PTERODACTYL_API_KEY || '',
  clientApiKey: process.env.PTERODACTYL_CLIENT_API_KEY,
});

// Create user in Pterodactyl
async function createPterodactylUser(userData: { 
  email: string; 
  username: string; 
  firstName: string; 
  lastName: string;
}) {
  const config = getPterodactylConfig();
  
  const response = await fetch(`${config.panelUrl}/api/application/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userData.email,
      username: userData.username,
      first_name: userData.firstName,
      last_name: userData.lastName,
    }),
  });

  if (!response.ok) {
    const error = await response.json() as { errors?: Array<{ detail?: string }> };
    throw new Error(error.errors?.[0]?.detail || 'Error creating Pterodactyl user');
  }

  return response.json();
}

// Create server in Pterodactyl
async function createPterodactylServer(serverData: {
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
  allocation?: {
    default: number;
  };
  deploy?: {
    locations: number[];
    dedicatedIp: boolean;
    portRange: string[];
  };
}) {
  const config = getPterodactylConfig();
  
  const response = await fetch(`${config.panelUrl}/api/application/servers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
    }),
  });

  if (!response.ok) {
    const error = await response.json() as { errors?: Array<{ detail?: string }> };
    throw new Error(error.errors?.[0]?.detail || 'Error creating Pterodactyl server');
  }

  return response.json();
}

// Suspend server in Pterodactyl
async function suspendPterodactylServer(serverId: number) {
  const config = getPterodactylConfig();
  
  const response = await fetch(`${config.panelUrl}/api/application/servers/${serverId}/suspend`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error suspending server');
  }

  return true;
}

// Unsuspend server in Pterodactyl
async function unsuspendPterodactylServer(serverId: number) {
  const config = getPterodactylConfig();
  
  const response = await fetch(`${config.panelUrl}/api/application/servers/${serverId}/unsuspend`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error unsuspending server');
  }

  return true;
}

// Delete server in Pterodactyl
async function deletePterodactylServer(serverId: number, force = false) {
  const config = getPterodactylConfig();
  
  const endpoint = force 
    ? `${config.panelUrl}/api/application/servers/${serverId}/force`
    : `${config.panelUrl}/api/application/servers/${serverId}`;
  
  const response = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error deleting server');
  }

  return true;
}

// API Routes for Pterodactyl
router.get('/pterodactyl/test', async (req: Request, res: Response) => {
  try {
    const config = getPterodactylConfig();
    
    if (!config.panelUrl || !config.apiKey) {
      return res.json({ success: false, error: 'Pterodactyl no configurado' });
    }

    const response = await fetch(`${config.panelUrl}/api/application/nodes`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      res.json({ success: true, message: 'Conexión exitosa con Pterodactyl' });
    } else {
      res.json({ success: false, error: 'Error de autenticación con Pterodactyl' });
    }
  } catch (error) {
    res.json({ success: false, error: 'No se pudo conectar con Pterodactyl' });
  }
});

router.get('/pterodactyl/nodes', async (req: Request, res: Response) => {
  try {
    const config = getPterodactylConfig();
    
    const response = await fetch(`${config.panelUrl}/api/application/nodes`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json() as { data: unknown };
    res.json({ success: true, data: data.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener nodos' });
  }
});

router.get('/pterodactyl/eggs/:nestId', async (req: Request, res: Response) => {
  try {
    const config = getPterodactylConfig();
    const { nestId } = req.params;
    
    const response = await fetch(`${config.panelUrl}/api/application/nests/${nestId}/eggs`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json() as { data: unknown };
    res.json({ success: true, data: data.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener eggs' });
  }
});

// Provision game server (called after payment)
router.post('/pterodactyl/provision', async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.body;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { user: true, product: true },
    });

    if (!service) {
      return res.status(404).json({ success: false, error: 'Servicio no encontrado' });
    }

    // Get server configuration from product
    const serverConfig = service.product.features as {
      nestId: number;
      eggId: number;
      dockerImage: string;
      startup: string;
      environment: Record<string, string>;
      memory: number;
      disk: number;
      cpu: number;
    };

    // Create or get Pterodactyl user
    let pterodactylUserId: number;
    try {
      const userResponse = await createPterodactylUser({
        email: service.user.email,
        username: service.user.email.split('@')[0],
        firstName: service.user.firstName,
        lastName: service.user.lastName,
      }) as { attributes: { id: number } };
      pterodactylUserId = userResponse.attributes.id;
    } catch (error: unknown) {
      // User might already exist, try to find them
      const config = getPterodactylConfig();
      const findResponse = await fetch(
        `${config.panelUrl}/api/application/users?filter[email]=${service.user.email}`,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Accept': 'application/json',
          },
        }
      );
      const findData = await findResponse.json() as { data: Array<{ attributes: { id: number } }> };
      if (findData.data.length > 0) {
        pterodactylUserId = findData.data[0].attributes.id;
      } else {
        throw error;
      }
    }

    // Create server
    const serverResponse = await createPterodactylServer({
      name: service.name || `Server-${service.id.slice(0, 8)}`,
      userId: pterodactylUserId,
      nestId: serverConfig.nestId,
      eggId: serverConfig.eggId,
      dockerImage: serverConfig.dockerImage,
      startup: serverConfig.startup,
      environment: serverConfig.environment,
      limits: {
        memory: serverConfig.memory,
        swap: 0,
        disk: serverConfig.disk,
        io: 500,
        cpu: serverConfig.cpu,
      },
      featureLimits: {
        databases: 1,
        backups: 2,
        allocations: 1,
      },
      deploy: {
        locations: [1],
        dedicatedIp: false,
        portRange: [],
      },
    }) as { attributes: { id: number; [key: string]: unknown } };

    // Update service with server info
    await prisma.service.update({
      where: { id: service.id },
      data: {
        serverId: serverResponse.attributes.id.toString(),
        serverData: serverResponse.attributes as Prisma.InputJsonValue,
        status: 'ACTIVE',
      },
    });

    res.json({ success: true, data: serverResponse.attributes });
  } catch (error) {
    console.error('Pterodactyl provision error:', error);
    res.status(500).json({ success: false, error: 'Error al provisionar servidor' });
  }
});

// ============================================
// VIRTUALIZOR INTEGRATION
// ============================================

interface VirtualizorConfig {
  host: string;
  port: number;
  apiKey: string;
  apiPass: string;
  ssl: boolean;
}

const getVirtualizorConfig = (): VirtualizorConfig => ({
  host: process.env.VIRTUALIZOR_HOST || '',
  port: parseInt(process.env.VIRTUALIZOR_PORT || '4085'),
  apiKey: process.env.VIRTUALIZOR_API_KEY || '',
  apiPass: process.env.VIRTUALIZOR_API_PASS || '',
  ssl: process.env.VIRTUALIZOR_SSL === 'true',
});

// Virtualizor response interface
interface VirtualizorResponse {
  error?: string;
  servers?: unknown;
  ostemplates?: unknown;
  plans?: unknown;
  vpsid?: number;
  ip?: string;
  [key: string]: unknown;
}

async function virtualizorRequest(action: string, params: Record<string, unknown> = {}): Promise<VirtualizorResponse> {
  const config = getVirtualizorConfig();
  const protocol = config.ssl ? 'https' : 'http';
  const url = new URL(`${protocol}://${config.host}:${config.port}/index.php`);
  
  url.searchParams.set('act', action);
  url.searchParams.set('api', 'json');
  url.searchParams.set('apikey', config.apiKey);
  url.searchParams.set('apipass', config.apiPass);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString());
  return response.json() as Promise<VirtualizorResponse>;
}

// Create VPS in Virtualizor
async function createVirtualizorVPS(vpsData: {
  hostname: string;
  rootPassword: string;
  osId: number;
  planId?: number;
  serverId: number;
  userId?: number;
  ram: number;
  disk: number;
  bandwidth: number;
  cpuCores: number;
  ips: number;
}): Promise<VirtualizorResponse> {
  return virtualizorRequest('addvs', {
    hostname: vpsData.hostname,
    rootpass: vpsData.rootPassword,
    osid: vpsData.osId,
    plid: vpsData.planId,
    serid: vpsData.serverId,
    uid: vpsData.userId,
    ram: vpsData.ram,
    space: vpsData.disk,
    bandwidth: vpsData.bandwidth,
    cpu: vpsData.cpuCores,
    num_ips: vpsData.ips,
  });
}

// Suspend VPS in Virtualizor
async function suspendVirtualizorVPS(vpsId: number): Promise<VirtualizorResponse> {
  return virtualizorRequest('vs', {
    vpsid: vpsId,
    suspend: 1,
  });
}

// Unsuspend VPS in Virtualizor
async function unsuspendVirtualizorVPS(vpsId: number): Promise<VirtualizorResponse> {
  return virtualizorRequest('vs', {
    vpsid: vpsId,
    unsuspend: 1,
  });
}

// Delete VPS in Virtualizor
async function deleteVirtualizorVPS(vpsId: number): Promise<VirtualizorResponse> {
  return virtualizorRequest('vs', {
    vpsid: vpsId,
    delete: 1,
  });
}

// API Routes for Virtualizor
router.get('/virtualizor/test', async (req: Request, res: Response) => {
  try {
    const config = getVirtualizorConfig();
    
    if (!config.host || !config.apiKey || !config.apiPass) {
      return res.json({ success: false, error: 'Virtualizor no configurado' });
    }

    const result = await virtualizorRequest('vs');
    
    if (result.error) {
      res.json({ success: false, error: result.error });
    } else {
      res.json({ success: true, message: 'Conexión exitosa con Virtualizor' });
    }
  } catch (error) {
    res.json({ success: false, error: 'No se pudo conectar con Virtualizor' });
  }
});

router.get('/virtualizor/servers', async (req: Request, res: Response) => {
  try {
    const result = await virtualizorRequest('servers');
    res.json({ success: true, data: result.servers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener servidores' });
  }
});

router.get('/virtualizor/ostemplates/:serverId', async (req: Request, res: Response) => {
  try {
    const { serverId } = req.params;
    const result = await virtualizorRequest('ostemplates', { serid: serverId });
    res.json({ success: true, data: result.ostemplates });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener templates' });
  }
});

router.get('/virtualizor/plans', async (req: Request, res: Response) => {
  try {
    const result = await virtualizorRequest('plans');
    res.json({ success: true, data: result.plans });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener planes' });
  }
});

// Provision VPS (called after payment)
router.post('/virtualizor/provision', async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.body;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { user: true, product: true },
    });

    if (!service) {
      return res.status(404).json({ success: false, error: 'Servicio no encontrado' });
    }

    // Get VPS configuration from product
    const vpsConfig = service.product.features as {
      serverId: number;
      osId: number;
      planId?: number;
      ram: number;
      disk: number;
      bandwidth: number;
      cpuCores: number;
    };

    // Generate random password
    const rootPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);

    // Create VPS
    const result = await createVirtualizorVPS({
      hostname: service.domain || `vps-${service.id.slice(0, 8)}.serpentix.com`,
      rootPassword,
      osId: vpsConfig.osId,
      planId: vpsConfig.planId,
      serverId: vpsConfig.serverId,
      ram: vpsConfig.ram,
      disk: vpsConfig.disk,
      bandwidth: vpsConfig.bandwidth,
      cpuCores: vpsConfig.cpuCores,
      ips: 1,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    // Update service with VPS info
    await prisma.service.update({
      where: { id: service.id },
      data: {
        serverId: result.vpsid?.toString(),
        serverData: {
          vpsid: result.vpsid,
          ip: result.ip,
          rootPassword, // Store encrypted in production
        },
        status: 'ACTIVE',
      },
    });

    res.json({ success: true, data: { vpsId: result.vpsid, ip: result.ip } });
  } catch (error) {
    console.error('Virtualizor provision error:', error);
    res.status(500).json({ success: false, error: 'Error al provisionar VPS' });
  }
});

// ============================================
// SERVICE LIFECYCLE MANAGEMENT
// ============================================

// Suspend service (called when invoice is overdue)
router.post('/service/suspend', async (req: Request, res: Response) => {
  try {
    const { serviceId, reason } = req.body;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { product: { include: { category: true } } },
    });

    if (!service || !service.serverId) {
      return res.status(404).json({ success: false, error: 'Servicio no encontrado' });
    }

    const categorySlug = service.product.category.slug;

    // Determine which integration to use based on category
    if (['game-hosting', 'minecraft', 'rust', 'ark'].includes(categorySlug)) {
      await suspendPterodactylServer(parseInt(service.serverId));
    } else if (['vps', 'dedicated', 'cloud'].includes(categorySlug)) {
      await suspendVirtualizorVPS(parseInt(service.serverId));
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: { status: 'SUSPENDED', suspendReason: reason },
    });

    res.json({ success: true, message: 'Servicio suspendido' });
  } catch (error) {
    console.error('Service suspend error:', error);
    res.status(500).json({ success: false, error: 'Error al suspender servicio' });
  }
});

// Unsuspend service (called when invoice is paid)
router.post('/service/unsuspend', async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.body;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { product: { include: { category: true } } },
    });

    if (!service || !service.serverId) {
      return res.status(404).json({ success: false, error: 'Servicio no encontrado' });
    }

    const categorySlug = service.product.category.slug;

    if (['game-hosting', 'minecraft', 'rust', 'ark'].includes(categorySlug)) {
      await unsuspendPterodactylServer(parseInt(service.serverId));
    } else if (['vps', 'dedicated', 'cloud'].includes(categorySlug)) {
      await unsuspendVirtualizorVPS(parseInt(service.serverId));
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: { status: 'ACTIVE', suspendReason: null },
    });

    res.json({ success: true, message: 'Servicio reactivado' });
  } catch (error) {
    console.error('Service unsuspend error:', error);
    res.status(500).json({ success: false, error: 'Error al reactivar servicio' });
  }
});

// Terminate service (called after grace period)
router.post('/service/terminate', async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.body;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { product: { include: { category: true } } },
    });

    if (!service || !service.serverId) {
      return res.status(404).json({ success: false, error: 'Servicio no encontrado' });
    }

    const categorySlug = service.product.category.slug;

    if (['game-hosting', 'minecraft', 'rust', 'ark'].includes(categorySlug)) {
      await deletePterodactylServer(parseInt(service.serverId));
    } else if (['vps', 'dedicated', 'cloud'].includes(categorySlug)) {
      await deleteVirtualizorVPS(parseInt(service.serverId));
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: { 
        status: 'TERMINATED', 
        terminationDate: new Date(),
        serverId: null,
        serverData: Prisma.JsonNull,
      },
    });

    res.json({ success: true, message: 'Servicio terminado' });
  } catch (error) {
    console.error('Service terminate error:', error);
    res.status(500).json({ success: false, error: 'Error al terminar servicio' });
  }
});

export default router;
