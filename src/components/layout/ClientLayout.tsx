import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import { ToastContainer } from '../ui/Toast';
import { useAuthStore } from '../../stores';
import { PageLoading } from '../ui/Loading';
import ClientSidebar from './ClientSidebar';
import ChatAssistant from '../chat/ChatAssistant';

const ClientLayout = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      <ClientSidebar />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 pb-8 px-6 min-h-screen lg:ml-64"
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </motion.main>
      
      {/* Chat Assistant Bot */}
      <ChatAssistant />
      
      <ToastContainer />
    </div>
  );
};

export default ClientLayout;
