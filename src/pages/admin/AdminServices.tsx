import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  DollarSign,
  Gamepad2,
  Globe,
  HardDrive,
  AtSign,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

interface Service {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  product: string;
  category: 'game-hosting' | 'web-hosting' | 'vps' | 'dedicated' | 'domains';
  status: 'active' | 'suspended' | 'cancelled' | 'pending';
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'annually';
  nextDueDate: string;
  createdAt: string;
  ip?: string;
}

const AdminServices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'game-hosting': <Gamepad2 className="w-5 h-5" />,
      'web-hosting': <Globe className="w-5 h-5" />,
      vps: <Server className="w-5 h-5" />,
      dedicated: <HardDrive className="w-5 h-5" />,
      domains: <AtSign className="w-5 h-5" />,
    };
    return icons[category] || <Server className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      active: 'success',
      suspended: 'warning',
      cancelled: 'danger',
      pending: 'default',
    };
    const labels: Record<string, string> = {
      active: 'Activo',
      suspended: 'Suspendido',
      cancelled: 'Cancelado',
      pending: 'Pendiente',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  // Mock data
  const services: Service[] = [
    {
      id: '1',
      name: 'Minecraft Server Pro',
      clientName: 'Carlos García',
      clientEmail: 'carlos@example.com',
      product: 'Minecraft Server - Premium',
      category: 'game-hosting',
      status: 'active',
      price: 24.99,
      billingCycle: 'monthly',
      nextDueDate: '2025-01-15',
      createdAt: '2024-06-15',
      ip: '192.168.1.100:25565',
    },
    {
      id: '2',
      name: 'WordPress Hosting',
      clientName: 'María López',
      clientEmail: 'maria@example.com',
      product: 'Web Hosting - Business',
      category: 'web-hosting',
      status: 'active',
      price: 9.99,
      billingCycle: 'annually',
      nextDueDate: '2025-06-20',
      createdAt: '2024-06-20',
    },
    {
      id: '3',
      name: 'VPS Linux 4GB',
      clientName: 'Pedro Martínez',
      clientEmail: 'pedro@example.com',
      product: 'VPS - 4GB RAM',
      category: 'vps',
      status: 'suspended',
      price: 19.99,
      billingCycle: 'monthly',
      nextDueDate: '2024-12-10',
      createdAt: '2024-03-10',
      ip: '45.67.89.101',
    },
    {
      id: '4',
      name: 'Dedicated Server E5',
      clientName: 'Tech Solutions SL',
      clientEmail: 'admin@techsolutions.com',
      product: 'Dedicated - Intel Xeon E5',
      category: 'dedicated',
      status: 'active',
      price: 149.99,
      billingCycle: 'monthly',
      nextDueDate: '2025-01-05',
      createdAt: '2024-01-05',
      ip: '203.45.67.89',
    },
    {
      id: '5',
      name: 'example.com',
      clientName: 'Ana Rodríguez',
      clientEmail: 'ana@example.com',
      product: 'Domain - .com',
      category: 'domains',
      status: 'pending',
      price: 12.99,
      billingCycle: 'annually',
      nextDueDate: '2025-12-01',
      createdAt: '2024-12-01',
    },
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSuspend = (service: Service) => {
    console.log('Suspending service:', service.id);
    // API call to suspend service
  };

  const handleActivate = (service: Service) => {
    console.log('Activating service:', service.id);
    // API call to activate service
  };

  const handleDelete = () => {
    if (selectedService) {
      console.log('Deleting service:', selectedService.id);
      // API call to delete service
      setShowDeleteModal(false);
      setSelectedService(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Servicios</h1>
          <p className="text-dark-400 mt-1">Gestiona todos los servicios de tus clientes</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos los estados' },
                { value: 'active', label: 'Activo' },
                { value: 'suspended', label: 'Suspendido' },
                { value: 'cancelled', label: 'Cancelado' },
                { value: 'pending', label: 'Pendiente' },
              ]}
              className="w-full md:w-48"
            />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todas las categorías' },
                { value: 'game-hosting', label: 'Game Hosting' },
                { value: 'web-hosting', label: 'Web Hosting' },
                { value: 'vps', label: 'VPS' },
                { value: 'dedicated', label: 'Dedicados' },
                { value: 'domains', label: 'Dominios' },
              ]}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800">
                  <th className="text-left p-4 text-dark-400 font-medium">Servicio</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Cliente</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Estado</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Precio</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Próximo Pago</th>
                  <th className="text-right p-4 text-dark-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <motion.tr
                    key={service.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400">
                          {getCategoryIcon(service.category)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{service.name}</p>
                          <p className="text-sm text-dark-400">{service.product}</p>
                          {service.ip && (
                            <p className="text-xs text-dark-500 font-mono">{service.ip}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-dark-400" />
                        <div>
                          <p className="text-white">{service.clientName}</p>
                          <p className="text-sm text-dark-400">{service.clientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(service.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-dark-400" />
                        <span className="text-white font-medium">€{service.price.toFixed(2)}</span>
                        <span className="text-dark-500 text-sm">/{service.billingCycle === 'monthly' ? 'mes' : service.billingCycle === 'quarterly' ? 'trim' : 'año'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-dark-300">
                        <Calendar className="w-4 h-4" />
                        {new Date(service.nextDueDate).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-dark-400 hover:text-white"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-dark-400 hover:text-white"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {service.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-warning-400 hover:text-warning-300"
                            onClick={() => handleSuspend(service)}
                            title="Suspender"
                          >
                            <PowerOff className="w-4 h-4" />
                          </Button>
                        ) : service.status === 'suspended' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-success-400 hover:text-success-300"
                            onClick={() => handleActivate(service)}
                            title="Activar"
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error-400 hover:text-error-300"
                          onClick={() => {
                            setSelectedService(service);
                            setShowDeleteModal(true);
                          }}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-dark-800">
            <p className="text-dark-400 text-sm">
              Mostrando {filteredServices.length} de {services.length} servicios
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-dark-300 px-3">Página {currentPage}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-500/20 flex items-center justify-center">
                <Power className="w-5 h-5 text-success-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {services.filter((s) => s.status === 'active').length}
                </p>
                <p className="text-dark-400 text-sm">Servicios Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-500/20 flex items-center justify-center">
                <PowerOff className="w-5 h-5 text-warning-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {services.filter((s) => s.status === 'suspended').length}
                </p>
                <p className="text-dark-400 text-sm">Suspendidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {services.filter((s) => s.status === 'pending').length}
                </p>
                <p className="text-dark-400 text-sm">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  €{services.filter((s) => s.status === 'active').reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                </p>
                <p className="text-dark-400 text-sm">Ingresos Mensuales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Servicio"
      >
        <div className="space-y-4">
          <p className="text-dark-300">
            ¿Estás seguro de que deseas eliminar el servicio{' '}
            <span className="text-white font-medium">{selectedService?.name}</span>?
          </p>
          <p className="text-dark-400 text-sm">
            Esta acción no se puede deshacer. El servicio será cancelado permanentemente.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" className="bg-error-600 hover:bg-error-500" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminServices;
