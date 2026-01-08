import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const prisma = new PrismaClient();

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number | { toNumber: () => number };
  total: number | { toNumber: () => number };
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number | { toNumber: () => number };
  tax: number | { toNumber: () => number };
  total: number | { toNumber: () => number };
  currency: string;
  dueDate: Date;
  createdAt: Date;
  paidAt: Date | null;
  notes: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  items: InvoiceItem[];
  service?: {
    name: string;
  } | null;
}

export class InvoicePDFService {
  private static getCompanyInfo() {
    return {
      name: process.env.APP_NAME || 'SerpentixPay',
      address: process.env.COMPANY_ADDRESS || 'Calle Principal #123',
      city: process.env.COMPANY_CITY || 'Ciudad de México, CDMX 06600',
      country: process.env.COMPANY_COUNTRY || 'México',
      email: process.env.COMPANY_EMAIL || 'facturacion@serpentixpay.com',
      phone: process.env.COMPANY_PHONE || '+52 55 1234 5678',
      taxId: process.env.COMPANY_TAX_ID || 'RFC: SPY123456ABC',
      website: process.env.APP_URL || 'https://serpentixpay.com',
    };
  }

  private static formatCurrency(amount: number | { toNumber: () => number }, currency: string): string {
    const value = typeof amount === 'object' && 'toNumber' in amount ? amount.toNumber() : amount;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(value);
  }

  private static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: 'Pendiente',
      PAID: 'Pagada',
      OVERDUE: 'Vencida',
      CANCELLED: 'Cancelada',
      REFUNDED: 'Reembolsada',
    };
    return statusMap[status] || status;
  }

  private static getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      PENDING: '#f59e0b',
      PAID: '#10b981',
      OVERDUE: '#ef4444',
      CANCELLED: '#6b7280',
      REFUNDED: '#8b5cf6',
    };
    return colorMap[status] || '#6b7280';
  }

  static async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: true,
        items: true,
        service: true,
      },
    }) as InvoiceData | null;

    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Factura ${invoice.invoiceNumber}`,
          Author: this.getCompanyInfo().name,
          Subject: 'Factura',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const company = this.getCompanyInfo();

      // Header
      doc.fontSize(24).fillColor('#4f46e5').text(company.name, 50, 50);
      doc.fontSize(10).fillColor('#6b7280')
        .text(company.address, 50, 80)
        .text(company.city, 50, 95)
        .text(company.taxId, 50, 110)
        .text(`${company.email} | ${company.phone}`, 50, 125);

      // Invoice title and status
      doc.fontSize(28).fillColor('#111827').text('FACTURA', 400, 50, { align: 'right' });
      doc.fontSize(12).fillColor(this.getStatusColor(invoice.status))
        .text(this.getStatusText(invoice.status), 400, 85, { align: 'right' });

      // Invoice details box
      doc.rect(400, 100, 150, 60).fill('#f3f4f6');
      doc.fontSize(9).fillColor('#6b7280')
        .text('Nº Factura:', 410, 108)
        .text('Fecha:', 410, 123)
        .text('Vencimiento:', 410, 138);
      doc.fillColor('#111827')
        .text(invoice.invoiceNumber, 480, 108)
        .text(format(new Date(invoice.createdAt), 'dd/MM/yyyy', { locale: es }), 480, 123)
        .text(format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: es }), 480, 138);

      // Divider
      doc.moveTo(50, 170).lineTo(545, 170).stroke('#e5e7eb');

      // Client info
      doc.fontSize(11).fillColor('#4f46e5').text('FACTURAR A:', 50, 190);
      doc.fontSize(10).fillColor('#111827')
        .text(`${invoice.user.firstName} ${invoice.user.lastName}`, 50, 210)
        .fillColor('#6b7280')
        .text(invoice.user.email, 50, 225)
        .text(invoice.user.phone || '', 50, 240);

      // Service info (if applicable)
      if (invoice.service) {
        doc.fontSize(11).fillColor('#4f46e5').text('SERVICIO:', 300, 190);
        doc.fontSize(10).fillColor('#111827')
          .text(invoice.service.name, 300, 210);
      }

      // Items table header
      const tableTop = 290;
      doc.rect(50, tableTop, 495, 25).fill('#4f46e5');
      doc.fontSize(10).fillColor('#ffffff')
        .text('DESCRIPCIÓN', 60, tableTop + 8)
        .text('CANT.', 320, tableTop + 8)
        .text('PRECIO', 380, tableTop + 8)
        .text('TOTAL', 460, tableTop + 8);

      // Items
      let yPosition = tableTop + 35;
      invoice.items.forEach((item, index) => {
        const rowColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.rect(50, yPosition - 5, 495, 25).fill(rowColor);
        
        doc.fontSize(9).fillColor('#374151')
          .text(item.description, 60, yPosition, { width: 250 })
          .text(item.quantity.toString(), 320, yPosition)
          .text(this.formatCurrency(item.unitPrice, invoice.currency), 380, yPosition)
          .text(this.formatCurrency(item.total, invoice.currency), 460, yPosition);
        
        yPosition += 25;
      });

      // Totals box
      const totalsY = yPosition + 20;
      doc.rect(350, totalsY, 195, 80).fill('#f3f4f6');
      
      doc.fontSize(10).fillColor('#6b7280')
        .text('Subtotal:', 360, totalsY + 10)
        .text('IVA:', 360, totalsY + 30);
      
      doc.fillColor('#111827')
        .text(this.formatCurrency(invoice.subtotal, invoice.currency), 460, totalsY + 10, { align: 'right', width: 75 })
        .text(this.formatCurrency(invoice.tax, invoice.currency), 460, totalsY + 30, { align: 'right', width: 75 });

      doc.rect(350, totalsY + 50, 195, 25).fill('#4f46e5');
      doc.fontSize(11).fillColor('#ffffff')
        .text('TOTAL:', 360, totalsY + 57)
        .text(this.formatCurrency(invoice.total, invoice.currency), 460, totalsY + 57, { align: 'right', width: 75 });

      // Payment info
      if (invoice.status === 'PAID' && invoice.paidAt) {
        doc.fontSize(10).fillColor('#10b981')
          .text(`✓ Pagada el ${format(new Date(invoice.paidAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}`, 50, totalsY + 30);
      } else if (invoice.status === 'PENDING') {
        doc.fontSize(10).fillColor('#f59e0b')
          .text('⏳ Pago pendiente', 50, totalsY + 30);
      }

      // Notes
      if (invoice.notes) {
        doc.fontSize(9).fillColor('#6b7280')
          .text('Notas:', 50, totalsY + 100)
          .text(invoice.notes, 50, totalsY + 115, { width: 250 });
      }

      // Footer
      const footerY = 750;
      doc.moveTo(50, footerY).lineTo(545, footerY).stroke('#e5e7eb');
      doc.fontSize(8).fillColor('#9ca3af')
        .text('Gracias por su confianza', 50, footerY + 10, { align: 'center', width: 495 })
        .text(company.website, 50, footerY + 22, { align: 'center', width: 495 });

      doc.end();
    });
  }

  static async getInvoiceById(invoiceId: string) {
    return prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: true,
        items: true,
        service: true,
      },
    });
  }
}
