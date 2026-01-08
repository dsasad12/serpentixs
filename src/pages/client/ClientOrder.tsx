import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Server,
  Globe,
  Gamepad2,
  Cloud,
  Check,
  ChevronRight,
  ArrowLeft,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  Star,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '../../stores';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

type CategoryType = 'all' | 'gameserver' | 'vps' | 'webhosting' | 'dedicado';

interface ProductPlan {
  id: string;
  name: string;
  description: string;
  category: CategoryType;
  icon: React.ReactNode;
  price: number;
  period: string;
  features: string[];
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string;
    bandwidth?: string;
    slots?: string;
  };
  popular?: boolean;
  badge?: string;
}

const ClientOrder = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductPlan | null>(null);
  const [orderStep, setOrderStep] = useState<1 | 2 | 3>(1);
  const [quantity, setQuantity] = useState(1);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const { addItem } = useCartStore();

  const categories = [
    { id: 'all', label: 'Todos', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'gameserver', label: 'Servidores de Juegos', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'vps', label: 'VPS', icon: <Server className="w-5 h-5" /> },
    { id: 'webhosting', label: 'Web Hosting', icon: <Globe className="w-5 h-5" /> },
    { id: 'dedicado', label: 'Servidores Dedicados', icon: <Cloud className="w-5 h-5" /> },
  ];

  // Sample products - in production would come from API
  const products: ProductPlan[] = [
    {
      id: 'mc-basic',
      name: 'Minecraft Básico',
      description: 'Perfecto para empezar con amigos',
      category: 'gameserver',
      icon: <Gamepad2 className="w-6 h-6" />,
      price: 4.99,
      period: 'mes',
      features: [
        'Instalación instantánea',
        'Panel de control fácil',
        'Soporte para mods',
        'Backups automáticos',
        'Protección DDoS',
      ],
      specs: {
        ram: '2 GB',
        slots: '10 slots',
        storage: '10 GB SSD',
      },
    },
    {
      id: 'mc-pro',
      name: 'Minecraft Pro',
      description: 'Para comunidades medianas',
      category: 'gameserver',
      icon: <Gamepad2 className="w-6 h-6" />,
      price: 9.99,
      period: 'mes',
      popular: true,
      badge: 'Más Popular',
      features: [
        'Todo en Básico',
        'Plugins ilimitados',
        'Subdominio gratis',
        'MySQL incluido',
        'Soporte prioritario',
      ],
      specs: {
        ram: '4 GB',
        slots: '30 slots',
        storage: '25 GB SSD NVMe',
      },
    },
    {
      id: 'mc-ultra',
      name: 'Minecraft Ultra',
      description: 'Máximo rendimiento',
      category: 'gameserver',
      icon: <Gamepad2 className="w-6 h-6" />,
      price: 19.99,
      period: 'mes',
      features: [
        'Todo en Pro',
        'IP dedicada',
        'Múltiples mundos',
        'Panel BungeeCord',
        'Consultor personal',
      ],
      specs: {
        ram: '8 GB',
        slots: 'Ilimitados',
        storage: '50 GB SSD NVMe',
      },
    },
    {
      id: 'vps-starter',
      name: 'VPS Starter',
      description: 'Ideal para proyectos pequeños',
      category: 'vps',
      icon: <Server className="w-6 h-6" />,
      price: 5.99,
      period: 'mes',
      features: [
        'Linux o Windows',
        'Panel de control',
        'Acceso root completo',
        'IPv4 dedicada',
        'Soporte 24/7',
      ],
      specs: {
        cpu: '1 vCore',
        ram: '2 GB',
        storage: '20 GB SSD',
        bandwidth: '1 TB',
      },
    },
    {
      id: 'vps-business',
      name: 'VPS Business',
      description: 'Para aplicaciones exigentes',
      category: 'vps',
      icon: <Server className="w-6 h-6" />,
      price: 14.99,
      period: 'mes',
      popular: true,
      badge: 'Recomendado',
      features: [
        'Snapshot diarios',
        'Firewall avanzado',
        'Monitorización 24/7',
        'SLA 99.9%',
        'Migración gratis',
      ],
      specs: {
        cpu: '2 vCores',
        ram: '4 GB',
        storage: '80 GB SSD NVMe',
        bandwidth: '5 TB',
      },
    },
    {
      id: 'vps-enterprise',
      name: 'VPS Enterprise',
      description: 'Máxima potencia',
      category: 'vps',
      icon: <Server className="w-6 h-6" />,
      price: 29.99,
      period: 'mes',
      features: [
        'Alta disponibilidad',
        'Balanceo de carga',
        'Red privada',
        'SLA 99.99%',
        'Soporte premium',
      ],
      specs: {
        cpu: '4 vCores',
        ram: '8 GB',
        storage: '160 GB SSD NVMe',
        bandwidth: '10 TB',
      },
    },
    {
      id: 'web-basic',
      name: 'Web Básico',
      description: 'Para sitios personales',
      category: 'webhosting',
      icon: <Globe className="w-6 h-6" />,
      price: 2.99,
      period: 'mes',
      features: [
        '1 sitio web',
        'SSL gratis',
        'cPanel incluido',
        'Email incluido',
        'WordPress 1-click',
      ],
      specs: {
        storage: '10 GB SSD',
        bandwidth: '100 GB',
      },
    },
    {
      id: 'web-premium',
      name: 'Web Premium',
      description: 'Para negocios online',
      category: 'webhosting',
      icon: <Globe className="w-6 h-6" />,
      price: 7.99,
      period: 'mes',
      popular: true,
      badge: 'Mejor Valor',
      features: [
        'Sitios ilimitados',
        'Dominio gratis (1 año)',
        'CDN incluido',
        'Backups diarios',
        'Staging environment',
      ],
      specs: {
        storage: '50 GB SSD NVMe',
        bandwidth: 'Ilimitado',
      },
    },
  ];

  const addons = [
    { id: 'ddos', name: 'Protección DDoS Premium', price: 5.99, description: 'Protección avanzada contra ataques' },
    { id: 'backup', name: 'Backups Extra', price: 2.99, description: 'Backups adicionales cada 6 horas' },
    { id: 'support', name: 'Soporte Prioritario', price: 4.99, description: 'Tiempo de respuesta <1 hora' },
    { id: 'ip', name: 'IP Adicional', price: 3.99, description: 'IPv4 dedicada extra' },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const periodMultiplier = {
    monthly: 1,
    quarterly: 2.7,
    yearly: 10,
  };

  const periodLabel = {
    monthly: 'mensual',
    quarterly: 'trimestral',
    yearly: 'anual',
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    const basePrice = selectedProduct.price * periodMultiplier[billingPeriod];
    const addonsPrice = selectedAddons.reduce((sum, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      return sum + (addon?.price || 0) * periodMultiplier[billingPeriod];
    }, 0);
    return (basePrice + addonsPrice) * quantity;
  };

  const handleSelectProduct = (product: ProductPlan) => {
    setSelectedProduct(product);
    setOrderStep(2);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    addItem({
      productId: selectedProduct.id,
      planId: `${selectedProduct.id}-${billingPeriod}`,
      productName: selectedProduct.name,
      planName: `${selectedProduct.name} (${periodLabel[billingPeriod]})`,
      price: calculateTotal(),
      billingCycle: periodLabel[billingPeriod],
      quantity: 1,
    });
    
    setOrderStep(3);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setOrderStep(1);
    setQuantity(1);
    setBillingPeriod('monthly');
    setSelectedAddons([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary-400" />
            Contratar Servicio
          </h1>
          <p className="text-dark-400 mt-1">
            Elige el plan perfecto para tus necesidades
          </p>
        </div>
        {orderStep > 1 && (
          <Button variant="ghost" onClick={handleBackToProducts} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Volver a productos
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                orderStep >= step
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-500'
              }`}
            >
              {orderStep > step ? <Check className="w-4 h-4" /> : step}
            </div>
            <span className={`text-sm ${orderStep >= step ? 'text-white' : 'text-dark-500'}`}>
              {step === 1 ? 'Producto' : step === 2 ? 'Configurar' : 'Confirmar'}
            </span>
            {step < 3 && (
              <ChevronRight className={`w-4 h-4 mx-2 ${orderStep > step ? 'text-primary-400' : 'text-dark-600'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {orderStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as CategoryType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  {product.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge variant="primary" className="whitespace-nowrap">
                        <Star className="w-3 h-3 mr-1" />
                        {product.badge}
                      </Badge>
                    </div>
                  )}
                  <Card
                    className={`h-full transition-all hover:scale-[1.02] cursor-pointer ${
                      product.popular ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-600/20 to-accent-600/20 flex items-center justify-center text-primary-400">
                          {product.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{product.name}</h3>
                          <p className="text-sm text-dark-400">{product.description}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-3xl font-bold text-white">€{product.price}</span>
                        <span className="text-dark-400">/{product.period}</span>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {product.specs.cpu && (
                          <div className="flex items-center gap-2 text-sm text-dark-300">
                            <Cpu className="w-4 h-4 text-primary-400" />
                            {product.specs.cpu}
                          </div>
                        )}
                        {product.specs.ram && (
                          <div className="flex items-center gap-2 text-sm text-dark-300">
                            <Zap className="w-4 h-4 text-primary-400" />
                            {product.specs.ram}
                          </div>
                        )}
                        {product.specs.storage && (
                          <div className="flex items-center gap-2 text-sm text-dark-300">
                            <HardDrive className="w-4 h-4 text-primary-400" />
                            {product.specs.storage}
                          </div>
                        )}
                        {product.specs.bandwidth && (
                          <div className="flex items-center gap-2 text-sm text-dark-300">
                            <Wifi className="w-4 h-4 text-primary-400" />
                            {product.specs.bandwidth}
                          </div>
                        )}
                        {product.specs.slots && (
                          <div className="flex items-center gap-2 text-sm text-dark-300">
                            <Gamepad2 className="w-4 h-4 text-primary-400" />
                            {product.specs.slots}
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {product.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-dark-300">
                            <Check className="w-4 h-4 text-success-400 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={product.popular ? 'primary' : 'secondary'}
                        className="w-full"
                      >
                        Seleccionar Plan
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {orderStep === 2 && selectedProduct && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selected Product */}
              <Card>
                <CardHeader>
                  <CardTitle>Producto Seleccionado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary-600/20 to-accent-600/20 flex items-center justify-center text-primary-400">
                      {selectedProduct.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedProduct.name}</h3>
                      <p className="text-dark-400">{selectedProduct.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Period */}
              <Card>
                <CardHeader>
                  <CardTitle>Período de Facturación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setBillingPeriod(period)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          billingPeriod === period
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-700 hover:border-dark-600'
                        }`}
                      >
                        <div className="text-center">
                          <p className="font-semibold text-white capitalize">
                            {period === 'monthly' ? 'Mensual' : period === 'quarterly' ? 'Trimestral' : 'Anual'}
                          </p>
                          <p className="text-2xl font-bold text-primary-400 mt-1">
                            €{(selectedProduct.price * periodMultiplier[period]).toFixed(2)}
                          </p>
                          {period !== 'monthly' && (
                            <Badge variant="success" size="sm" className="mt-2">
                              Ahorra {period === 'quarterly' ? '10%' : '17%'}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Addons */}
              <Card>
                <CardHeader>
                  <CardTitle>Complementos Opcionales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {addons.map((addon) => (
                    <div
                      key={addon.id}
                      onClick={() => {
                        setSelectedAddons(prev =>
                          prev.includes(addon.id)
                            ? prev.filter(id => id !== addon.id)
                            : [...prev, addon.id]
                        );
                      }}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddons.includes(addon.id)
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-700 hover:border-dark-600'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedAddons.includes(addon.id)
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-dark-500'
                          }`}
                        >
                          {selectedAddons.includes(addon.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <p className="font-medium text-white">{addon.name}</p>
                          <p className="text-sm text-dark-400">{addon.description}</p>
                        </div>
                      </div>
                      <span className="text-primary-400 font-semibold">+€{addon.price}/mes</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-dark-300">
                    <span>{selectedProduct.name}</span>
                    <span>€{(selectedProduct.price * periodMultiplier[billingPeriod]).toFixed(2)}</span>
                  </div>

                  {selectedAddons.map((addonId) => {
                    const addon = addons.find(a => a.id === addonId);
                    return addon ? (
                      <div key={addon.id} className="flex justify-between text-dark-400 text-sm">
                        <span>{addon.name}</span>
                        <span>€{(addon.price * periodMultiplier[billingPeriod]).toFixed(2)}</span>
                      </div>
                    ) : null;
                  })}

                  <div className="pt-4 border-t border-dark-700">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-white">Total ({periodLabel[billingPeriod]})</span>
                      <span className="text-primary-400">€{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    size="lg"
                    onClick={handleAddToCart}
                    leftIcon={<ShoppingCart className="w-5 h-5" />}
                  >
                    Añadir al Carrito
                  </Button>

                  <p className="text-xs text-dark-500 text-center">
                    Al continuar, aceptas nuestros{' '}
                    <a href="/terms" className="text-primary-400 hover:underline">
                      términos de servicio
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {orderStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center py-12"
          >
            <Card className="max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-success-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  ¡Añadido al Carrito!
                </h2>
                <p className="text-dark-400 mb-6">
                  {selectedProduct?.name} ha sido añadido a tu carrito de compras.
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => window.location.href = '/checkout'}
                  >
                    Ir al Checkout
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleBackToProducts}
                  >
                    Seguir Comprando
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientOrder;
