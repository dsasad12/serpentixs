import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { ToastContainer } from '../ui/Toast';
import { useAuthStore, useUIStore } from '../../stores';
import { PageLoading } from '../ui/Loading';

interface DashboardLayoutProps {
  variant: 'client' | 'admin';
}

const DashboardLayout = ({ variant }: DashboardLayoutProps) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (variant === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/client" replace />;
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      <Sidebar variant={variant} />
      
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
        className="pt-24 pb-8 px-6 min-h-screen"
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </motion.main>
      
      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
