import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Paperclip,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  clientName: string;
  clientEmail: string;
  department: 'technical' | 'billing' | 'sales' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'waiting' | 'closed';
  createdAt: string;
  lastReply: string;
  messages: {
    id: string;
    sender: string;
    senderType: 'client' | 'staff';
    message: string;
    createdAt: string;
  }[];
}

const AdminTickets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      open: 'warning',
      'in-progress': 'default',
      waiting: 'warning',
      closed: 'success',
    };
    const labels: Record<string, string> = {
      open: 'Abierto',
      'in-progress': 'En Progreso',
      waiting: 'Esperando',
      closed: 'Cerrado',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      low: 'success',
      medium: 'default',
      high: 'warning',
      urgent: 'danger',
    };
    const labels: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente',
    };
    return <Badge variant={variants[priority]}>{labels[priority]}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      open: <AlertCircle className="w-5 h-5 text-warning-400" />,
      'in-progress': <Clock className="w-5 h-5 text-primary-400" />,
      waiting: <Clock className="w-5 h-5 text-warning-400" />,
      closed: <CheckCircle className="w-5 h-5 text-success-400" />,
    };
    return icons[status];
  };

  const getDepartmentLabel = (department: string) => {
    const labels: Record<string, string> = {
      technical: 'Soporte Técnico',
      billing: 'Facturación',
      sales: 'Ventas',
      general: 'General',
    };
    return labels[department];
  };

  // Mock data
  const tickets: Ticket[] = [
    {
      id: '1',
      ticketNumber: 'TKT-2024-001',
      subject: 'Problema con mi servidor de Minecraft',
      clientName: 'Carlos García',
      clientEmail: 'carlos@example.com',
      department: 'technical',
      priority: 'high',
      status: 'open',
      createdAt: '2024-12-21T10:30:00',
      lastReply: '2024-12-21T10:30:00',
      messages: [
        {
          id: '1',
          sender: 'Carlos García',
          senderType: 'client',
          message: 'Hola, mi servidor de Minecraft no arranca desde esta mañana. He intentado reiniciarlo varias veces pero sigue sin funcionar. ¿Podrían ayudarme?',
          createdAt: '2024-12-21T10:30:00',
        },
      ],
    },
    {
      id: '2',
      ticketNumber: 'TKT-2024-002',
      subject: 'Consulta sobre facturación',
      clientName: 'María López',
      clientEmail: 'maria@example.com',
      department: 'billing',
      priority: 'medium',
      status: 'in-progress',
      createdAt: '2024-12-20T14:15:00',
      lastReply: '2024-12-21T09:00:00',
      messages: [
        {
          id: '1',
          sender: 'María López',
          senderType: 'client',
          message: 'Tengo una pregunta sobre mi última factura. Aparece un cargo que no reconozco.',
          createdAt: '2024-12-20T14:15:00',
        },
        {
          id: '2',
          sender: 'Admin',
          senderType: 'staff',
          message: 'Hola María, he revisado tu cuenta y el cargo corresponde a la renovación automática de tu dominio. ¿Necesitas más información?',
          createdAt: '2024-12-21T09:00:00',
        },
      ],
    },
    {
      id: '3',
      ticketNumber: 'TKT-2024-003',
      subject: 'Solicitud de upgrade de VPS',
      clientName: 'Pedro Martínez',
      clientEmail: 'pedro@example.com',
      department: 'sales',
      priority: 'low',
      status: 'waiting',
      createdAt: '2024-12-19T16:45:00',
      lastReply: '2024-12-20T11:30:00',
      messages: [
        {
          id: '1',
          sender: 'Pedro Martínez',
          senderType: 'client',
          message: 'Me gustaría hacer un upgrade de mi VPS a un plan superior. ¿Qué opciones tengo?',
          createdAt: '2024-12-19T16:45:00',
        },
        {
          id: '2',
          sender: 'Admin',
          senderType: 'staff',
          message: 'Hola Pedro, te he enviado las opciones disponibles por email. Por favor, confirma cuál te interesa.',
          createdAt: '2024-12-20T11:30:00',
        },
      ],
    },
    {
      id: '4',
      ticketNumber: 'TKT-2024-004',
      subject: 'Servidor dedicado no responde',
      clientName: 'Tech Solutions SL',
      clientEmail: 'admin@techsolutions.com',
      department: 'technical',
      priority: 'urgent',
      status: 'in-progress',
      createdAt: '2024-12-21T08:00:00',
      lastReply: '2024-12-21T08:45:00',
      messages: [
        {
          id: '1',
          sender: 'Tech Solutions SL',
          senderType: 'client',
          message: 'URGENTE: Nuestro servidor dedicado no responde. Esto está afectando a nuestra producción.',
          createdAt: '2024-12-21T08:00:00',
        },
        {
          id: '2',
          sender: 'Admin',
          senderType: 'staff',
          message: 'Estamos investigando el problema. Un técnico está trabajando en ello ahora mismo.',
          createdAt: '2024-12-21T08:45:00',
        },
      ],
    },
    {
      id: '5',
      ticketNumber: 'TKT-2024-005',
      subject: 'Gracias por el soporte',
      clientName: 'Ana Rodríguez',
      clientEmail: 'ana@example.com',
      department: 'general',
      priority: 'low',
      status: 'closed',
      createdAt: '2024-12-18T12:00:00',
      lastReply: '2024-12-18T15:00:00',
      messages: [
        {
          id: '1',
          sender: 'Ana Rodríguez',
          senderType: 'client',
          message: 'Quería agradecerles por la rápida resolución de mi problema anterior. Excelente servicio!',
          createdAt: '2024-12-18T12:00:00',
        },
        {
          id: '2',
          sender: 'Admin',
          senderType: 'staff',
          message: 'Gracias por tus palabras Ana. Estamos aquí para ayudarte. ¡Que tengas un excelente día!',
          createdAt: '2024-12-18T15:00:00',
        },
      ],
    },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || ticket.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleSendReply = () => {
    if (selectedTicket && replyMessage.trim()) {
      console.log('Sending reply to ticket:', selectedTicket.ticketNumber, replyMessage);
      // API call to send reply
      setReplyMessage('');
    }
  };

  const handleCloseTicket = (ticket: Ticket) => {
    console.log('Closing ticket:', ticket.ticketNumber);
    // API call to close ticket
  };

  const openTickets = tickets.filter((t) => t.status === 'open').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'in-progress').length;
  const urgentTickets = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'closed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tickets de Soporte</h1>
          <p className="text-dark-400 mt-1">Gestiona las solicitudes de soporte de tus clientes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{openTickets}</p>
                <p className="text-dark-400 text-sm">Abiertos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{inProgressTickets}</p>
                <p className="text-dark-400 text-sm">En Progreso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-error-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-error-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{urgentTickets}</p>
                <p className="text-dark-400 text-sm">Urgentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {tickets.filter((t) => t.status === 'closed').length}
                </p>
                <p className="text-dark-400 text-sm">Cerrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por número, asunto o cliente..."
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
                { value: 'open', label: 'Abierto' },
                { value: 'in-progress', label: 'En Progreso' },
                { value: 'waiting', label: 'Esperando' },
                { value: 'closed', label: 'Cerrado' },
              ]}
              className="w-full md:w-48"
            />
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos los departamentos' },
                { value: 'technical', label: 'Soporte Técnico' },
                { value: 'billing', label: 'Facturación' },
                { value: 'sales', label: 'Ventas' },
                { value: 'general', label: 'General' },
              ]}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800">
                  <th className="text-left p-4 text-dark-400 font-medium">Ticket</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Cliente</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Departamento</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Prioridad</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Estado</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Última Respuesta</th>
                  <th className="text-right p-4 text-dark-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center">
                          {getStatusIcon(ticket.status)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{ticket.ticketNumber}</p>
                          <p className="text-sm text-dark-400 truncate max-w-[200px]">{ticket.subject}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-dark-400" />
                        <div>
                          <p className="text-white">{ticket.clientName}</p>
                          <p className="text-sm text-dark-400">{ticket.clientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-dark-300">{getDepartmentLabel(ticket.department)}</span>
                    </td>
                    <td className="p-4">{getPriorityBadge(ticket.priority)}</td>
                    <td className="p-4">{getStatusBadge(ticket.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-dark-300">
                        <Clock className="w-4 h-4" />
                        {new Date(ticket.lastReply).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-dark-400 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                            setShowDetailModal(true);
                          }}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        {ticket.status !== 'closed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-success-400 hover:text-success-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseTicket(ticket);
                            }}
                            title="Cerrar ticket"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
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
              Mostrando {filteredTickets.length} de {tickets.length} tickets
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

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Ticket ${selectedTicket?.ticketNumber}`}
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-dark-400 text-sm">
                    {selectedTicket.clientName} ({selectedTicket.clientEmail})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(selectedTicket.priority)}
                {getStatusBadge(selectedTicket.status)}
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.senderType === 'staff'
                      ? 'bg-primary-500/10 border border-primary-500/20 ml-8'
                      : 'bg-dark-800 mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${message.senderType === 'staff' ? 'text-primary-400' : 'text-white'}`}>
                      {message.sender}
                    </span>
                    <span className="text-dark-500 text-xs">
                      {new Date(message.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-dark-300 whitespace-pre-wrap">{message.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            {selectedTicket.status !== 'closed' && (
              <div className="space-y-4 border-t border-dark-800 pt-4">
                <Textarea
                  placeholder="Escribe tu respuesta..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Adjuntar archivo
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleCloseTicket(selectedTicket)}
                    >
                      Cerrar Ticket
                    </Button>
                    <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Respuesta
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminTickets;
