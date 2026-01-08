import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ToggleRight,
  Copy,
  Gamepad2,
  Globe,
  Server,
  HardDrive,
  AtSign,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

interface Product {
  id: string;
  name: string;
  category: 'game-hosting' | 'web-hosting' | 'vps' | 'dedicated' | 'domains';
  description: string;
  price: {
    monthly: number;
    annually: number;
  };
  features: string[];
  isActive: boolean;
  salesCount: number;
  createdAt: string;
}

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'game-hosting': <Gamepad2 className="w-5 h-5" />,
      'web-hosting': <Globe className="w-5 h-5" />,
      vps: <Server className="w-5 h-5" />,
      dedicated: <HardDrive className="w-5 h-5" />,
      domains: <AtSign className="w-5 h-5" />,
    };
    return icons[category] || <Package className="w-5 h-5" />;
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'game-hosting': 'Game Hosting',
      'web-hosting': 'Web Hosting',
      vps: 'VPS',
      dedicated: 'Dedicado',
      domains: 'Dominios',
    };
    return names[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'game-hosting': 'text-purple-400 bg-purple-500/20',
      'web-hosting': 'text-blue-400 bg-blue-500/20',
      vps: 'text-fuchsia-400 bg-fuchsia-500/20',
      dedicated: 'text-emerald-400 bg-emerald-500/20',
      domains: 'text-amber-400 bg-amber-500/20',
    };
    return colors[category] || 'text-gray-400 bg-gray-500/20';
  };

  // Mock products data
  const products: Product[] = [
    {
      id: '1',
      name: 'Minecraft Starter',
      category: 'game-hosting',
      description: 'Servidor básico para empezar tu aventura',
      price: { monthly: 4.99, annually: 49.99 },
      features: ['2GB RAM', '10 Slots', 'SSD NVMe', 'Soporte 24/7'],
      isActive: true,
      salesCount: 156,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Minecraft Pro',
      category: 'game-hosting',
      description: 'Para comunidades en crecimiento',
      price: { monthly: 9.99, annually: 99.99 },
      features: ['4GB RAM', '25 Slots', 'SSD NVMe', 'Protección DDoS'],
      isActive: true,
      salesCount: 234,
      createdAt: '2024-01-15',
    },
    {
      id: '3',
      name: 'Web Starter',
      category: 'web-hosting',
      description: 'Perfecto para sitios pequeños',
      price: { monthly: 3.99, annually: 39.99 },
      features: ['10GB SSD', '1 Dominio', 'SSL Gratis', 'Email incluido'],
      isActive: true,
      salesCount: 89,
      createdAt: '2024-02-10',
    },
    {
      id: '4',
      name: 'Web Business',
      category: 'web-hosting',
      description: 'Para negocios profesionales',
      price: { monthly: 7.99, annually: 79.99 },
      features: ['50GB SSD', '5 Dominios', 'SSL Wildcard', 'CDN Global'],
      isActive: true,
      salesCount: 67,
      createdAt: '2024-02-10',
    },
    {
      id: '5',
      name: 'VPS Starter',
      category: 'vps',
      description: 'Tu propio servidor virtual',
      price: { monthly: 9.99, annually: 99.99 },
      features: ['2 vCPU', '4GB RAM', '50GB SSD', 'Root Access'],
      isActive: true,
      salesCount: 45,
      createdAt: '2024-03-05',
    },
    {
      id: '6',
      name: 'VPS Business',
      category: 'vps',
      description: 'Mayor potencia para proyectos exigentes',
      price: { monthly: 19.99, annually: 199.99 },
      features: ['4 vCPU', '8GB RAM', '100GB SSD', 'Snapshots'],
      isActive: true,
      salesCount: 78,
      createdAt: '2024-03-05',
    },
    {
      id: '7',
      name: 'Dedicado E3',
      category: 'dedicated',
      description: 'Servidor dedicado de alto rendimiento',
      price: { monthly: 89.99, annually: 899.99 },
      features: ['Intel E3-1270', '32GB RAM', '2x1TB SSD', '1Gbps'],
      isActive: true,
      salesCount: 12,
      createdAt: '2024-04-20',
    },
    {
      id: '8',
      name: 'Dominio .com',
      category: 'domains',
      description: 'El dominio más popular',
      price: { monthly: 0, annually: 12.99 },
      features: ['WHOIS Privado', 'DNS Gestión', 'Auto-renovación'],
      isActive: true,
      salesCount: 234,
      createdAt: '2024-01-01',
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    totalSales: products.reduce((acc, p) => acc + p.salesCount, 0),
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
          <h1 className="text-3xl font-bold text-white">Productos</h1>
          <p className="text-dark-400 mt-1">
            Gestiona el catálogo de productos y servicios
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Nuevo Producto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Total Productos</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success-500/20 flex items-center justify-center">
              <ToggleRight className="w-6 h-6 text-success-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Activos</p>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Ventas Totales</p>
              <p className="text-2xl font-bold text-white">{stats.totalSales}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            options={[
              { value: 'all', label: 'Todas las categorías' },
              { value: 'game-hosting', label: 'Game Hosting' },
              { value: 'web-hosting', label: 'Web Hosting' },
              { value: 'vps', label: 'VPS' },
              { value: 'dedicated', label: 'Dedicados' },
              { value: 'domains', label: 'Dominios' },
            ]}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-56"
          />
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:border-primary-500/30 transition-all">
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${getCategoryColor(product.category)} flex items-center justify-center`}>
                  {getCategoryIcon(product.category)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={product.isActive ? 'success' : 'default'} size="sm">
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <button aria-label="Editar producto" className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-dark-500 text-xs uppercase tracking-wider mb-1">
                  {getCategoryName(product.category)}
                </p>
                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                <p className="text-dark-400 text-sm mt-1">{product.description}</p>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-white">
                  €{product.price.monthly > 0 ? product.price.monthly.toFixed(2) : product.price.annually.toFixed(2)}
                </span>
                <span className="text-dark-500">
                  /{product.price.monthly > 0 ? 'mes' : 'año'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {product.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-dark-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-dark-800 flex items-center justify-between">
                <span className="text-dark-500 text-sm">
                  {product.salesCount} ventas
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                    title="Duplicar"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-dark-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay productos
            </h3>
            <p className="text-dark-400 mb-6">
              No se encontraron productos que coincidan con los filtros
            </p>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Crear Producto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Product Detail Modal */}
      <Modal
        isOpen={!!selectedProduct && !showDeleteModal}
        onClose={() => setSelectedProduct(null)}
        title="Detalles del Producto"
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            {/* Product Info */}
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-xl ${getCategoryColor(selectedProduct.category)} flex items-center justify-center`}>
                {getCategoryIcon(selectedProduct.category)}
              </div>
              <div>
                <p className="text-dark-500 text-sm">{getCategoryName(selectedProduct.category)}</p>
                <h3 className="text-xl font-bold text-white">{selectedProduct.name}</h3>
                <p className="text-dark-400 mt-1">{selectedProduct.description}</p>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-800/50 rounded-lg">
                <p className="text-dark-500 text-sm">Precio Mensual</p>
                <p className="text-2xl font-bold text-white">
                  €{selectedProduct.price.monthly.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-lg">
                <p className="text-dark-500 text-sm">Precio Anual</p>
                <p className="text-2xl font-bold text-white">
                  €{selectedProduct.price.annually.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-medium text-white mb-3">Características</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedProduct.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-dark-800/50 rounded-lg text-sm text-dark-300"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-dark-800/50 rounded-lg">
              <div className="text-center">
                <p className="text-dark-500 text-sm">Ventas</p>
                <p className="text-xl font-bold text-white">{selectedProduct.salesCount}</p>
              </div>
              <div className="text-center">
                <p className="text-dark-500 text-sm">Estado</p>
                <Badge variant={selectedProduct.isActive ? 'success' : 'default'}>
                  {selectedProduct.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-dark-500 text-sm">Creado</p>
                <p className="text-white">{selectedProduct.createdAt}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-dark-800">
              <Button variant="secondary" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </Button>
              <Button variant="primary" className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                Editar
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
          setSelectedProduct(null);
        }}
        title="Eliminar Producto"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-dark-300">
            ¿Estás seguro de que deseas eliminar el producto{' '}
            <span className="text-white font-medium">{selectedProduct?.name}</span>?
          </p>
          <p className="text-dark-500 text-sm">
            Esta acción no se puede deshacer. Los servicios existentes basados en este producto no se verán afectados.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedProduct(null);
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

export default AdminProducts;
