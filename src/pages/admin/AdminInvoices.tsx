import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Download,
  Eye,
  Send,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Mail,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  amount: number;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

const AdminInvoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      cancelled: 'default',
    };
    const labels: Record<string, string> = {
      paid: 'Pagada',
      pending: 'Pendiente',
      overdue: 'Vencida',
      cancelled: 'Cancelada',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      paid: <CheckCircle className="w-5 h-5 text-success-400" />,
      pending: <Clock className="w-5 h-5 text-warning-400" />,
      overdue: <AlertCircle className="w-5 h-5 text-error-400" />,
      cancelled: <XCircle className="w-5 h-5 text-dark-400" />,
    };
    return icons[status];
  };

  // Mock data
  const invoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      clientName: 'Carlos García',
      clientEmail: 'carlos@example.com',
      status: 'paid',
      amount: 24.99,
      dueDate: '2024-12-15',
      paidDate: '2024-12-10',
      createdAt: '2024-12-01',
      items: [
        { description: 'Minecraft Server - Premium (1 mes)', quantity: 1, unitPrice: 24.99 },
      ],
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      clientName: 'María López',
      clientEmail: 'maria@example.com',
      status: 'pending',
      amount: 119.88,
      dueDate: '2024-12-25',
      createdAt: '2024-12-05',
      items: [
        { description: 'Web Hosting - Business (1 año)', quantity: 1, unitPrice: 119.88 },
      ],
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      clientName: 'Pedro Martínez',
      clientEmail: 'pedro@example.com',
      status: 'overdue',
      amount: 19.99,
      dueDate: '2024-12-10',
      createdAt: '2024-11-25',
      items: [
        { description: 'VPS - 4GB RAM (1 mes)', quantity: 1, unitPrice: 19.99 },
      ],
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-004',
      clientName: 'Tech Solutions SL',
      clientEmail: 'admin@techsolutions.com',
      status: 'paid',
      amount: 149.99,
      dueDate: '2025-01-05',
      paidDate: '2024-12-20',
      createdAt: '2024-12-20',
      items: [
        { description: 'Dedicated - Intel Xeon E5 (1 mes)', quantity: 1, unitPrice: 149.99 },
      ],
    },
    {
      id: '5',
      invoiceNumber: 'INV-2024-005',
      clientName: 'Ana Rodríguez',
      clientEmail: 'ana@example.com',
      status: 'cancelled',
      amount: 12.99,
      dueDate: '2024-12-01',
      createdAt: '2024-11-15',
      items: [
        { description: 'Domain - example.com (1 año)', quantity: 1, unitPrice: 12.99 },
      ],
    },
  ];

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReminder = (invoice: Invoice) => {
    console.log('Sending reminder for invoice:', invoice.invoiceNumber);
    // API call to send reminder email
  };

  const handleDownloadPdf = (invoice: Invoice) => {
    console.log('Downloading PDF for invoice:', invoice.invoiceNumber);
    // API call to generate and download PDF
  };

  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Facturas</h1>
          <p className="text-dark-400 mt-1">Gestiona todas las facturas de tus clientes</p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">€{totalPaid.toFixed(2)}</p>
                <p className="text-dark-400 text-sm">Cobrado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">€{totalPending.toFixed(2)}</p>
                <p className="text-dark-400 text-sm">Pendiente</p>
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
                <p className="text-2xl font-bold text-white">€{totalOverdue.toFixed(2)}</p>
                <p className="text-dark-400 text-sm">Vencido</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{invoices.length}</p>
                <p className="text-dark-400 text-sm">Total Facturas</p>
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
                placeholder="Buscar por número, cliente o email..."
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
                { value: 'paid', label: 'Pagada' },
                { value: 'pending', label: 'Pendiente' },
                { value: 'overdue', label: 'Vencida' },
                { value: 'cancelled', label: 'Cancelada' },
              ]}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800">
                  <th className="text-left p-4 text-dark-400 font-medium">Factura</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Cliente</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Estado</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Importe</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Vencimiento</th>
                  <th className="text-right p-4 text-dark-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center">
                          {getStatusIcon(invoice.status)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-dark-400">
                            {new Date(invoice.createdAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-dark-400" />
                        <div>
                          <p className="text-white">{invoice.clientName}</p>
                          <p className="text-sm text-dark-400">{invoice.clientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(invoice.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-dark-400" />
                        <span className="text-white font-medium">€{invoice.amount.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-dark-300">
                        <Calendar className="w-4 h-4" />
                        {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-dark-400 hover:text-white"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowDetailModal(true);
                          }}
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-dark-400 hover:text-white"
                          onClick={() => handleDownloadPdf(invoice)}
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary-400 hover:text-primary-300"
                            onClick={() => handleSendReminder(invoice)}
                            title="Enviar recordatorio"
                          >
                            <Mail className="w-4 h-4" />
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
              Mostrando {filteredInvoices.length} de {invoices.length} facturas
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
        title={`Factura ${selectedInvoice?.invoiceNumber}`}
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Cliente</p>
                <p className="text-white font-medium">{selectedInvoice.clientName}</p>
                <p className="text-dark-400 text-sm">{selectedInvoice.clientEmail}</p>
              </div>
              {getStatusBadge(selectedInvoice.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-dark-400 text-sm">Fecha de emisión</p>
                <p className="text-white">{new Date(selectedInvoice.createdAt).toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <p className="text-dark-400 text-sm">Fecha de vencimiento</p>
                <p className="text-white">{new Date(selectedInvoice.dueDate).toLocaleDateString('es-ES')}</p>
              </div>
              {selectedInvoice.paidDate && (
                <div>
                  <p className="text-dark-400 text-sm">Fecha de pago</p>
                  <p className="text-white">{new Date(selectedInvoice.paidDate).toLocaleDateString('es-ES')}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-dark-400 text-sm mb-2">Conceptos</p>
              <div className="bg-dark-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="text-left p-3 text-dark-400 text-sm">Descripción</th>
                      <th className="text-center p-3 text-dark-400 text-sm">Cantidad</th>
                      <th className="text-right p-3 text-dark-400 text-sm">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="p-3 text-white">{item.description}</td>
                        <td className="p-3 text-center text-dark-300">{item.quantity}</td>
                        <td className="p-3 text-right text-white">€{item.unitPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-dark-700">
                      <td colSpan={2} className="p-3 text-right text-dark-400 font-medium">Total:</td>
                      <td className="p-3 text-right text-white font-bold">€{selectedInvoice.amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => handleDownloadPdf(selectedInvoice)}>
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
              {(selectedInvoice.status === 'pending' || selectedInvoice.status === 'overdue') && (
                <Button onClick={() => handleSendReminder(selectedInvoice)}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Recordatorio
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminInvoices;
