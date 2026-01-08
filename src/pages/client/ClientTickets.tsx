import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Send,
  Paperclip,
  ChevronRight,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

interface Ticket {
  id: string;
  subject: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'answered' | 'customer-reply' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    author: string;
    isStaff: boolean;
    content: string;
    timestamp: string;
    attachments?: string[];
  }[];
}

const ClientTickets = () => {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  // Mock tickets data
  const tickets: Ticket[] = [
    {
      id: '1',
      subject: 'Problema con la conexión del servidor',
      department: 'Soporte Técnico',
      priority: 'high',
      status: 'answered',
      createdAt: '2024-12-20 14:30',
      updatedAt: '2024-12-21 09:15',
      messages: [
        {
          id: '1',
          author: 'Carlos García',
          isStaff: false,
          content: 'Hola, estoy teniendo problemas para conectarme a mi servidor de Minecraft. El servidor aparece como online en el panel pero no puedo conectarme desde el juego. ¿Pueden ayudarme?',
          timestamp: '2024-12-20 14:30',
        },
        {
          id: '2',
          author: 'Soporte Serpentix',
          isStaff: true,
          content: 'Hola Carlos, gracias por contactarnos. Hemos revisado tu servidor y parece que hay un problema con la configuración del puerto. Hemos realizado los ajustes necesarios. ¿Podrías intentar conectarte de nuevo y confirmarnos si el problema persiste?',
          timestamp: '2024-12-21 09:15',
        },
      ],
    },
    {
      id: '2',
      subject: 'Solicitud de upgrade de plan',
      department: 'Ventas',
      priority: 'medium',
      status: 'open',
      createdAt: '2024-12-19 10:00',
      updatedAt: '2024-12-19 10:00',
      messages: [
        {
          id: '1',
          author: 'Carlos García',
          isStaff: false,
          content: 'Me gustaría actualizar mi plan de VPS Business a Enterprise. ¿Cuál sería el proceso y cómo se calcularía el prorrateo?',
          timestamp: '2024-12-19 10:00',
        },
      ],
    },
    {
      id: '3',
      subject: 'Consulta sobre facturación',
      department: 'Facturación',
      priority: 'low',
      status: 'closed',
      createdAt: '2024-12-15 16:45',
      updatedAt: '2024-12-16 11:20',
      messages: [
        {
          id: '1',
          author: 'Carlos García',
          isStaff: false,
          content: '¿Podrían enviarme una copia de la factura del mes pasado? No la encuentro en mi correo.',
          timestamp: '2024-12-15 16:45',
        },
        {
          id: '2',
          author: 'Soporte Serpentix',
          isStaff: true,
          content: 'Hola Carlos, te hemos reenviado la factura a tu correo electrónico registrado. También puedes descargarla directamente desde la sección de Facturas en tu panel de cliente.',
          timestamp: '2024-12-16 11:20',
        },
        {
          id: '3',
          author: 'Carlos García',
          isStaff: false,
          content: 'Perfecto, ya la recibí. Muchas gracias por la ayuda.',
          timestamp: '2024-12-16 14:30',
        },
      ],
    },
  ];

  const getPriorityBadge = (priority: string): 'default' | 'info' | 'warning' | 'danger' => {
    const variants: Record<string, 'default' | 'info' | 'warning' | 'danger'> = {
      low: 'default',
      medium: 'info',
      high: 'warning',
      critical: 'danger',
    };
    return variants[priority] || 'default';
  };

  const getPriorityText = (priority: string) => {
    const texts: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica',
    };
    return texts[priority] || priority;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      open: <Clock className="w-4 h-4 text-warning-400" />,
      answered: <CheckCircle className="w-4 h-4 text-success-400" />,
      'customer-reply': <AlertCircle className="w-4 h-4 text-primary-400" />,
      closed: <XCircle className="w-4 h-4 text-dark-500" />,
    };
    return icons[status] || null;
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      open: 'Abierto',
      answered: 'Respondido',
      'customer-reply': 'Respuesta Cliente',
      closed: 'Cerrado',
    };
    return texts[status] || status;
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'open' && ticket.status !== 'closed') ||
      (filter === 'closed' && ticket.status === 'closed');
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const departments = [
    { value: 'technical', label: 'Soporte Técnico' },
    { value: 'sales', label: 'Ventas' },
    { value: 'billing', label: 'Facturación' },
    { value: 'other', label: 'Otro' },
  ];

  const priorities = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Crítica' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tickets de Soporte</h1>
          <p className="text-dark-400 mt-1">
            Gestiona tus consultas y solicitudes
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowNewTicketModal(true)}
        >
          Nuevo Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Total Tickets</p>
              <p className="text-2xl font-bold text-white">{tickets.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Abiertos</p>
              <p className="text-2xl font-bold text-white">
                {tickets.filter((t) => t.status !== 'closed').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Respondidos</p>
              <p className="text-2xl font-bold text-white">
                {tickets.filter((t) => t.status === 'answered').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-dark-700/50 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-dark-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Cerrados</p>
              <p className="text-2xl font-bold text-white">
                {tickets.filter((t) => t.status === 'closed').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'open', label: 'Abiertos' },
              { key: 'closed', label: 'Cerrados' },
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
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="cursor-pointer hover:border-primary-500/50 transition-all"
            onClick={() => setSelectedTicket(ticket)}
          >
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
                  {getStatusIcon(ticket.status)}
                </div>
                <div>
                  <h3 className="font-medium text-white">{ticket.subject}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-dark-500 text-sm">{ticket.department}</span>
                    <span className="text-dark-700">•</span>
                    <Badge variant={getPriorityBadge(ticket.priority)} size="sm">
                      {getPriorityText(ticket.priority)}
                    </Badge>
                    <span className="text-dark-700">•</span>
                    <span className="text-dark-500 text-sm">
                      {getStatusText(ticket.status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm text-dark-400">Última actualización</p>
                  <p className="text-white">{ticket.updatedAt}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-dark-500" />
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTickets.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No hay tickets
              </h3>
              <p className="text-dark-400 mb-6">
                No se encontraron tickets que coincidan con los filtros
              </p>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowNewTicketModal(true)}
              >
                Crear Nuevo Ticket
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.subject || ''}
        size="xl"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="flex flex-wrap gap-4 p-4 bg-dark-800/50 rounded-lg">
              <div>
                <p className="text-dark-500 text-sm">Departamento</p>
                <p className="text-white">{selectedTicket.department}</p>
              </div>
              <div>
                <p className="text-dark-500 text-sm">Prioridad</p>
                <Badge variant={getPriorityBadge(selectedTicket.priority)}>
                  {getPriorityText(selectedTicket.priority)}
                </Badge>
              </div>
              <div>
                <p className="text-dark-500 text-sm">Estado</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedTicket.status)}
                  <span className="text-white">{getStatusText(selectedTicket.status)}</span>
                </div>
              </div>
              <div>
                <p className="text-dark-500 text-sm">Creado</p>
                <p className="text-white">{selectedTicket.createdAt}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.isStaff
                      ? 'bg-primary-500/10 border border-primary-500/20'
                      : 'bg-dark-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          message.isStaff
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-700 text-white'
                        }`}
                      >
                        {message.author.charAt(0)}
                      </div>
                      <span className="font-medium text-white">{message.author}</span>
                      {message.isStaff && (
                        <Badge variant="primary" size="sm">
                          Staff
                        </Badge>
                      )}
                    </div>
                    <span className="text-dark-500 text-sm">{message.timestamp}</span>
                  </div>
                  <p className="text-dark-300 whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            {selectedTicket.status !== 'closed' && (
              <div className="pt-4 border-t border-dark-800">
                <Textarea
                  placeholder="Escribe tu respuesta..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                />
                <div className="flex items-center justify-between mt-4">
                  <button className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors">
                    <Paperclip className="w-4 h-4" />
                    <span>Adjuntar archivo</span>
                  </button>
                  <Button variant="primary" leftIcon={<Send className="w-4 h-4" />}>
                    Enviar Respuesta
                  </Button>
                </div>
              </div>
            )}

            {selectedTicket.status === 'closed' && (
              <div className="p-4 bg-dark-800/50 rounded-lg text-center">
                <p className="text-dark-400">
                  Este ticket está cerrado. Si necesitas más ayuda, por favor abre un nuevo ticket.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* New Ticket Modal */}
      <Modal
        isOpen={showNewTicketModal}
        onClose={() => setShowNewTicketModal(false)}
        title="Nuevo Ticket de Soporte"
        size="lg"
      >
        <form className="space-y-6">
          <Select
            label="Departamento"
            options={departments}
            placeholder="Selecciona un departamento"
            required
          />

          <Select
            label="Prioridad"
            options={priorities}
            placeholder="Selecciona la prioridad"
            required
          />

          <Input
            label="Asunto"
            placeholder="Describe brevemente tu consulta"
            required
          />

          <Textarea
            label="Mensaje"
            placeholder="Describe tu problema o consulta con el mayor detalle posible..."
            rows={6}
            required
          />

          <div className="p-4 bg-dark-800/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Paperclip className="w-5 h-5 text-dark-400" />
              <span className="text-white font-medium">Archivos adjuntos</span>
            </div>
            <p className="text-dark-500 text-sm mb-3">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <input
              type="file"
              className="hidden"
              id="file-upload"
              multiple
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 bg-dark-700 text-dark-300 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors"
            >
              Seleccionar archivos
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowNewTicketModal(false)}
            >
              Cancelar
            </Button>
            <Button variant="primary" type="submit" className="flex-1">
              Crear Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default ClientTickets;
