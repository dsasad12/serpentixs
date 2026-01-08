import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Server,
  Globe,
  HardDrive,
  Gamepad2,
  ExternalLink,
  MoreVertical,
  Power,
  RefreshCw,
  Settings,
  Copy,
  CheckCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from '../../components/ui/Toast';

interface Service {
  id: string;
  name: string;
  type: string;
  category: 'game-hosting' | 'web-hosting' | 'vps' | 'dedicated';
  status: 'active' | 'pending' | 'suspended' | 'cancelled';
  ip: string;
  port?: number;
  domain?: string;
  nextDue: string;
  price: number;
  billingCycle: string;
  specs: {
    ram?: string;
    cpu?: string;
    storage?: string;
    players?: number;
  };
}

const ClientServices = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mock services data
  const services: Service[] = [
    {
      id: '1',
      name: 'Minecraft Server Pro',
      type: 'Minecraft Server',
      category: 'game-hosting',
      status: 'active',
      ip: 'mc1.serpentixspay.com',
      port: 25565,
      nextDue: '2025-01-15',
      price: 9.99,
      billingCycle: 'Mensual',
      specs: {
        ram: '6GB',
        cpu: '2 vCore',
        storage: '30GB NVMe',
        players: 50,
      },
    },
    {
      id: '2',
      name: 'VPS Business',
      type: 'VPS Linux',
      category: 'vps',
      status: 'active',
      ip: '185.199.108.153',
      nextDue: '2025-01-20',
      price: 19.99,
      billingCycle: 'Mensual',
      specs: {
        ram: '8GB',
        cpu: '4 vCore',
        storage: '160GB NVMe',
      },
    },
    {
      id: '3',
      name: 'Mi Web Personal',
      type: 'Web Hosting Business',
      category: 'web-hosting',
      status: 'active',
      ip: 'web1.serpentixspay.com',
      domain: 'miweb.com',
      nextDue: '2025-02-01',
      price: 7.99,
      billingCycle: 'Mensual',
      specs: {
        storage: '50GB NVMe',
      },
    },
  ];

  const getCategoryIcon = (category: string) => {
    const icons = {
      'game-hosting': Gamepad2,
      'web-hosting': Globe,
      'vps': Server,
      'dedicated': HardDrive,
    };
    return icons[category as keyof typeof icons] || Server;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'game-hosting': 'from-green-500 to-emerald-600',
      'web-hosting': 'from-blue-500 to-cyan-600',
      'vps': 'from-purple-500 to-violet-600',
      'dedicated': 'from-orange-500 to-red-600',
    };
    return colors[category as keyof typeof colors] || 'from-primary-500 to-primary-600';
  };

  const getStatusBadge = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      active: 'success',
      pending: 'warning',
      suspended: 'danger',
      cancelled: 'default',
    };
    return variants[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: 'Activo',
      pending: 'Pendiente',
      suspended: 'Suspendido',
      cancelled: 'Cancelado',
    };
    return texts[status] || status;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('¡Copiado!', 'IP copiada al portapapeles');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredServices = services.filter(
    (service) => filter === 'all' || service.status === filter
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Mis Servicios</h1>
          <p className="text-dark-400 mt-1">
            Gestiona todos tus servicios activos
          </p>
        </div>
        <Link to="/services/game-hosting">
          <Button variant="primary">
            Contratar Nuevo Servicio
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'active', label: 'Activos' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'suspended', label: 'Suspendidos' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => {
            const Icon = getCategoryIcon(service.category);
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <CardContent className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getCategoryColor(service.category)} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(service.status)} dot>
                          {getStatusText(service.status)}
                        </Badge>
                        <button aria-label="Más opciones" className="p-1 text-dark-400 hover:text-white transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-grow">
                      <h3 className="font-semibold text-white text-lg mb-1">{service.name}</h3>
                      <p className="text-dark-400 text-sm mb-4">{service.type}</p>

                      {/* IP / Domain */}
                      <div className="p-3 bg-dark-800/50 rounded-lg mb-4">
                        <p className="text-xs text-dark-500 mb-1">
                          {service.domain ? 'Dominio' : 'Dirección IP'}
                        </p>
                        <div className="flex items-center justify-between">
                          <code className="text-primary-400 text-sm">
                            {service.domain || `${service.ip}${service.port ? `:${service.port}` : ''}`}
                          </code>
                          <button
                            onClick={() => copyToClipboard(
                              service.domain || `${service.ip}${service.port ? `:${service.port}` : ''}`,
                              service.id
                            )}
                            className="p-1 text-dark-400 hover:text-white transition-colors"
                          >
                            {copiedId === service.id ? (
                              <CheckCircle className="w-4 h-4 text-success-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {service.specs.ram && (
                          <div className="text-sm">
                            <span className="text-dark-500">RAM:</span>{' '}
                            <span className="text-white">{service.specs.ram}</span>
                          </div>
                        )}
                        {service.specs.cpu && (
                          <div className="text-sm">
                            <span className="text-dark-500">CPU:</span>{' '}
                            <span className="text-white">{service.specs.cpu}</span>
                          </div>
                        )}
                        {service.specs.storage && (
                          <div className="text-sm">
                            <span className="text-dark-500">Almacenamiento:</span>{' '}
                            <span className="text-white">{service.specs.storage}</span>
                          </div>
                        )}
                        {service.specs.players && (
                          <div className="text-sm">
                            <span className="text-dark-500">Jugadores:</span>{' '}
                            <span className="text-white">{service.specs.players}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-dark-800">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-dark-500">Próximo pago</p>
                          <p className="text-white font-medium">{service.nextDue}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-dark-500">{service.billingCycle}</p>
                          <p className="text-white font-medium">€{service.price.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" className="flex-1">
                          <Settings className="w-4 h-4" />
                          Gestionar
                        </Button>
                        <button aria-label="Encender/Apagar servicio" className="p-2 bg-dark-800 rounded-lg text-dark-400 hover:text-success-400 transition-colors">
                          <Power className="w-4 h-4" />
                        </button>
                        <button aria-label="Reiniciar servicio" className="p-2 bg-dark-800 rounded-lg text-dark-400 hover:text-primary-400 transition-colors">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button aria-label="Abrir panel externo" className="p-2 bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Server className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay servicios
            </h3>
            <p className="text-dark-400 mb-6">
              No tienes servicios que coincidan con el filtro seleccionado
            </p>
            <Link to="/services/game-hosting">
              <Button variant="primary">
                Contratar Servicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default ClientServices;
