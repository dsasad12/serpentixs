import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores';
import { useEffect } from 'react';

// Force update site config on version change
const SITE_CONFIG_VERSION = '2.1.0';
if (typeof window !== 'undefined') {
  const storedVersion = localStorage.getItem('site-config-version');
  if (storedVersion !== SITE_CONFIG_VERSION) {
    localStorage.removeItem('site-config-storage');
    localStorage.setItem('site-config-version', SITE_CONFIG_VERSION);
    window.location.reload();
  }
}

// Layouts
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ClientLayout from './components/layout/ClientLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import CartPage from './pages/public/CartPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Client Pages
import {
  ClientDashboard,
  ClientServices,
  ClientInvoices,
  ClientTickets,
  ClientSettings,
} from './pages/client';
import ClientLiveSupport from './pages/client/ClientLiveSupport';
import ClientOrder from './pages/client/ClientOrder';

// Admin Pages
import {
  AdminDashboard,
  AdminClients,
  AdminServices,
  AdminInvoices,
  AdminTickets,
  AdminProducts,
  AdminCategories,
  AdminSettings,
  AdminPaymentSettings,
  AdminIntegrations,
  AdminSiteCustomization,
  AdminDiscordSettings,
} from './pages/admin';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/client" replace />;
  }

  return <>{children}</>;
};

// Public Route - Redirect if authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/client'} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:category" element={<ServicesPage />} />
          <Route path="cart" element={<CartPage />} />
        </Route>

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Client Dashboard Routes */}
        <Route
          path="/client"
          element={
            <ProtectedRoute>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ClientDashboard />} />
          <Route path="services" element={<ClientServices />} />
          <Route path="invoices" element={<ClientInvoices />} />
          <Route path="tickets" element={<ClientTickets />} />
          <Route path="live-support" element={<ClientLiveSupport />} />
          <Route path="order" element={<ClientOrder />} />
          <Route path="settings" element={<ClientSettings />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="payments" element={<AdminPaymentSettings />} />
          <Route path="integrations" element={<AdminIntegrations />} />
          <Route path="discord" element={<AdminDiscordSettings />} />
          <Route path="customization" element={<AdminSiteCustomization />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch all - 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
