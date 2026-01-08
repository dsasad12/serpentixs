import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Server,
  FileText,
  MessageSquare,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Plus,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '../../stores';
import { useServices, useInvoices, useTickets } from '../../hooks';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const ClientDashboard = () => {
  const { user } = useAuthStore();
  
  // Usar hooks reales para obtener datos del backend
  const { services, loading: servicesLoading } = useServices({ limit: 3 });
  const { invoices, loading: invoicesLoading } = useInvoices({ limit: 3 });
  const { tickets, loading: ticketsLoading } = useTickets({ limit: 3 });

  // Calcular estadísticas desde datos reales
  const activeServicesCount = services.filter(s => s.status === 'ACTIVE').length;
  const pendingInvoicesCount = invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').length;
  const pendingInvoicesTotal = invoices
    .filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.total, 0);
  const openTicketsCount = tickets.filter(t => t.status !== 'CLOSED').length;

  const isLoading = servicesLoading || invoicesLoading || ticketsLoading;

  type ChangeType = 'increase' | 'decrease' | 'success' | 'neutral';
  
  const stats: Array<{
    title: string;
    value: string;
    change: string;
    changeType: ChangeType;
    icon: typeof Server;
    color: string;
    bgColor: string;
  }> = [
    {
      title: 'Servicios Activos',
      value: isLoading ? '...' : activeServicesCount.toString(),
      change: services.length > 0 ? `${services.length} total` : 'Sin servicios',
      changeType: 'increase',
      icon: Server,
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/20',
    },
    {
      title: 'Facturas Pendientes',
      value: isLoading ? '...' : pendingInvoicesCount.toString(),
      change: pendingInvoicesTotal > 0 ? `€${pendingInvoicesTotal.toFixed(2)}` : 'Al día',
      changeType: pendingInvoicesCount > 0 ? 'neutral' : 'success',
      icon: FileText,
      color: pendingInvoicesCount > 0 ? 'text-warning-400' : 'text-success-400',
      bgColor: pendingInvoicesCount > 0 ? 'bg-warning-500/20' : 'bg-success-500/20',
    },
    {
      title: 'Tickets Abiertos',
      value: isLoading ? '...' : openTicketsCount.toString(),
      change: openTicketsCount === 0 ? 'Todo resuelto' : `${openTicketsCount} pendiente${openTicketsCount > 1 ? 's' : ''}`,
      changeType: openTicketsCount === 0 ? 'success' : 'neutral',
      icon: MessageSquare,
      color: openTicketsCount === 0 ? 'text-success-400' : 'text-warning-400',
      bgColor: openTicketsCount === 0 ? 'bg-success-500/20' : 'bg-warning-500/20',
    },
    {
      title: 'Saldo de Cuenta',
      value: `€${(user?.balance || 0).toFixed(2)}`,
      change: user?.balance && user.balance > 0 ? 'Disponible' : 'Sin saldo',
      changeType: (user?.balance || 0) > 0 ? 'increase' : 'neutral',
      icon: CreditCard,
      color: 'text-accent-400',
      bgColor: 'bg-accent-500/20',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'primary'> = {
      ACTIVE: 'success',
      active: 'success',
      PENDING: 'warning',
      pending: 'warning',
      UNPAID: 'warning',
      PAID: 'success',
      paid: 'success',
      OVERDUE: 'danger',
      overdue: 'danger',
      OPEN: 'primary',
      open: 'primary',
      CLOSED: 'default' as 'success',
      closed: 'default' as 'success',
      SUSPENDED: 'danger',
      TERMINATED: 'danger',
    };
    return variants[status] || 'primary';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      ACTIVE: 'Activo',
      active: 'Activo',
      PENDING: 'Pendiente',
      pending: 'Pendiente',
      UNPAID: 'Sin Pagar',
      PAID: 'Pagada',
      paid: 'Pagada',
      OVERDUE: 'Vencida',
      overdue: 'Vencida',
      DRAFT: 'Borrador',
      OPEN: 'Abierto',
      open: 'Abierto',
      CLOSED: 'Cerrado',
      closed: 'Cerrado',
      ANSWERED: 'Respondido',
      CUSTOMER_REPLY: 'Respuesta Cliente',
      IN_PROGRESS: 'En Progreso',
      ON_HOLD: 'En Espera',
      SUSPENDED: 'Suspendido',
      TERMINATED: 'Terminado',
      CANCELLED: 'Cancelado',
    };
    return texts[status] || status;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Bienvenido, {user?.firstName}! 👋
          </h1>
          <p className="text-dark-400 mt-1">
            Aquí tienes un resumen de tu cuenta
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/services/game-hosting">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Nuevo Servicio
            </Button>
          </Link>
          <Link to="/client/add-funds">
            <Button variant="secondary" leftIcon={<CreditCard className="w-4 h-4" />}>
              Añadir Fondos
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-dark-400 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.changeType === 'increase' && (
                      <ArrowUpRight className="w-4 h-4 text-success-400" />
                    )}
                    {stat.changeType === 'decrease' && (
                      <ArrowDownRight className="w-4 h-4 text-danger-400" />
                    )}
                    {stat.changeType === 'success' && (
                      <CheckCircle className="w-4 h-4 text-success-400" />
                    )}
                    <span className={`text-sm ${
                      stat.changeType === 'increase' ? 'text-success-400' :
                      stat.changeType === 'decrease' ? 'text-danger-400' :
                      stat.changeType === 'success' ? 'text-success-400' :
                      'text-dark-400'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Services and Invoices */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Active Services */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Servicios Activos</CardTitle>
              <Link to="/client/services" className="text-primary-400 hover:text-primary-300 text-sm">
                Ver todos →
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {servicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-8 text-dark-400">
                  <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tienes servicios activos</p>
                  <Link to="/services" className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block">
                    Explorar servicios →
                  </Link>
                </div>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                        <Server className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{service.product?.name || service.domain || 'Servicio'}</p>
                        <p className="text-sm text-dark-400">{service.billingCycle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusBadge(service.status)} dot>
                        {getStatusText(service.status)}
                      </Badge>
                      <p className="text-sm text-dark-400 mt-1">
                        €{Number(service.price).toFixed(2)}/mes
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Invoices */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Facturas Recientes</CardTitle>
              <Link to="/client/invoices" className="text-primary-400 hover:text-primary-300 text-sm">
                Ver todas →
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-dark-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tienes facturas</p>
                </div>
              ) : (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        invoice.status === 'PAID' ? 'bg-success-500/20' : 'bg-warning-500/20'
                      }`}>
                        <FileText className={`w-5 h-5 ${
                          invoice.status === 'PAID' ? 'text-success-400' : 'text-warning-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{invoice.number}</p>
                        <p className="text-sm text-dark-400">
                          {invoice.items?.[0]?.description || 'Factura'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusBadge(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                      <p className="text-sm text-white font-medium mt-1">
                        €{Number(invoice.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                to="/client/tickets/new"
                className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Abrir Ticket</p>
                  <p className="text-sm text-dark-400">Contactar soporte</p>
                </div>
              </Link>
              <Link
                to="/client/add-funds"
                className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-success-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-success-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Añadir Fondos</p>
                  <p className="text-sm text-dark-400">Recargar saldo</p>
                </div>
              </Link>
              <Link
                to="/services/game-hosting"
                className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Nuevo Servicio</p>
                  <p className="text-sm text-dark-400">Explorar planes</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Tickets */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tickets Recientes</CardTitle>
              <Link to="/client/tickets" className="text-primary-400 hover:text-primary-300 text-sm">
                Ver todos →
              </Link>
            </CardHeader>
            <CardContent>
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-dark-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{ticket.subject}</p>
                          <p className="text-sm text-dark-400">
                            {ticket.department} • {ticket.id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={ticket.status === 'CLOSED' ? 'default' as any : 'primary'}>
                          {getStatusText(ticket.status)}
                        </Badge>
                        <p className="text-sm text-dark-400 mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(ticket.updatedAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-success-400 mx-auto mb-3" />
                  <p className="text-white font-medium">¡No tienes tickets abiertos!</p>
                  <p className="text-dark-400 text-sm">
                    Todos tus tickets han sido resueltos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ClientDashboard;
