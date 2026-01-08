import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Globe,
  Mail,
  CreditCard,
  Shield,
  Palette,
  Save,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import type { Tab } from '../../components/ui/Tabs';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const tabs: Tab[] = [
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'payments', label: 'Pagos', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'security', label: 'Seguridad', icon: <Shield className="w-4 h-4" /> },
    { id: 'appearance', label: 'Apariencia', icon: <Palette className="w-4 h-4" /> },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Configuración</h1>
          <p className="text-dark-400 mt-1">
            Gestiona la configuración del sistema
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-400" />
                Información del Sitio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nombre del Sitio"
                defaultValue="Serpentix Hosting"
              />
              <Input
                label="URL del Sitio"
                defaultValue="https://serpentix.com"
                leftIcon={<Globe className="w-5 h-5" />}
              />
              <Textarea
                label="Descripción"
                defaultValue="Servicios de hosting premium para gaming y empresas. Servidores de alto rendimiento con soporte 24/7."
                rows={3}
              />
              <Select
                label="Zona Horaria"
                options={[
                  { value: 'Europe/Madrid', label: 'Europe/Madrid (UTC+1)' },
                  { value: 'America/Mexico_City', label: 'America/Mexico_City (UTC-6)' },
                  { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
                ]}
                defaultValue="Europe/Madrid"
              />
              <Select
                label="Idioma por Defecto"
                options={[
                  { value: 'es', label: 'Español' },
                  { value: 'en', label: 'English' },
                  { value: 'pt', label: 'Português' },
                ]}
                defaultValue="es"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-400" />
                Configuración de Facturación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nombre de la Empresa"
                defaultValue="Serpentix Hosting SL"
              />
              <Input
                label="NIF/CIF"
                defaultValue="B12345678"
              />
              <Input
                label="Dirección"
                defaultValue="Calle Principal 123, 28001 Madrid"
              />
              <Select
                label="Moneda"
                options={[
                  { value: 'EUR', label: 'Euro (€)' },
                  { value: 'USD', label: 'US Dollar ($)' },
                  { value: 'MXN', label: 'Peso Mexicano (MXN)' },
                ]}
                defaultValue="EUR"
              />
              <Input
                label="IVA (%)"
                type="number"
                defaultValue="21"
              />
              <Input
                label="Prefijo de Factura"
                defaultValue="INV-"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary-400" />
                Configuración SMTP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Proveedor"
                options={[
                  { value: 'smtp', label: 'SMTP Personalizado' },
                  { value: 'sendgrid', label: 'SendGrid' },
                  { value: 'mailgun', label: 'Mailgun' },
                  { value: 'ses', label: 'Amazon SES' },
                ]}
                defaultValue="smtp"
              />
              <Input
                label="Servidor SMTP"
                defaultValue="mail.serpentix.com"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Puerto"
                  type="number"
                  defaultValue="587"
                />
                <Select
                  label="Encriptación"
                  options={[
                    { value: 'tls', label: 'TLS' },
                    { value: 'ssl', label: 'SSL' },
                    { value: 'none', label: 'Ninguna' },
                  ]}
                  defaultValue="tls"
                />
              </div>
              <Input
                label="Usuario SMTP"
                defaultValue="noreply@serpentix.com"
              />
              <Input
                label="Contraseña SMTP"
                type="password"
                defaultValue="••••••••"
              />
              <Button variant="secondary" className="w-full">
                Probar Conexión
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Remitente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nombre del Remitente"
                defaultValue="Serpentix Hosting"
              />
              <Input
                label="Email del Remitente"
                type="email"
                defaultValue="noreply@serpentix.com"
              />
              <Input
                label="Email de Respuesta"
                type="email"
                defaultValue="soporte@serpentix.com"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Plantillas de Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Bienvenida', status: 'active' },
                  { name: 'Nueva Factura', status: 'active' },
                  { name: 'Pago Recibido', status: 'active' },
                  { name: 'Servicio Suspendido', status: 'active' },
                  { name: 'Recordatorio de Pago', status: 'active' },
                  { name: 'Ticket Respondido', status: 'active' },
                  { name: 'Renovación Próxima', status: 'inactive' },
                  { name: 'Recuperación de Contraseña', status: 'active' },
                ].map((template) => (
                  <div
                    key={template.name}
                    className="p-4 bg-dark-800/50 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-dark-400" />
                      <span className="text-white">{template.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={template.status === 'active' ? 'success' : 'default'}
                        size="sm"
                      >
                        {template.status === 'active' ? 'Activa' : 'Inactiva'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payments' && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Pasarelas de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'Stripe',
                    description: 'Pagos con tarjeta de crédito/débito',
                    enabled: true,
                    testMode: false,
                  },
                  {
                    name: 'PayPal',
                    description: 'Pagos con cuenta PayPal',
                    enabled: true,
                    testMode: false,
                  },
                  {
                    name: 'Transferencia Bancaria',
                    description: 'Pagos mediante transferencia',
                    enabled: true,
                    testMode: false,
                  },
                  {
                    name: 'Crypto',
                    description: 'Pagos con criptomonedas',
                    enabled: false,
                    testMode: false,
                  },
                ].map((gateway) => (
                  <div
                    key={gateway.name}
                    className={`p-4 rounded-lg border transition-colors ${
                      gateway.enabled
                        ? 'bg-dark-800/50 border-dark-700'
                        : 'bg-dark-900/50 border-dark-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          gateway.enabled ? 'bg-primary-500/20' : 'bg-dark-700'
                        }`}>
                          <CreditCard className={`w-6 h-6 ${
                            gateway.enabled ? 'text-primary-400' : 'text-dark-500'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{gateway.name}</h4>
                            {gateway.testMode && (
                              <Badge variant="warning" size="sm">Modo Test</Badge>
                            )}
                          </div>
                          <p className="text-dark-400 text-sm">{gateway.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={gateway.enabled ? 'success' : 'default'}>
                          {gateway.enabled ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Button variant="secondary" size="sm">
                          Configurar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Stripe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Clave Pública"
                  defaultValue="pk_live_••••••••••••"
                />
                <Input
                  label="Clave Secreta"
                  type="password"
                  defaultValue="sk_live_••••••••••••"
                />
                <Input
                  label="Webhook Secret"
                  type="password"
                  defaultValue="whsec_••••••••••••"
                />
                <div className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="stripe-test"
                    aria-label="Activar modo de pruebas de Stripe"
                    className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="stripe-test" className="text-dark-300">
                    Activar modo de pruebas
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración de PayPal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Client ID"
                  defaultValue="AaBbCc••••••••••••"
                />
                <Input
                  label="Client Secret"
                  type="password"
                  defaultValue="EeFfGg••••••••••••"
                />
                <div className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="paypal-sandbox"
                    aria-label="Usar Sandbox de PayPal"
                    className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="paypal-sandbox" className="text-dark-300">
                    Usar Sandbox
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-400" />
                Autenticación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Requerir 2FA para Admins</p>
                  <p className="text-dark-400 text-sm">
                    Los administradores deberán usar autenticación de dos factores
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  aria-label="Requerir 2FA para Admins"
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Límite de Intentos de Login</p>
                  <p className="text-dark-400 text-sm">
                    Bloquear cuenta tras múltiples intentos fallidos
                  </p>
                </div>
                <Input
                  type="number"
                  defaultValue="5"
                  aria-label="Límite de Intentos de Login"
                  className="w-20"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Tiempo de Sesión (minutos)</p>
                  <p className="text-dark-400 text-sm">
                    Duración de la sesión antes de requerir login
                  </p>
                </div>
                <Input
                  type="number"
                  defaultValue="60"
                  aria-label="Tiempo de Sesión en minutos"
                  className="w-20"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>reCAPTCHA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Activar reCAPTCHA</p>
                  <p className="text-dark-400 text-sm">
                    Proteger formularios contra bots
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  aria-label="Activar reCAPTCHA"
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                />
              </div>
              <Select
                label="Versión"
                options={[
                  { value: 'v2', label: 'reCAPTCHA v2' },
                  { value: 'v3', label: 'reCAPTCHA v3' },
                  { value: 'invisible', label: 'Invisible reCAPTCHA' },
                ]}
                defaultValue="v3"
              />
              <Input
                label="Site Key"
                defaultValue="6LcX••••••••••••••••••"
              />
              <Input
                label="Secret Key"
                type="password"
                defaultValue="6LcX••••••••••••••••••"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Lista de IPs Bloqueadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Ingresa una IP para bloquear..."
                    className="flex-1"
                  />
                  <Button variant="primary">
                    Bloquear IP
                  </Button>
                </div>
                <div className="space-y-2">
                  {[
                    { ip: '192.168.1.100', reason: 'Múltiples intentos de login', date: '2024-12-20' },
                    { ip: '10.0.0.50', reason: 'Actividad sospechosa', date: '2024-12-19' },
                  ].map((blocked) => (
                    <div
                      key={blocked.ip}
                      className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <code className="text-white font-mono">{blocked.ip}</code>
                        <span className="text-dark-400 text-sm">{blocked.reason}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-dark-500 text-sm">{blocked.date}</span>
                        <Button variant="ghost" size="sm">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary-400" />
                Logo y Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Logo Principal
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-dark-800 rounded-lg flex items-center justify-center border-2 border-dashed border-dark-600">
                    <Upload className="w-8 h-8 text-dark-500" />
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      Subir Logo
                    </Button>
                    <p className="text-dark-500 text-xs mt-2">
                      PNG, SVG o WebP. Max 2MB.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Favicon
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-dark-800 rounded-lg flex items-center justify-center border-2 border-dashed border-dark-600">
                    <Upload className="w-6 h-6 text-dark-500" />
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      Subir Favicon
                    </Button>
                    <p className="text-dark-500 text-xs mt-2">
                      ICO o PNG 32x32px.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Colores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Color Primario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue="#8b5cf6"
                    aria-label="Selector de color primario"
                    className="w-12 h-12 rounded-lg border-0 cursor-pointer"
                  />
                  <Input defaultValue="#8b5cf6" aria-label="Valor hexadecimal del color primario" className="flex-1 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Color Secundario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue="#d946ef"
                    aria-label="Selector de color secundario"
                    className="w-12 h-12 rounded-lg border-0 cursor-pointer"
                  />
                  <Input defaultValue="#d946ef" aria-label="Valor hexadecimal del color secundario" className="flex-1 font-mono" />
                </div>
              </div>
              <div className="pt-4">
                <Button variant="secondary" className="w-full">
                  Restablecer Colores por Defecto
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Código Personalizado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="CSS Personalizado"
                placeholder="/* Tu CSS personalizado aquí */"
                rows={6}
                className="font-mono text-sm"
              />
              <Textarea
                label="JavaScript Personalizado"
                placeholder="// Tu JavaScript personalizado aquí"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-dark-500 text-sm">
                ⚠️ Ten cuidado al añadir código personalizado. Un código incorrecto puede afectar el funcionamiento del sitio.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default AdminSettings;
