import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Bell,
  ChevronDown,
  Server,
  Globe,
  HardDrive,
  Gamepad2,
  LayoutDashboard,
  AtSign,
  Mail,
  Package,
} from 'lucide-react';
import { useAuthStore, useCartStore, useNotificationStore, useCatalogStore, useSiteConfigStore } from '../../stores';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Gamepad2,
  Globe,
  Server,
  HardDrive,
  AtSign,
  Mail,
  Package,
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hostingsMenuOpen, setHostingsMenuOpen] = useState(false);
  const [otherServicesMenuOpen, setOtherServicesMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const { unreadCount } = useNotificationStore();
  const { getCategoriesBySection } = useCatalogStore();
  const { config } = useSiteConfigStore();
  const { branding } = config;

  // Obtener categorías dinámicas por sección
  const hostingsCategories = getCategoriesBySection('hostings').filter(c => c.isActive);
  const otherServicesCategories = getCategoriesBySection('other-services').filter(c => c.isActive);

  const navLinks = [
    { name: 'Hostings', href: '#', menuType: 'hostings' },
    { name: 'Otros Servicios', href: '#', menuType: 'other-services' },
    { name: 'Precios', href: '/pricing' },
    { name: 'Nosotros', href: '/about' },
    { name: 'Contacto', href: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Package;
  };

  const getCategoryDescription = (slug: string): string => {
    const descriptions: Record<string, string> = {
      'game-hosting': 'Minecraft, Rust, ARK y más',
      'web-hosting': 'Hosting web de alta velocidad',
      'vps': 'Servidores virtuales potentes',
      'dedicated': 'Hardware dedicado exclusivo',
      'domains': 'Registra tu dominio',
      'email': 'Email profesional para tu negocio',
    };
    return descriptions[slug] || 'Servicios profesionales';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50" />
      
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              {branding.logoUrl && branding.logoUrl !== '/logo.svg' ? (
                <img 
                  src={branding.logoUrl} 
                  alt={branding.logoAlt || branding.siteName}
                  className="w-10 h-10 rounded-xl object-contain transform group-hover:scale-110 transition-transform"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <span className="text-xl font-bold text-white">{branding.siteName?.[0] || 'S'}</span>
                </div>
              )}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            </div>
            <span className="text-xl font-bold font-display">
              <span className="text-white">{branding.siteName}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              // Hostings Dropdown
              if (link.menuType === 'hostings') {
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setHostingsMenuOpen(true)}
                    onMouseLeave={() => setHostingsMenuOpen(false)}
                  >
                    <button className="nav-link flex items-center gap-1">
                      {link.name}
                      <ChevronDown className={`w-4 h-4 transition-transform ${hostingsMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {hostingsMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-80 bg-dark-900 border border-dark-800 rounded-2xl shadow-2xl overflow-hidden"
                        >
                          <div className="p-2">
                            {hostingsCategories.map((category) => {
                              const IconComponent = getIcon(category.icon);
                              return (
                                <Link
                                  key={category.id}
                                  to={`/services/${category.slug}`}
                                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-800 transition-colors group"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center group-hover:bg-primary-600/20 transition-colors">
                                    <IconComponent className="w-5 h-5 text-primary-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">{category.name}</p>
                                    <p className="text-sm text-dark-400">{getCategoryDescription(category.slug)}</p>
                                  </div>
                                </Link>
                              );
                            })}
                            {hostingsCategories.length === 0 && (
                              <p className="p-4 text-dark-500 text-center">No hay categorías disponibles</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              
              // Otros Servicios Dropdown
              if (link.menuType === 'other-services') {
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setOtherServicesMenuOpen(true)}
                    onMouseLeave={() => setOtherServicesMenuOpen(false)}
                  >
                    <button className="nav-link flex items-center gap-1">
                      {link.name}
                      <ChevronDown className={`w-4 h-4 transition-transform ${otherServicesMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {otherServicesMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-80 bg-dark-900 border border-dark-800 rounded-2xl shadow-2xl overflow-hidden"
                        >
                          <div className="p-2">
                            {otherServicesCategories.map((category) => {
                              const IconComponent = getIcon(category.icon);
                              return (
                                <Link
                                  key={category.id}
                                  to={`/services/${category.slug}`}
                                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-800 transition-colors group"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center group-hover:bg-accent-600/20 transition-colors">
                                    <IconComponent className="w-5 h-5 text-accent-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">{category.name}</p>
                                    <p className="text-sm text-dark-400">{getCategoryDescription(category.slug)}</p>
                                  </div>
                                </Link>
                              );
                            })}
                            {otherServicesCategories.length === 0 && (
                              <p className="p-4 text-dark-500 text-center">No hay categorías disponibles</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // Regular links
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-dark-400 hover:text-white transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link to="/client/notifications" className="relative p-2 text-dark-400 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-dark-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-white">
                      {user?.firstName}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-dark-900 border border-dark-800 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-dark-800">
                          <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                          <p className="text-sm text-dark-400">{user?.email}</p>
                          <Badge variant="primary" className="mt-2">
                            Saldo: €{user?.balance.toFixed(2)}
                          </Badge>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/client"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors text-dark-300 hover:text-white"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Panel de Cliente
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors text-dark-300 hover:text-white"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Settings className="w-4 h-4" />
                              Administración
                            </Link>
                          )}
                          <Link
                            to="/client/settings"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors text-dark-300 hover:text-white"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            Mi Cuenta
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-danger-600/20 transition-colors text-danger-400"
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Registrarse</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-dark-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-dark-800 overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {/* Hostings Mobile Section */}
                <div>
                  <p className="px-4 py-2 text-primary-400 font-medium flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Hostings
                  </p>
                  {hostingsCategories.map((category) => {
                    const IconComponent = getIcon(category.icon);
                    return (
                      <Link
                        key={category.id}
                        to={`/services/${category.slug}`}
                        className="flex items-center gap-3 px-6 py-2 text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <IconComponent className="w-4 h-4 text-primary-400" />
                        {category.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Otros Servicios Mobile Section */}
                <div>
                  <p className="px-4 py-2 text-accent-400 font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Otros Servicios
                  </p>
                  {otherServicesCategories.map((category) => {
                    const IconComponent = getIcon(category.icon);
                    return (
                      <Link
                        key={category.id}
                        to={`/services/${category.slug}`}
                        className="flex items-center gap-3 px-6 py-2 text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <IconComponent className="w-4 h-4 text-accent-400" />
                        {category.name}
                      </Link>
                    );
                  })}
                </div>

                <Link
                  to="/pricing"
                  className="block px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Precios
                </Link>
                <Link
                  to="/about"
                  className="block px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Nosotros
                </Link>
                <Link
                  to="/contact"
                  className="block px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contacto
                </Link>
                
                {!isAuthenticated && (
                  <div className="px-4 pt-4 space-y-2 border-t border-dark-800">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full">Iniciar Sesión</Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" className="w-full">Registrarse</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;
