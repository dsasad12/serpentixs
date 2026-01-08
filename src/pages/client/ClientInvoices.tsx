import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  CreditCard,
  Calendar,
  Search,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  paidDate?: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
}

const ClientInvoices = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Mock invoices data
  const invoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      date: '2024-12-21',
      dueDate: '2024-12-31',
      amount: 29.99,
      status: 'pending',
      items: [
        { description: 'Minecraft Server Pro - Enero 2025', quantity: 1, price: 9.99 },
        { description: 'VPS Business - Enero 2025', quantity: 1, price: 19.99 },
      ],
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      date: '2024-11-21',
      dueDate: '2024-11-30',
      paidDate: '2024-11-25',
      amount: 37.97,
      status: 'paid',
      items: [
        { description: 'Minecraft Server Pro - Diciembre 2024', quantity: 1, price: 9.99 },
        { description: 'VPS Business - Diciembre 2024', quantity: 1, price: 19.99 },
        { description: 'Web Hosting - Diciembre 2024', quantity: 1, price: 7.99 },
      ],
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      date: '2024-10-21',
      dueDate: '2024-10-31',
      paidDate: '2024-10-22',
      amount: 37.97,
      status: 'paid',
      items: [
        { description: 'Minecraft Server Pro - Noviembre 2024', quantity: 1, price: 9.99 },
        { description: 'VPS Business - Noviembre 2024', quantity: 1, price: 19.99 },
        { description: 'Web Hosting - Noviembre 2024', quantity: 1, price: 7.99 },
      ],
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-004',
      date: '2024-09-21',
      dueDate: '2024-09-30',
      paidDate: '2024-09-28',
      amount: 29.98,
      status: 'paid',
      items: [
        { description: 'Minecraft Server Pro - Octubre 2024', quantity: 1, price: 9.99 },
        { description: 'VPS Business - Octubre 2024', quantity: 1, price: 19.99 },
      ],
    },
  ];

  const getStatusBadge = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      paid: 'success',
      pending: 'warning',
      overdue: 'danger',
      cancelled: 'default',
    };
    return variants[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      paid: 'Pagada',
      pending: 'Pendiente',
      overdue: 'Vencida',
      cancelled: 'Cancelada',
    };
    return texts[status] || status;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesFilter = filter === 'all' || invoice.status === filter;
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: invoices.reduce((acc, inv) => acc + inv.amount, 0),
    paid: invoices.filter((inv) => inv.status === 'paid').reduce((acc, inv) => acc + inv.amount, 0),
    pending: invoices.filter((inv) => inv.status === 'pending').reduce((acc, inv) => acc + inv.amount, 0),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Facturas</h1>
        <p className="text-dark-400 mt-1">
          Historial de facturación y pagos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Total Facturado</p>
              <p className="text-2xl font-bold text-white">€{stats.total.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success-500/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-success-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Total Pagado</p>
              <p className="text-2xl font-bold text-white">€{stats.paid.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-warning-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Pendiente de Pago</p>
              <p className="text-2xl font-bold text-white">€{stats.pending.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'pending', label: 'Pendientes' },
              { key: 'paid', label: 'Pagadas' },
              { key: 'overdue', label: 'Vencidas' },
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

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800">
                  <th className="text-left p-4 text-dark-400 font-medium">Factura</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Fecha</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Vencimiento</th>
                  <th className="text-left p-4 text-dark-400 font-medium">Estado</th>
                  <th className="text-right p-4 text-dark-400 font-medium">Importe</th>
                  <th className="text-right p-4 text-dark-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="table-row">
                    <td className="p-4">
                      <span className="font-medium text-white">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="p-4 text-dark-300">{invoice.date}</td>
                    <td className="p-4 text-dark-300">{invoice.dueDate}</td>
                    <td className="p-4">
                      <Badge variant={getStatusBadge(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-medium text-white">€{invoice.amount.toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {invoice.status === 'pending' && (
                          <Button variant="primary" size="sm">
                            Pagar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No hay facturas
              </h3>
              <p className="text-dark-400">
                No se encontraron facturas que coincidan con los filtros
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Factura ${selectedInvoice?.invoiceNumber}`}
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Invoice Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-dark-500 text-sm">Fecha de emisión</p>
                <p className="text-white">{selectedInvoice.date}</p>
              </div>
              <div>
                <p className="text-dark-500 text-sm">Fecha de vencimiento</p>
                <p className="text-white">{selectedInvoice.dueDate}</p>
              </div>
              <div>
                <p className="text-dark-500 text-sm">Estado</p>
                <Badge variant={getStatusBadge(selectedInvoice.status)}>
                  {getStatusText(selectedInvoice.status)}
                </Badge>
              </div>
              {selectedInvoice.paidDate && (
                <div>
                  <p className="text-dark-500 text-sm">Fecha de pago</p>
                  <p className="text-white">{selectedInvoice.paidDate}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h4 className="font-medium text-white mb-4">Conceptos</h4>
              <div className="space-y-3">
                {selectedInvoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg"
                  >
                    <div>
                      <p className="text-white">{item.description}</p>
                      <p className="text-dark-500 text-sm">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-white">€{item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-dark-800">
              <div className="flex justify-between items-center">
                <span className="text-dark-400">Subtotal</span>
                <span className="text-white">€{selectedInvoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-dark-400">IVA (21%)</span>
                <span className="text-white">€{(selectedInvoice.amount * 0.21).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-dark-800">
                <span className="font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-white">
                  €{(selectedInvoice.amount * 1.21).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" leftIcon={<Download className="w-4 h-4" />}>
                Descargar PDF
              </Button>
              {selectedInvoice.status === 'pending' && (
                <Button variant="primary" className="flex-1">
                  Pagar Ahora
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default ClientInvoices;
