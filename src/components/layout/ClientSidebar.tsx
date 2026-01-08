import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Server,
  FileText,
  MessageSquare,
  ShoppingCart,
  Settings,
  HelpCircle,
  Plus,
  Headphones,
  CreditCard,
} from 'lucide-react';
import { useSiteConfigStore } from '../../stores';

const ClientSidebar = () => {
  const location = useLocation();
  const { config } = useSiteConfigStore();
  const { branding } = config;

  const clientLinks = [
    { name: 'Dashboard', href: '/client', icon: LayoutDashboard },
    { name: 'Mis Servicios', href: '/client/services', icon: Server },
    { name: 'Contratar Servicio', href: '/client/order', icon: ShoppingCart },
    { name: 'Facturas', href: '/client/invoices', icon: FileText },
    { name: 'Tickets de Soporte', href: '/client/tickets', icon: MessageSquare },
    { name: 'Soporte en Vivo', href: '/client/live-support', icon: Headphones },
    { name: 'Añadir Fondos', href: '/client/add-funds', icon: CreditCard },
    { name: 'Base de Conocimiento', href: '/client/knowledgebase', icon: HelpCircle },
    { name: 'Configuración', href: '/client/settings', icon: Settings },
  ];

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed left-0 top-0 bottom-0 z-30 w-64 bg-dark-900/95 backdrop-blur-xl border-r border-dark-800 pt-24 pb-6 flex flex-col hidden lg:flex"
      >
        {/* Logo/Brand */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{branding.siteName?.[0] || 'S'}</span>
            </div>
            <div>
              <h2 className="font-semibold text-white">{branding.siteName}</h2>
              <p className="text-xs text-dark-400">Área de Cliente</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          {clientLinks.map((link) => {
            const isActive = location.pathname === link.href || 
              (link.href !== '/client' && location.pathname.startsWith(link.href));

            return (
              <NavLink
                key={link.name}
                to={link.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' 
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                  }
                `}
              >
                <link.icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                <span>{link.name}</span>
                {link.href === '/client/tickets' && (
                  <span className="ml-auto px-2 py-0.5 text-xs bg-primary-600/30 text-primary-400 rounded-full">
                    2
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick action */}
        <div className="px-4 mt-4">
          <NavLink
            to="/client/order"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl text-white font-medium hover:from-primary-500 hover:to-accent-500 transition-colors shadow-lg shadow-primary-600/25"
          >
            <Plus className="w-5 h-5" />
            Contratar Servicio
          </NavLink>
        </div>

        {/* Support info */}
        <div className="px-4 mt-4">
          <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="w-4 h-4 text-success-400" />
              <span className="text-sm font-medium text-white">Soporte 24/7</span>
            </div>
            <p className="text-xs text-dark-400 mb-3">
              ¿Necesitas ayuda? Nuestro equipo está disponible para ti.
            </p>
            <NavLink
              to="/client/live-support"
              className="block text-center text-xs text-primary-400 hover:text-primary-300 font-medium"
            >
              Iniciar Chat en Vivo →
            </NavLink>
          </div>
        </div>
      </motion.aside>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-dark-900/95 backdrop-blur-xl border-t border-dark-800 lg:hidden">
        <nav className="flex items-center justify-around py-2">
          {clientLinks.slice(0, 5).map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <NavLink
                key={link.name}
                to={link.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 ${
                  isActive ? 'text-primary-400' : 'text-dark-400'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="text-xs">{link.name.split(' ')[0]}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default ClientSidebar;
