import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Server,
  Eye,
  Edit,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'active' | 'inactive' | 'suspended';
  servicesCount: number;
  totalSpent: number;
  createdAt: string;
  lastLogin: string;
}

const AdminClients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock clients data
  const clients: Client[] = [
    {
      id: '1',
      name: 'Carlos García',
      email: 'carlos@example.com',
      phone: '+34 612 345 678',
      company: 'Tech Solutions SL',
      status: 'active',
      servicesCount: 5,
      totalSpent: 1250.50,
      createdAt: '2024-01-15',
      lastLogin: '2024-12-21 10:30',
    },
    {
      id: '2',
      name: 'María López',
      email: 'maria@example.com',
      phone: '+34 623 456 789',
      status: 'active',
      servicesCount: 3,
      totalSpent: 890.00,
      createdAt: '2024-02-20',
      lastLogin: '2024-12-20 15:45',
    },
    {
      id: '3',
      name: 'Juan Martínez',
      email: 'juan@example.com',
      phone: '+34 634 567 890',
      company: 'WebDev Agency',
      status: 'active',
      servicesCount: 8,
      totalSpent: 2340.75,
      createdAt: '2023-11-05',
      lastLogin: '2024-12-21 09:15',
    },
    {
      id: '4',
      name: 'Ana Sánchez',
      email: 'ana@example.com',
      phone: '+34 645 678 901',
      status: 'inactive',
      servicesCount: 0,
      totalSpent: 150.00,
      createdAt: '2024-06-10',
      lastLogin: '2024-10-15 12:00',
    },
    {
      id: '5',
      name: 'Pedro Ruiz',
      email: 'pedro@example.com',
      phone: '+34 656 789 012',
      company: 'Gaming Studio',
      status: 'suspended',
      servicesCount: 2,
      totalSpent: 450.00,
      createdAt: '2024-03-25',
      lastLogin: '2024-11-30 18:20',
    },
    {
      id: '6',
      name: 'Laura Fernández',
      email: 'laura@example.com',
      phone: '+34 667 890 123',
      status: 'active',
      servicesCount: 4,
      totalSpent: 980.25,
      createdAt: '2024-04-12',
      lastLogin: '2024-12-20 20:10',
    },
  ];

  const getStatusBadge = (status: string): 'success' | 'warning' | 'danger' => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      active: 'success',
      inactive: 'warning',
      suspended: 'danger',
    };
    return variants[status] || 'default' as 'success';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
    };
    return texts[status] || status;
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === 'active').length,
    inactive: clients.filter((c) => c.status === 'inactive').length,
    suspended: clients.filter((c) => c.status === 'suspended').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Clientes</h1>
          <p className="text-dark-400 mt-1">
            Gestiona todos los clientes de la plataforma
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
            Exportar
          </Button>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Total</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-success-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Activos</p>
              <p className="text-xl font-bold text-white">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-warning-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Inactivos</p>
              <p className="text-xl font-bold text-white">{stats.inactive}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-danger-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-danger-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Suspendidos</p>
              <p className="text-xl font-bold text-white">{stats.suspended}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'active', label: 'Activos' },
              { value: 'inactive', label: 'Inactivos' },
              { value: 'suspended', label: 'Suspendidos' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48"
          />
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800">
                  <th className="text-left p-4 text-dark-400 font-medium">Cliente</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Contacto</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Estado</th>
                  <th className="text-center p-4 text-dark-400 font-medium">Servicios</th>
                  <th className="text-right p-4 text-dark-400 font-medium">Total Gastado</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Último Acceso</th>
                  <th className="text-right p-4 text-dark-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="table-row">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                          <span className="text-primary-400 font-medium">
                            {client.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{client.name}</p>
                          {client.company && (
                            <p className="text-dark-500 text-sm">{client.company}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-dark-300">{client.email}</p>
                        <p className="text-dark-500 text-sm">{client.phone}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusBadge(client.status)}>
                        {getStatusText(client.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-white font-medium">{client.servicesCount}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-white font-medium">€{client.totalSpent.toFixed(2)}</span>
                    </td>
                    <td className="p-4 text-dark-300">{client.lastLogin}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-dark-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-dark-800">
            <p className="text-dark-400 text-sm">
              Mostrando {filteredClients.length} de {clients.length} clientes
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                aria-label="Página anterior"
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors disabled:opacity-50"
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Ir a página ${page}`}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                aria-label="Página siguiente"
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Detail Modal */}
      <Modal
        isOpen={!!selectedClient && !showDeleteModal}
        onClose={() => setSelectedClient(null)}
        title="Detalles del Cliente"
        size="lg"
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Client Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
                <span className="text-2xl text-primary-400 font-bold">
                  {selectedClient.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedClient.name}</h3>
                {selectedClient.company && (
                  <p className="text-dark-400">{selectedClient.company}</p>
                )}
                <Badge variant={getStatusBadge(selectedClient.status)} className="mt-1">
                  {getStatusText(selectedClient.status)}
                </Badge>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-dark-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-dark-400" />
                <div>
                  <p className="text-dark-500 text-sm">Email</p>
                  <p className="text-white">{selectedClient.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-dark-400" />
                <div>
                  <p className="text-dark-500 text-sm">Teléfono</p>
                  <p className="text-white">{selectedClient.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-dark-400" />
                <div>
                  <p className="text-dark-500 text-sm">Cliente desde</p>
                  <p className="text-white">{selectedClient.createdAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-dark-400" />
                <div>
                  <p className="text-dark-500 text-sm">Total gastado</p>
                  <p className="text-white">€{selectedClient.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Server className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-dark-400 text-sm">Servicios</p>
                    <p className="text-2xl font-bold text-white">{selectedClient.servicesCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-success-400" />
                  </div>
                  <div>
                    <p className="text-dark-400 text-sm">Total Gastado</p>
                    <p className="text-2xl font-bold text-white">€{selectedClient.totalSpent.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-dark-800">
              <Button variant="secondary" className="flex-1">
                Ver Servicios
              </Button>
              <Button variant="secondary" className="flex-1">
                Ver Facturas
              </Button>
              <Button variant="primary" className="flex-1">
                Editar Cliente
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedClient(null);
        }}
        title="Eliminar Cliente"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-dark-300">
            ¿Estás seguro de que deseas eliminar al cliente{' '}
            <span className="text-white font-medium">{selectedClient?.name}</span>?
          </p>
          <p className="text-dark-500 text-sm">
            Esta acción no se puede deshacer. Todos los datos asociados al cliente serán eliminados permanentemente.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedClient(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1">
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminClients;
