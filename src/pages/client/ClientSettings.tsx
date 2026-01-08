import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Key,
  Bell,
  Globe,
  CreditCard,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import type { Tab } from '../../components/ui/Tabs';

const ClientSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Mock user data
  const user = {
    name: 'Carlos García',
    email: 'carlos@example.com',
    phone: '+34 612 345 678',
    company: 'Tech Solutions SL',
    address: 'Calle Principal 123',
    city: 'Madrid',
    postalCode: '28001',
    country: 'ES',
    taxId: 'B12345678',
    createdAt: '2024-01-15',
  };

  const countries = [
    { value: 'ES', label: 'España' },
    { value: 'MX', label: 'México' },
    { value: 'AR', label: 'Argentina' },
    { value: 'CO', label: 'Colombia' },
    { value: 'CL', label: 'Chile' },
    { value: 'PE', label: 'Perú' },
    { value: 'US', label: 'Estados Unidos' },
  ];

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
  ];

  const timezones = [
    { value: 'Europe/Madrid', label: 'Madrid (UTC+1)' },
    { value: 'America/Mexico_City', label: 'Ciudad de México (UTC-6)' },
    { value: 'America/Buenos_Aires', label: 'Buenos Aires (UTC-3)' },
    { value: 'America/New_York', label: 'Nueva York (UTC-5)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (UTC-8)' },
  ];

  const tabs: Tab[] = [
    { id: 'profile', label: 'Perfil', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Seguridad', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notificaciones', icon: <Bell className="w-4 h-4" /> },
    { id: 'billing', label: 'Facturación', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Configuración</h1>
        <p className="text-dark-400 mt-1">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nombre completo"
                    defaultValue={user.name}
                    leftIcon={<User className="w-5 h-5" />}
                  />
                  <Input
                    label="Correo electrónico"
                    type="email"
                    defaultValue={user.email}
                    leftIcon={<Mail className="w-5 h-5" />}
                  />
                  <Input
                    label="Teléfono"
                    type="tel"
                    defaultValue={user.phone}
                    leftIcon={<Phone className="w-5 h-5" />}
                  />
                  <Input
                    label="Empresa (opcional)"
                    defaultValue={user.company}
                  />
                </div>

                <div className="pt-4 border-t border-dark-800">
                  <h4 className="text-white font-medium mb-4">Dirección</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input
                        label="Dirección"
                        defaultValue={user.address}
                        leftIcon={<MapPin className="w-5 h-5" />}
                      />
                    </div>
                    <Input
                      label="Ciudad"
                      defaultValue={user.city}
                    />
                    <Input
                      label="Código postal"
                      defaultValue={user.postalCode}
                    />
                    <Select
                      label="País"
                      options={countries}
                      defaultValue={user.country}
                    />
                    <Input
                      label="NIF/CIF (para facturación)"
                      defaultValue={user.taxId}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preferences */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Idioma"
                  options={languages}
                  defaultValue="es"
                />
                <Select
                  label="Zona horaria"
                  options={timezones}
                  defaultValue="Europe/Madrid"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de la cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-400">ID de cliente</span>
                  <span className="text-white font-mono">#12345</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Miembro desde</span>
                  <span className="text-white">{user.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Estado</span>
                  <Badge variant="success">Activo</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary-400" />
                Cambiar Contraseña
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input
                  label="Contraseña actual"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-dark-400 hover:text-white"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                />
                <Input
                  label="Nueva contraseña"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-dark-400 hover:text-white"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                />
                <Input
                  label="Confirmar nueva contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-dark-400 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                />

                {/* Password Requirements */}
                <div className="p-4 bg-dark-800/50 rounded-lg">
                  <p className="text-dark-400 text-sm mb-2">La contraseña debe contener:</p>
                  <ul className="space-y-1 text-sm">
                    {[
                      { text: 'Mínimo 8 caracteres', met: true },
                      { text: 'Al menos una letra mayúscula', met: true },
                      { text: 'Al menos una letra minúscula', met: true },
                      { text: 'Al menos un número', met: false },
                      { text: 'Al menos un carácter especial', met: false },
                    ].map((req, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {req.met ? (
                          <Check className="w-4 h-4 text-success-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-dark-500" />
                        )}
                        <span className={req.met ? 'text-success-400' : 'text-dark-500'}>
                          {req.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="primary" className="w-full">
                  Actualizar Contraseña
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary-400" />
                Autenticación de Dos Factores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      twoFactorEnabled ? 'bg-success-500/20' : 'bg-dark-700'
                    }`}>
                      <Shield className={`w-6 h-6 ${
                        twoFactorEnabled ? 'text-success-400' : 'text-dark-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {twoFactorEnabled ? '2FA Activado' : '2FA Desactivado'}
                      </p>
                      <p className="text-dark-400 text-sm">
                        {twoFactorEnabled
                          ? 'Tu cuenta está protegida'
                          : 'Añade una capa extra de seguridad'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={twoFactorEnabled ? 'success' : 'warning'}>
                    {twoFactorEnabled ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>

                {!twoFactorEnabled ? (
                  <div className="space-y-4">
                    <p className="text-dark-300">
                      La autenticación de dos factores añade una capa adicional de seguridad a tu cuenta.
                      Además de tu contraseña, necesitarás un código de tu teléfono móvil para iniciar sesión.
                    </p>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => setTwoFactorEnabled(true)}
                    >
                      Activar 2FA
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-dark-800 rounded-lg">
                      <p className="text-dark-400 text-sm mb-2">Códigos de respaldo</p>
                      <p className="text-dark-300 text-sm">
                        Guarda estos códigos en un lugar seguro. Los necesitarás si pierdes acceso a tu dispositivo 2FA.
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {['A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6'].map((code) => (
                          <code key={code} className="bg-dark-900 px-3 py-2 rounded text-center text-sm font-mono text-white">
                            {code}
                          </code>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => setTwoFactorEnabled(false)}
                    >
                      Desactivar 2FA
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sesiones Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    device: 'Chrome en Windows',
                    location: 'Madrid, España',
                    ip: '192.168.1.1',
                    current: true,
                    lastActive: 'Activa ahora',
                  },
                  {
                    device: 'Safari en iPhone',
                    location: 'Madrid, España',
                    ip: '192.168.1.2',
                    current: false,
                    lastActive: 'Hace 2 horas',
                  },
                  {
                    device: 'Firefox en MacOS',
                    location: 'Barcelona, España',
                    ip: '192.168.1.3',
                    current: false,
                    lastActive: 'Hace 3 días',
                  },
                ].map((session, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-dark-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{session.device}</p>
                          {session.current && (
                            <Badge variant="success" size="sm">
                              Actual
                            </Badge>
                          )}
                        </div>
                        <p className="text-dark-500 text-sm">
                          {session.location} • {session.ip}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-dark-400 text-sm">{session.lastActive}</span>
                      {!session.current && (
                        <Button variant="ghost" size="sm">
                          Cerrar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-dark-800">
                <Button variant="danger" size="sm">
                  Cerrar todas las sesiones excepto la actual
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Preferencias de Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  title: 'Facturas y Pagos',
                  description: 'Recibe notificaciones sobre nuevas facturas y confirmaciones de pago',
                  email: true,
                  push: true,
                },
                {
                  title: 'Servicios',
                  description: 'Alertas sobre el estado de tus servicios y renovaciones',
                  email: true,
                  push: true,
                },
                {
                  title: 'Tickets de Soporte',
                  description: 'Notificaciones cuando hay respuestas a tus tickets',
                  email: true,
                  push: true,
                },
                {
                  title: 'Promociones',
                  description: 'Ofertas especiales y descuentos exclusivos',
                  email: false,
                  push: false,
                },
                {
                  title: 'Novedades del Producto',
                  description: 'Actualizaciones sobre nuevas características y servicios',
                  email: true,
                  push: false,
                },
                {
                  title: 'Alertas de Seguridad',
                  description: 'Notificaciones de inicio de sesión y cambios de seguridad',
                  email: true,
                  push: true,
                },
              ].map((pref, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{pref.title}</p>
                    <p className="text-dark-400 text-sm">{pref.description}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={pref.email}
                        className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-dark-400 text-sm">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={pref.push}
                        className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-dark-400 text-sm">Push</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-6">
              <Button variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                Guardar Preferencias
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: 'visa',
                    last4: '4242',
                    expiry: '12/25',
                    default: true,
                  },
                  {
                    type: 'mastercard',
                    last4: '8888',
                    expiry: '06/26',
                    default: false,
                  },
                ].map((card, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-colors ${
                      card.default
                        ? 'bg-primary-500/10 border-primary-500/30'
                        : 'bg-dark-800/50 border-dark-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-dark-900 uppercase">
                            {card.type}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            •••• •••• •••• {card.last4}
                          </p>
                          <p className="text-dark-400 text-sm">Expira {card.expiry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {card.default && (
                          <Badge variant="primary" size="sm">
                            Por defecto
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Añadir Método de Pago
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing Info */}
          <Card>
            <CardHeader>
              <CardTitle>Datos de Facturación</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input
                  label="Nombre o Razón Social"
                  defaultValue={user.company || user.name}
                />
                <Input
                  label="NIF/CIF"
                  defaultValue={user.taxId}
                />
                <Input
                  label="Dirección de facturación"
                  defaultValue={user.address}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ciudad"
                    defaultValue={user.city}
                  />
                  <Input
                    label="Código postal"
                    defaultValue={user.postalCode}
                  />
                </div>
                <Select
                  label="País"
                  options={countries}
                  defaultValue={user.country}
                />
                <Button variant="primary" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Actualizar Datos
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Balance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Saldo de Cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl">
                <div>
                  <p className="text-dark-400">Saldo disponible</p>
                  <p className="text-4xl font-bold text-white">€0.00</p>
                  <p className="text-dark-400 text-sm mt-1">
                    El saldo se aplicará automáticamente a tus próximas facturas
                  </p>
                </div>
                <Button variant="primary" size="lg">
                  Añadir Fondos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default ClientSettings;
