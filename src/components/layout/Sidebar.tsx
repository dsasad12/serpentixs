import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Server,
  FileText,
  MessageSquare,
  CreditCard,
  Settings,
  HelpCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  Package,
  FolderTree,
  Wallet,
  Plug,
  Palette,
  MessageCircle,
} from 'lucide-react';
import { useUIStore } from '../../stores';

interface SidebarProps {
  variant: 'client' | 'admin';
}

const Sidebar = ({ variant }: SidebarProps) => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();

  const clientLinks = [
    { name: 'Dashboard', href: '/client', icon: LayoutDashboard },
    { name: 'Mis Servicios', href: '/client/services', icon: Server },
    { name: 'Facturas', href: '/client/invoices', icon: FileText },
    { name: 'Tickets de Soporte', href: '/client/tickets', icon: MessageSquare },
    { name: 'Añadir Fondos', href: '/client/add-funds', icon: CreditCard },
    { name: 'Configuración', href: '/client/settings', icon: Settings },
    { name: 'Base de Conocimiento', href: '/client/knowledgebase', icon: HelpCircle },
  ];

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Clientes', href: '/admin/clients', icon: Users },
    { name: 'Servicios', href: '/admin/services', icon: Server },
    { name: 'Facturas', href: '/admin/invoices', icon: FileText },
    { name: 'Tickets', href: '/admin/tickets', icon: MessageSquare },
    { name: 'Productos', href: '/admin/products', icon: Package },
    { name: 'Categorías', href: '/admin/categories', icon: FolderTree },
    { name: 'Pagos', href: '/admin/payments', icon: Wallet },
    { name: 'Integraciones', href: '/admin/integrations', icon: Plug },
    { name: 'Discord', href: '/admin/discord', icon: MessageCircle },
    { name: 'Personalización', href: '/admin/customization', icon: Palette },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
  ];

  const links = variant === 'client' ? clientLinks : adminLinks;
  const basePath = variant === 'client' ? '/client' : '/admin';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => toggleSidebar()}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className={`
          fixed left-0 top-0 bottom-0 z-40
          bg-dark-900/95 backdrop-blur-xl border-r border-dark-800
          pt-24 pb-6 flex flex-col
          transform lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform lg:transition-none
        `}
      >
        {/* Toggle button */}
        <button
          onClick={() => toggleSidebar()}
          className="absolute -right-3 top-28 w-6 h-6 bg-dark-800 border border-dark-700 rounded-full flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors hidden lg:flex"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto scrollbar-thin">
          {links.map((link) => {
            const isActive = location.pathname === link.href || 
              (link.href !== basePath && location.pathname.startsWith(link.href));

            return (
              <NavLink
                key={link.name}
                to={link.href}
                className={`
                  sidebar-link
                  ${isActive ? 'active' : ''}
                  ${!sidebarOpen ? '!justify-center !px-3' : ''}
                `}
                title={!sidebarOpen ? link.name : undefined}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span>{link.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick action */}
        {sidebarOpen && (
          <div className="px-4 mt-auto">
            <NavLink
              to={variant === 'client' ? '/services' : '/admin/products/new'}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl text-white font-medium hover:from-primary-500 hover:to-accent-500 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {variant === 'client' ? 'Nuevo Servicio' : 'Nuevo Producto'}
            </NavLink>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;
