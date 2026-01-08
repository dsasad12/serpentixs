import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Server,
  FileText,
  MessageSquare,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  RefreshCw,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ColorBox from '../../components/ui/ColorBox';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data
  const stats = [
    {
      title: 'Ingresos del Mes',
      value: '€12,450',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-success-400',
      bg: 'bg-success-500/20',
    },
    {
      title: 'Clientes Activos',
      value: '1,234',
      change: '+5.2%',
      trend: 'up',
      icon: Users,
      color: 'text-primary-400',
      bg: 'bg-primary-500/20',
    },
    {
      title: 'Servicios Activos',
      value: '2,847',
      change: '+8.1%',
      trend: 'up',
      icon: Server,
      color: 'text-accent-400',
      bg: 'bg-accent-500/20',
    },
    {
      title: 'Tickets Abiertos',
      value: '23',
      change: '-15.3%',
      trend: 'down',
      icon: MessageSquare,
      color: 'text-warning-400',
      bg: 'bg-warning-500/20',
    },
  ];

  const revenueData = [
    { name: 'Ene', ingresos: 8500, gastos: 3200 },
    { name: 'Feb', ingresos: 9200, gastos: 3400 },
    { name: 'Mar', ingresos: 8800, gastos: 3100 },
    { name: 'Abr', ingresos: 10500, gastos: 3600 },
    { name: 'May', ingresos: 11200, gastos: 3800 },
    { name: 'Jun', ingresos: 10800, gastos: 3500 },
    { name: 'Jul', ingresos: 12450, gastos: 4000 },
  ];

  const servicesByCategory = [
    { name: 'Game Hosting', value: 1200, color: '#8b5cf6' },
    { name: 'VPS', value: 800, color: '#d946ef' },
    { name: 'Web Hosting', value: 600, color: '#6366f1' },
    { name: 'Dedicados', value: 200, color: '#22c55e' },
    { name: 'Dominios', value: 47, color: '#f59e0b' },
  ];

  const recentOrders = [
    {
      id: '#ORD-001',
      client: 'Carlos García',
      product: 'Minecraft Server Pro',
      amount: '€9.99',
      status: 'completed',
      date: '2024-12-21',
    },
    {
      id: '#ORD-002',
      client: 'María López',
      product: 'VPS Business',
      amount: '€19.99',
      status: 'pending',
      date: '2024-12-21',
    },
    {
      id: '#ORD-003',
      client: 'Juan Martínez',
      product: 'Web Hosting Pro',
      amount: '€7.99',
      status: 'completed',
      date: '2024-12-20',
    },
    {
      id: '#ORD-004',
      client: 'Ana Sánchez',
      product: 'Servidor Dedicado',
      amount: '€89.99',
      status: 'processing',
      date: '2024-12-20',
    },
    {
      id: '#ORD-005',
      client: 'Pedro Ruiz',
      product: 'Dominio .com',
      amount: '€12.99',
      status: 'completed',
      date: '2024-12-19',
    },
  ];

  const recentTickets = [
    {
      id: '#TKT-001',
      client: 'Carlos García',
      subject: 'Problema con la conexión',
      priority: 'high',
      status: 'open',
      time: '2h',
    },
    {
      id: '#TKT-002',
      client: 'María López',
      subject: 'Solicitud de upgrade',
      priority: 'medium',
      status: 'answered',
      time: '4h',
    },
    {
      id: '#TKT-003',
      client: 'Juan Martínez',
      subject: 'Consulta de facturación',
      priority: 'low',
      status: 'open',
      time: '1d',
    },
  ];

  const getStatusBadge = (status: string): 'success' | 'warning' | 'primary' | 'default' => {
    const variants: Record<string, 'success' | 'warning' | 'primary' | 'default'> = {
      completed: 'success',
      pending: 'warning',
      processing: 'primary',
      open: 'warning',
      answered: 'success',
    };
    return variants[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      completed: 'Completado',
      pending: 'Pendiente',
      processing: 'Procesando',
      open: 'Abierto',
      answered: 'Respondido',
    };
    return texts[status] || status;
  };

  const getPriorityBadge = (priority: string): 'default' | 'warning' | 'danger' => {
    const variants: Record<string, 'default' | 'warning' | 'danger'> = {
      low: 'default',
      medium: 'warning',
      high: 'danger',
    };
    return variants[priority] || 'default';
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
          <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
          <p className="text-dark-400 mt-1">
            Bienvenido de nuevo, aquí tienes un resumen de tu negocio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-dark-800 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 días' : range === '30d' ? '30 días' : '90 días'}
              </button>
            ))}
          </div>
          <Button variant="secondary" leftIcon={<RefreshCw className="w-4 h-4" />}>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:border-primary-500/30 transition-colors">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-success-400' : 'text-danger-400'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-dark-400 text-sm">{stat.title}</h3>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ingresos vs Gastos</span>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorIngresos)"
                    name="Ingresos"
                  />
                  <Area
                    type="monotone"
                    dataKey="gastos"
                    stroke="#d946ef"
                    fillOpacity={1}
                    fill="url(#colorGastos)"
                    name="Gastos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Services by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={servicesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {servicesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {servicesByCategory.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ColorBox
                      color={item.color}
                      className="w-3 h-3 rounded-full"
                    />
                    <span className="text-dark-300 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pedidos Recientes</span>
              <Link to="/admin/orders">
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-800">
                    <th className="text-left p-4 text-dark-400 font-medium text-sm">Pedido</th>
                    <th className="text-left p-4 text-dark-400 font-medium text-sm">Cliente</th>
                    <th className="text-left p-4 text-dark-400 font-medium text-sm">Estado</th>
                    <th className="text-right p-4 text-dark-400 font-medium text-sm">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="table-row">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{order.id}</p>
                          <p className="text-dark-500 text-sm">{order.product}</p>
                        </div>
                      </td>
                      <td className="p-4 text-dark-300">{order.client}</td>
                      <td className="p-4">
                        <Badge variant={getStatusBadge(order.status)} size="sm">
                          {getStatusText(order.status)}
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-white font-medium">{order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tickets Recientes</span>
              <Link to="/admin/tickets">
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-dark-800">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 hover:bg-dark-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{ticket.subject}</span>
                        <Badge variant={getPriorityBadge(ticket.priority)} size="sm">
                          {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </div>
                      <p className="text-dark-500 text-sm mt-1">
                        {ticket.client} • {ticket.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadge(ticket.status)} size="sm">
                        {getStatusText(ticket.status)}
                      </Badge>
                      <span className="text-dark-500 text-sm">{ticket.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Nuevo Cliente', icon: Users, href: '/admin/clients/new' },
              { label: 'Nuevo Producto', icon: Server, href: '/admin/products/new' },
              { label: 'Crear Factura', icon: FileText, href: '/admin/invoices/new' },
              { label: 'Ver Tickets', icon: MessageSquare, href: '/admin/tickets' },
            ].map((action) => (
              <Link key={action.label} to={action.href}>
                <button className="w-full p-4 bg-dark-800/50 hover:bg-dark-800 border border-dark-700 hover:border-primary-500/50 rounded-xl transition-all group">
                  <action.icon className="w-6 h-6 text-dark-400 group-hover:text-primary-400 mx-auto mb-2 transition-colors" />
                  <span className="text-dark-300 group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                </button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminDashboard;
