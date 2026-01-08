import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Globe,
  Server,
  HardDrive,
  Check,
  Zap,
  Shield,
  Clock,
  HeadphonesIcon,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useCartStore } from '../../stores';
import { toast } from '../../components/ui/Toast';

type ServiceCategory = 'game-hosting' | 'web-hosting' | 'vps' | 'dedicated' | 'domains';

interface ServicePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  billingCycle: string;
  popular: boolean;
  features: string[];
  specs: Record<string, string>;
}

const servicesData: Record<ServiceCategory, {
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Gamepad2;
  color: string;
  plans: ServicePlan[];
}> = {
  'game-hosting': {
    title: 'Game Hosting',
    subtitle: 'Servidores de Juegos',
    description: 'Servidores optimizados para más de 50 juegos. Instalación automática, mods, y soporte especializado.',
    icon: Gamepad2,
    color: 'from-green-500 to-emerald-600',
    plans: [
      {
        id: 'game-starter',
        name: 'Starter',
        description: 'Perfecto para empezar con amigos',
        price: 2.99,
        billingCycle: 'mes',
        popular: false,
        features: [
          '2GB RAM',
          '10 Jugadores',
          'SSD NVMe',
          'Protección DDoS',
          'Backups diarios',
          'Soporte por ticket',
        ],
        specs: {
          RAM: '2GB DDR4',
          CPU: '1 vCore @ 4.0GHz',
          Storage: '10GB NVMe',
          Network: '1Gbps',
        },
      },
      {
        id: 'game-pro',
        name: 'Pro',
        description: 'Para comunidades en crecimiento',
        price: 9.99,
        originalPrice: 14.99,
        billingCycle: 'mes',
        popular: true,
        features: [
          '6GB RAM',
          '50 Jugadores',
          'SSD NVMe Premium',
          'Protección DDoS Pro',
          'Backups cada 6h',
          'Soporte prioritario',
          'Instalador de mods',
          'Subdominio gratis',
        ],
        specs: {
          RAM: '6GB DDR4',
          CPU: '2 vCore @ 4.5GHz',
          Storage: '30GB NVMe',
          Network: '10Gbps',
        },
      },
      {
        id: 'game-elite',
        name: 'Elite',
        description: 'Máximo rendimiento',
        price: 19.99,
        billingCycle: 'mes',
        popular: false,
        features: [
          '12GB RAM',
          '100+ Jugadores',
          'SSD NVMe Enterprise',
          'Protección DDoS Enterprise',
          'Backups cada hora',
          'Soporte 24/7 telefónico',
          'Instalador de mods',
          'Subdominio gratis',
          'IP Dedicada',
          'MySQL incluido',
        ],
        specs: {
          RAM: '12GB DDR4',
          CPU: '4 vCore @ 4.8GHz',
          Storage: '60GB NVMe',
          Network: '10Gbps',
        },
      },
    ],
  },
  'web-hosting': {
    title: 'Web Hosting',
    subtitle: 'Hosting Web',
    description: 'Hosting web de alto rendimiento con cPanel, SSL gratis, y soporte WordPress optimizado.',
    icon: Globe,
    color: 'from-blue-500 to-cyan-600',
    plans: [
      {
        id: 'web-basic',
        name: 'Basic',
        description: 'Para blogs y webs personales',
        price: 3.99,
        billingCycle: 'mes',
        popular: false,
        features: [
          '10GB SSD',
          '1 Sitio web',
          'SSL Gratis',
          '100GB Transferencia',
          'cPanel',
          '5 Cuentas email',
        ],
        specs: {
          Storage: '10GB SSD',
          Bandwidth: '100GB/mes',
          Databases: '1 MySQL',
          'Email Accounts': '5',
        },
      },
      {
        id: 'web-business',
        name: 'Business',
        description: 'Para negocios y tiendas',
        price: 7.99,
        originalPrice: 12.99,
        billingCycle: 'mes',
        popular: true,
        features: [
          '50GB SSD NVMe',
          'Sitios ilimitados',
          'SSL Gratis Wildcard',
          'Transferencia ilimitada',
          'cPanel + Softaculous',
          'Email ilimitado',
          'Backups diarios',
          'WordPress optimizado',
        ],
        specs: {
          Storage: '50GB NVMe',
          Bandwidth: 'Ilimitado',
          Databases: 'Ilimitado',
          'Email Accounts': 'Ilimitado',
        },
      },
      {
        id: 'web-enterprise',
        name: 'Enterprise',
        description: 'Para proyectos exigentes',
        price: 14.99,
        billingCycle: 'mes',
        popular: false,
        features: [
          '100GB SSD NVMe',
          'Sitios ilimitados',
          'SSL Gratis Wildcard',
          'Transferencia ilimitada',
          'cPanel + Softaculous',
          'Email ilimitado',
          'Backups cada 6h',
          'WordPress optimizado',
          'IP Dedicada',
          'Recursos garantizados',
        ],
        specs: {
          Storage: '100GB NVMe',
          Bandwidth: 'Ilimitado',
          Databases: 'Ilimitado',
          'Email Accounts': 'Ilimitado',
        },
      },
    ],
  },
  'vps': {
    title: 'VPS',
    subtitle: 'Servidores Virtuales',
    description: 'Servidores virtuales potentes con recursos garantizados, root access y total flexibilidad.',
    icon: Server,
    color: 'from-purple-500 to-violet-600',
    plans: [
      {
        id: 'vps-starter',
        name: 'VPS Starter',
        description: 'Para proyectos pequeños',
        price: 4.99,
        billingCycle: 'mes',
        popular: false,
        features: [
          '2GB RAM',
          '1 vCPU',
          '40GB NVMe',
          '2TB Transferencia',
          'IPv4 + IPv6',
          'Panel VPS',
          'Root Access',
        ],
        specs: {
          RAM: '2GB DDR4',
          CPU: '1 vCore',
          Storage: '40GB NVMe',
          Network: '1Gbps',
        },
      },
      {
        id: 'vps-pro',
        name: 'VPS Pro',
        description: 'Para aplicaciones medianas',
        price: 9.99,
        originalPrice: 14.99,
        billingCycle: 'mes',
        popular: true,
        features: [
          '4GB RAM',
          '2 vCPU',
          '80GB NVMe',
          '4TB Transferencia',
          'IPv4 + IPv6',
          'Panel VPS',
          'Root Access',
          'Backups semanales',
          'Snapshots',
        ],
        specs: {
          RAM: '4GB DDR4',
          CPU: '2 vCore',
          Storage: '80GB NVMe',
          Network: '1Gbps',
        },
      },
      {
        id: 'vps-business',
        name: 'VPS Business',
        description: 'Para aplicaciones exigentes',
        price: 19.99,
        billingCycle: 'mes',
        popular: false,
        features: [
          '8GB RAM',
          '4 vCPU',
          '160GB NVMe',
          '8TB Transferencia',
          'IPv4 + IPv6',
          'Panel VPS',
          'Root Access',
          'Backups diarios',
          'Snapshots ilimitados',
          'Soporte prioritario',
        ],
        specs: {
          RAM: '8GB DDR4',
          CPU: '4 vCore',
          Storage: '160GB NVMe',
          Network: '10Gbps',
        },
      },
      {
        id: 'vps-enterprise',
        name: 'VPS Enterprise',
        description: 'Máximo rendimiento',
        price: 39.99,
        billingCycle: 'mes',
        popular: false,
        features: [
          '16GB RAM',
          '8 vCPU',
          '320GB NVMe',
          'Transferencia ilimitada',
          'IPv4 + IPv6',
          'Panel VPS',
          'Root Access',
          'Backups cada 6h',
          'Snapshots ilimitados',
          'Soporte 24/7 dedicado',
          'DDoS Pro',
        ],
        specs: {
          RAM: '16GB DDR4',
          CPU: '8 vCore',
          Storage: '320GB NVMe',
          Network: '10Gbps',
        },
      },
    ],
  },
  'dedicated': {
    title: 'Servidores Dedicados',
    subtitle: 'Dedicados',
    description: 'Hardware dedicado exclusivo con máximo rendimiento y control total sobre tu infraestructura.',
    icon: HardDrive,
    color: 'from-orange-500 to-red-600',
    plans: [
      {
        id: 'dedi-starter',
        name: 'Dedicated Starter',
        description: 'Entrada al mundo dedicado',
        price: 49.99,
        billingCycle: 'mes',
        popular: false,
        features: [
          '32GB RAM DDR4',
          'Intel Xeon E-2136',
          '2x 500GB NVMe',
          '10TB Transferencia',
          'IPv4 + /64 IPv6',
          'KVM/IPMI',
          'Root Access',
          'DDoS Pro 1Tbps',
        ],
        specs: {
          RAM: '32GB DDR4 ECC',
          CPU: 'Intel Xeon E-2136',
          Storage: '2x 500GB NVMe',
          Network: '1Gbps',
        },
      },
      {
        id: 'dedi-pro',
        name: 'Dedicated Pro',
        description: 'Para proyectos exigentes',
        price: 99.99,
        originalPrice: 149.99,
        billingCycle: 'mes',
        popular: true,
        features: [
          '64GB RAM DDR4',
          'AMD EPYC 7443P',
          '2x 1TB NVMe',
          '30TB Transferencia',
          'IPv4 + /64 IPv6',
          'KVM/IPMI',
          'Root Access',
          'DDoS Pro 5Tbps',
          'Soporte prioritario',
        ],
        specs: {
          RAM: '64GB DDR4 ECC',
          CPU: 'AMD EPYC 7443P',
          Storage: '2x 1TB NVMe',
          Network: '10Gbps',
        },
      },
      {
        id: 'dedi-enterprise',
        name: 'Dedicated Enterprise',
        description: 'Máximo poder',
        price: 199.99,
        billingCycle: 'mes',
        popular: false,
        features: [
          '128GB RAM DDR4',
          'AMD EPYC 7543P',
          '4x 2TB NVMe',
          'Transferencia ilimitada',
          'IPv4 + /64 IPv6',
          'KVM/IPMI',
          'Root Access',
          'DDoS Pro 10Tbps',
          'Soporte 24/7 dedicado',
          'SLA 99.99%',
        ],
        specs: {
          RAM: '128GB DDR4 ECC',
          CPU: 'AMD EPYC 7543P',
          Storage: '4x 2TB NVMe',
          Network: '10Gbps',
        },
      },
    ],
  },
  'domains': {
    title: 'Dominios',
    subtitle: 'Registro de Dominios',
    description: 'Registra tu dominio perfecto con WHOIS Privacy gratis y DNS management incluido.',
    icon: Globe,
    color: 'from-teal-500 to-green-600',
    plans: [
      {
        id: 'domain-com',
        name: '.COM',
        description: 'El más popular',
        price: 9.99,
        billingCycle: 'año',
        popular: true,
        features: [
          'WHOIS Privacy gratis',
          'DNS Management',
          'Forwarding gratis',
          'Renovación automática',
          'Transferencia fácil',
        ],
        specs: {},
      },
      {
        id: 'domain-es',
        name: '.ES',
        description: 'Para España',
        price: 7.99,
        billingCycle: 'año',
        popular: false,
        features: [
          'WHOIS Privacy gratis',
          'DNS Management',
          'Forwarding gratis',
          'Renovación automática',
          'Transferencia fácil',
        ],
        specs: {},
      },
      {
        id: 'domain-net',
        name: '.NET',
        description: 'Para tecnología',
        price: 11.99,
        billingCycle: 'año',
        popular: false,
        features: [
          'WHOIS Privacy gratis',
          'DNS Management',
          'Forwarding gratis',
          'Renovación automática',
          'Transferencia fácil',
        ],
        specs: {},
      },
    ],
  },
};

const ServicesPage = () => {
  const { category } = useParams<{ category: ServiceCategory }>();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const { addItem } = useCartStore();

  const service = category ? servicesData[category] : null;

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Servicio no encontrado</h1>
          <Link to="/services/game-hosting">
            <Button variant="primary">Ver servicios disponibles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = (plan: ServicePlan) => {
    const finalPrice = billingCycle === 'annually' ? plan.price * 10 : plan.price;
    
    addItem({
      productId: category!,
      planId: plan.id,
      productName: service.title,
      planName: plan.name,
      price: finalPrice,
      billingCycle: billingCycle === 'annually' ? 'Anual' : 'Mensual',
      quantity: 1,
    });

    toast.success('¡Añadido al carrito!', `${plan.name} ha sido añadido`);
  };

  const features = [
    { icon: Zap, text: 'Activación instantánea' },
    { icon: Shield, text: 'Protección DDoS' },
    { icon: Clock, text: 'Uptime 99.99%' },
    { icon: HeadphonesIcon, text: 'Soporte 24/7' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 to-dark-950" />
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r ${service.color} opacity-20 blur-3xl`} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${service.color} flex items-center justify-center mx-auto mb-6`}>
              <service.icon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {service.title}
            </h1>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-8">
              {service.description}
            </p>

            {/* Features bar */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-dark-300">
                  <feature.icon className="w-5 h-5 text-primary-400" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Billing toggle */}
      <section className="relative -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="inline-flex items-center bg-dark-900 border border-dark-800 rounded-xl p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingCycle('annually')}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'annually'
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                Anual
                <Badge variant="success">-17%</Badge>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className={`grid gap-8 ${
              service.plans.length === 3
                ? 'md:grid-cols-3'
                : service.plans.length === 4
                ? 'md:grid-cols-2 lg:grid-cols-4'
                : 'md:grid-cols-2'
            }`}
          >
            {service.plans.map((plan) => {
              const monthlyPrice = plan.price;
              const yearlyPrice = plan.price * 10;
              const displayPrice = billingCycle === 'annually' ? yearlyPrice : monthlyPrice;

              return (
                <motion.div
                  key={plan.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Card
                    className={`h-full relative ${
                      plan.popular ? 'border-primary-500 shadow-glow' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="primary">Más Popular</Badge>
                      </div>
                    )}

                    <CardContent className="flex flex-col h-full">
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                        <p className="text-dark-400 text-sm">{plan.description}</p>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-white">
                            €{displayPrice.toFixed(2)}
                          </span>
                          <span className="text-dark-400">
                            /{billingCycle === 'annually' ? 'año' : plan.billingCycle}
                          </span>
                        </div>
                        {plan.originalPrice && (
                          <p className="text-dark-500 line-through text-sm mt-1">
                            €{(billingCycle === 'annually' ? plan.originalPrice * 10 : plan.originalPrice).toFixed(2)}
                          </p>
                        )}
                        {billingCycle === 'annually' && (
                          <p className="text-success-400 text-sm mt-1">
                            Ahorras €{(monthlyPrice * 2).toFixed(2)}/año
                          </p>
                        )}
                      </div>

                      {/* Specs */}
                      {Object.keys(plan.specs).length > 0 && (
                        <div className="mb-6 p-4 bg-dark-800/50 rounded-xl space-y-2">
                          {Object.entries(plan.specs).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-dark-400">{key}</span>
                              <span className="text-white font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Features */}
                      <ul className="space-y-3 mb-8 flex-grow">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-3 text-dark-300 text-sm">
                            <Check className="w-4 h-4 text-success-400 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={plan.popular ? 'primary' : 'secondary'}
                        className="w-full"
                        onClick={() => handleAddToCart(plan)}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Seleccionar Plan
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-dark-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-12">
            <span className="text-white">Preguntas</span>{' '}
            <span className="gradient-text">Frecuentes</span>
          </h2>

          <div className="space-y-4">
            {[
              {
                q: '¿Cuánto tiempo tarda la activación?',
                a: 'La mayoría de nuestros servicios se activan de forma instantánea después del pago. En el caso de servidores dedicados, puede tomar hasta 24 horas.',
              },
              {
                q: '¿Puedo cambiar de plan después?',
                a: 'Sí, puedes actualizar o cambiar tu plan en cualquier momento desde tu panel de control. Los cambios se aplican de forma inmediata.',
              },
              {
                q: '¿Ofrecen garantía de devolución?',
                a: 'Sí, ofrecemos una garantía de devolución de 30 días sin preguntas en todos nuestros planes.',
              },
              {
                q: '¿Qué métodos de pago aceptan?',
                a: 'Aceptamos PayPal, tarjetas de crédito/débito (Visa, Mastercard, American Express), y criptomonedas.',
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 text-white font-medium">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-dark-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-dark-300">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
