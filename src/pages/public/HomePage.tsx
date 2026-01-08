import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Globe,
  Server,
  HardDrive,
  Shield,
  Zap,
  Clock,
  HeadphonesIcon,
  ChevronRight,
  Star,
  Check,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useSiteConfigStore, type GameCategory, type ServiceCategory } from '../../stores';
import { useEffect } from 'react';

// Icon mapping for dynamic icons
const iconMap: Record<string, LucideIcon> = {
  Gamepad2,
  Globe,
  Server,
  HardDrive,
  Shield,
  Zap,
  Clock,
  HeadphonesIcon,
};

const HomePage = () => {
  const { config, loadConfig } = useSiteConfigStore();
  const { hero, stats, serviceCategories, gameCategories } = config;

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Filtrar categorías habilitadas y ordenar
  const enabledServices = serviceCategories
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
  
  const enabledGames = gameCategories
    .filter((g) => g.enabled)
    .sort((a, b) => a.order - b.order);
  
  const enabledStats = stats
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const features = [
    {
      icon: Shield,
      title: 'Protección DDoS',
      description: 'Protección avanzada contra ataques DDoS incluida en todos los planes.',
    },
    {
      icon: Zap,
      title: 'Rendimiento Extremo',
      description: 'Hardware de última generación con procesadores AMD EPYC y NVMe.',
    },
    {
      icon: Clock,
      title: 'Uptime 99.99%',
      description: 'Garantizamos la disponibilidad de tus servicios con nuestro SLA.',
    },
    {
      icon: HeadphonesIcon,
      title: 'Soporte 24/7',
      description: 'Equipo de expertos disponible las 24 horas para ayudarte.',
    },
  ];

  const testimonials = [
    {
      name: 'Carlos M.',
      role: 'Dueño de servidor Minecraft',
      content: 'Increíble servicio. Mi servidor de Minecraft funciona perfectamente con más de 100 jugadores simultáneos.',
      rating: 5,
    },
    {
      name: 'Laura P.',
      role: 'Desarrolladora Web',
      content: 'El hosting web es super rápido y el soporte siempre resuelve mis dudas en minutos.',
      rating: 5,
    },
    {
      name: 'Miguel R.',
      role: 'Administrador de Sistemas',
      content: 'Los VPS tienen un rendimiento excelente. Migré mi empresa desde otro proveedor y no me arrepiento.',
      rating: 5,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Función para renderizar el icono de un servicio
  const renderServiceIcon = (service: ServiceCategory) => {
    const IconComponent = iconMap[service.icon] || Gamepad2;
    return <IconComponent className="w-7 h-7 text-white" />;
  };

  // Función para renderizar la imagen o icono de un juego
  const renderGameCard = (game: GameCategory, index: number) => {
    const hasImage = game.image && game.image.trim() !== '';
    
    return (
      <motion.div
        key={game.id}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="aspect-square bg-dark-800/50 border border-dark-700 rounded-2xl flex items-center justify-center overflow-hidden hover:border-primary-500/50 hover:bg-dark-800 transition-all group relative"
      >
        {hasImage ? (
          <>
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Si la imagen falla, mostrar el nombre
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/30 to-transparent" />
            <span className="absolute bottom-2 left-2 right-2 text-sm font-medium text-white text-center z-10">
              {game.name}
            </span>
            {/* Fallback text hidden by default */}
            <span className="hidden text-sm font-medium text-dark-300 text-center p-4">
              {game.name}
            </span>
          </>
        ) : (
          <span className="text-sm font-medium text-dark-300 text-center p-4">{game.name}</span>
        )}
      </motion.div>
    );
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/50 via-dark-950 to-dark-950" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            {hero.showBadge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/20 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium mb-8"
              >
                <Zap className="w-4 h-4" />
                {hero.badge}
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            )}

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
              <span className="text-white">{hero.title}</span>
              <br />
              <span className="gradient-text">{hero.highlightedTitle}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-dark-300 max-w-3xl mx-auto mb-10">
              {hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to={hero.primaryButtonLink}>
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  {hero.primaryButtonText}
                </Button>
              </Link>
              <Link to={hero.secondaryButtonLink}>
                <Button variant="secondary" size="lg">
                  {hero.secondaryButtonText}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {enabledStats.map((stat) => (
                <motion.div
                  key={stat.id}
                  variants={itemVariants}
                  className="text-center"
                >
                  <p className="text-4xl font-bold gradient-text mb-2">{stat.value}</p>
                  <p className="text-dark-400">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-dark-600 rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 bg-primary-500 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title mb-4">
              <span className="text-white">Nuestros</span>{' '}
              <span className="gradient-text">Servicios</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Soluciones de hosting para cada necesidad. Desde servidores de juegos hasta
              infraestructura empresarial.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {enabledServices.map((service) => (
              <motion.div key={service.id} variants={itemVariants}>
                <Link to={`/services/${service.slug}`}>
                  <Card hover className="h-full relative overflow-hidden group">
                    {service.popular && (
                      <div className="absolute top-4 right-4">
                        <span className="badge badge-primary">Popular</span>
                      </div>
                    )}
                    <CardContent>
                      {service.image ? (
                        <div className="w-14 h-14 rounded-2xl overflow-hidden mb-6 group-hover:scale-110 transition-transform">
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                          {renderServiceIcon(service)}
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-white mb-3">{service.name}</h3>
                      <p className="text-dark-400 mb-4">{service.description}</p>
                      <p className="text-primary-400 font-semibold">{service.price}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title mb-4">
              <span className="text-white">¿Por qué</span>{' '}
              <span className="gradient-text">Elegirnos?</span>
            </h2>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto">
              Tecnología de vanguardia y un equipo comprometido con tu éxito.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-600/20 to-accent-600/20 flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-dark-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Game Hosting Highlight */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/50 to-dark-950" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl -translate-y-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="badge badge-accent mb-6">Game Hosting</span>
              <h2 className="section-title mb-6">
                <span className="text-white">Servidores de Juegos</span>
                <br />
                <span className="gradient-text">Sin Lag, Sin Límites</span>
              </h2>
              <p className="text-dark-300 text-lg mb-8">
                Nuestros servidores de juegos están optimizados para ofrecer la mejor
                experiencia posible. Hardware de última generación, ubicaciones estratégicas
                y protección DDoS incluida.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  'Más de 50 juegos soportados',
                  'Panel de control intuitivo',
                  'Instalación de mods automática',
                  'Backups automáticos diarios',
                  'Protección DDoS avanzada',
                  'Soporte especializado 24/7',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-dark-300">
                    <Check className="w-5 h-5 text-success-400" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link to="/services/game-hosting">
                <Button variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Ver Planes de Game Hosting
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-3 gap-4">
                {enabledGames.slice(0, 9).map((game, index) => renderGameCard(game, index))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title mb-4">
              <span className="text-white">Lo que dicen</span>{' '}
              <span className="gradient-text">Nuestros Clientes</span>
            </h2>
            <div className="flex items-center justify-center gap-2 text-warning-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
              <span className="text-white font-semibold ml-2">4.9/5</span>
              <span className="text-dark-400">basado en 10,000+ reseñas</span>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full">
                  <CardContent>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-warning-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-dark-300 mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center text-white font-semibold">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{testimonial.name}</p>
                        <p className="text-sm text-dark-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-accent-600/20 to-primary-600/20" />
        <div className="absolute inset-0 bg-dark-950/90" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-6">
              <span className="text-white">¿Listo para</span>{' '}
              <span className="gradient-text">Empezar?</span>
            </h2>
            <p className="text-dark-300 text-lg mb-8 max-w-2xl mx-auto">
              Únete a miles de clientes satisfechos. Configura tu servidor en minutos
              con nuestra instalación automática.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Crear Cuenta Gratis
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">
                  Hablar con un Experto
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
