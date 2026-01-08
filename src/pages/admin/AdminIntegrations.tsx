import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Gamepad2,
  HardDrive,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ExternalLink,
  Info,
  Layers,
  Cpu,
  Database,
  Globe,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useIntegrationSettingsStore } from '../../stores';

const AdminIntegrations = () => {
  const {
    settings,
    connectionStatus,
    isLoading,
    lastSaved,
    updatePterodactylSettings,
    updateVirtualizorSettings,
    saveSettings,
    testConnection,
  } = useIntegrationSettingsStore();

  const [expandedSections, setExpandedSections] = useState<string[]>(['pterodactyl']);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleTestConnection = async (integration: 'pterodactyl' | 'virtualizor') => {
    setTestingIntegration(integration);
    await testConnection(integration);
    setTestingIntegration(null);
  };

  const handleSave = async () => {
    await saveSettings();
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const SectionHeader = ({
    title,
    description,
    icon: Icon,
    section,
    enabled,
    onToggle,
    status,
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    section: string;
    enabled: boolean;
    onToggle: () => void;
    status?: { connected: boolean; lastCheck: string; error?: string };
  }) => (
    <div
      className="w-full flex items-center justify-between p-6 hover:bg-dark-800/50 transition-colors cursor-pointer"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${enabled ? 'bg-gradient-to-br from-primary-500/20 to-accent-500/20' : 'bg-dark-700'}`}>
          <Icon className={`w-7 h-7 ${enabled ? 'text-primary-400' : 'text-dark-400'}`} />
        </div>
        <div className="text-left">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-dark-400 text-sm mt-0.5">{description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={enabled ? 'success' : 'default'} size="sm">
              {enabled ? 'Configurado' : 'No configurado'}
            </Badge>
            {status && (
              <Badge
                variant={status.connected ? 'success' : 'danger'}
                size="sm"
              >
                {status.connected ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Conectado</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" /> Desconectado</>
                )}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label
          className="relative inline-flex items-center cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            aria-label={`Activar ${title}`}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
        {expandedSections.includes(section) ? (
          <ChevronUp className="w-5 h-5 text-dark-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-dark-400" />
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Integraciones de Servidores</h1>
          <p className="text-dark-400 mt-1">
            Conecta con Pterodactyl y Virtualizor para provisionar automáticamente
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-dark-500 text-sm">
              Guardado: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            isLoading={isLoading}
          >
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-primary-500/20">
        <CardContent className="flex items-start gap-4">
          <Info className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white">Provisionamiento Automático</h4>
            <p className="text-dark-300 text-sm mt-1">
              Al configurar estas integraciones, SerpentixPay podrá crear y gestionar servidores automáticamente
              cuando un cliente compre un servicio. Los servidores se suspenderán al vencer las facturas y se
              eliminarán después del período de gracia configurado.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pterodactyl Section */}
      <Card className="overflow-hidden">
        <SectionHeader
          title="Pterodactyl Panel"
          description="Panel de gestión para servidores de juegos"
          icon={Gamepad2}
          section="pterodactyl"
          enabled={settings.pterodactyl.enabled}
          onToggle={() => updatePterodactylSettings({ enabled: !settings.pterodactyl.enabled })}
          status={connectionStatus.pterodactyl}
        />
        {expandedSections.includes('pterodactyl') && (
          <CardContent className="border-t border-dark-800 space-y-6">
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { icon: Gamepad2, label: 'Game Servers', desc: 'Minecraft, Rust, ARK...' },
                { icon: Layers, label: 'Eggs & Nests', desc: 'Configuraciones predefinidas' },
                { icon: Server, label: 'Multi-node', desc: 'Múltiples servidores' },
                { icon: Globe, label: 'API Completa', desc: 'Control total' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50">
                  <feature.icon className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{feature.label}</p>
                    <p className="text-dark-500 text-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <Input
                label="URL del Panel"
                placeholder="https://panel.tudominio.com"
                value={settings.pterodactyl.panelUrl}
                onChange={(e) => updatePterodactylSettings({ panelUrl: e.target.value })}
                hint="URL completa de tu instalación de Pterodactyl"
                leftIcon={<Globe className="w-5 h-5" />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Application API Key"
                    type={showPassword['pterodactyl_api'] ? 'text' : 'password'}
                    placeholder="ptla_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={settings.pterodactyl.apiKey}
                    onChange={(e) => updatePterodactylSettings({ apiKey: e.target.value })}
                    hint="Admin API > Application API"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('pterodactyl_api')}
                    className="absolute right-3 top-9 text-dark-400 hover:text-white"
                  >
                    {showPassword['pterodactyl_api'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    label="Client API Key (Opcional)"
                    type={showPassword['pterodactyl_client'] ? 'text' : 'password'}
                    placeholder="ptlc_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={settings.pterodactyl.clientApiKey || ''}
                    onChange={(e) => updatePterodactylSettings({ clientApiKey: e.target.value })}
                    hint="Para acciones como start/stop/restart"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('pterodactyl_client')}
                    className="absolute right-3 top-9 text-dark-400 hover:text-white"
                  >
                    {showPassword['pterodactyl_client'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Input
                label="Node ID por Defecto"
                type="number"
                placeholder="1"
                value={settings.pterodactyl.defaultNodeId || ''}
                onChange={(e) => updatePterodactylSettings({ defaultNodeId: parseInt(e.target.value) || undefined })}
                hint="ID del nodo donde se crearán los servidores por defecto"
              />
            </div>

            {/* Documentation Link */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-dark-400" />
                <span className="text-dark-300 text-sm">
                  Necesitas crear una Application API Key en tu panel de Pterodactyl
                </span>
              </div>
              <a
                href="https://pterodactyl.io/panel/1.0/application-api.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm"
              >
                Ver documentación
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Test Connection */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-800">
              {connectionStatus.pterodactyl?.lastCheck && (
                <span className="text-dark-500 text-sm">
                  Última verificación: {new Date(connectionStatus.pterodactyl.lastCheck).toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="secondary"
                leftIcon={testingIntegration === 'pterodactyl' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                onClick={() => handleTestConnection('pterodactyl')}
                disabled={testingIntegration === 'pterodactyl'}
              >
                Probar Conexión
              </Button>
            </div>

            {connectionStatus.pterodactyl?.error && (
              <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
                Error: {connectionStatus.pterodactyl.error}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Virtualizor Section */}
      <Card className="overflow-hidden">
        <SectionHeader
          title="Virtualizor"
          description="Panel de gestión para servidores VPS"
          icon={HardDrive}
          section="virtualizor"
          enabled={settings.virtualizor.enabled}
          onToggle={() => updateVirtualizorSettings({ enabled: !settings.virtualizor.enabled })}
          status={connectionStatus.virtualizor}
        />
        {expandedSections.includes('virtualizor') && (
          <CardContent className="border-t border-dark-800 space-y-6">
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { icon: HardDrive, label: 'VPS Management', desc: 'KVM, OpenVZ, Xen' },
                { icon: Cpu, label: 'Recursos', desc: 'CPU, RAM, Disk' },
                { icon: Database, label: 'Templates', desc: 'ISOs y plantillas' },
                { icon: Server, label: 'Multi-server', desc: 'Cluster de nodos' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50">
                  <feature.icon className="w-5 h-5 text-accent-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{feature.label}</p>
                    <p className="text-dark-500 text-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Host del Panel"
                    placeholder="vps.tudominio.com"
                    value={settings.virtualizor.host}
                    onChange={(e) => updateVirtualizorSettings({ host: e.target.value })}
                    hint="Hostname o IP de tu servidor Virtualizor"
                    leftIcon={<Globe className="w-5 h-5" />}
                  />
                </div>
                <Input
                  label="Puerto"
                  type="number"
                  placeholder="4085"
                  value={settings.virtualizor.port}
                  onChange={(e) => updateVirtualizorSettings({ port: parseInt(e.target.value) || 4085 })}
                  hint="Puerto de la API"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="API Key"
                    type={showPassword['virtualizor_key'] ? 'text' : 'password'}
                    placeholder="Tu API Key de Virtualizor"
                    value={settings.virtualizor.apiKey}
                    onChange={(e) => updateVirtualizorSettings({ apiKey: e.target.value })}
                    hint="Configuration > API Credentials"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('virtualizor_key')}
                    className="absolute right-3 top-9 text-dark-400 hover:text-white"
                  >
                    {showPassword['virtualizor_key'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    label="API Pass"
                    type={showPassword['virtualizor_pass'] ? 'text' : 'password'}
                    placeholder="Tu API Pass de Virtualizor"
                    value={settings.virtualizor.apiPass}
                    onChange={(e) => updateVirtualizorSettings({ apiPass: e.target.value })}
                    hint="Password de la API"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('virtualizor_pass')}
                    className="absolute right-3 top-9 text-dark-400 hover:text-white"
                  >
                    {showPassword['virtualizor_pass'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Server ID por Defecto"
                  type="number"
                  placeholder="1"
                  value={settings.virtualizor.defaultServerId || ''}
                  onChange={(e) => updateVirtualizorSettings({ defaultServerId: parseInt(e.target.value) || undefined })}
                  hint="ID del servidor/nodo por defecto"
                />
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.virtualizor.ssl}
                      onChange={(e) => updateVirtualizorSettings({ ssl: e.target.checked })}
                      className="w-5 h-5 rounded border-dark-700 bg-dark-800 text-primary-500"
                    />
                    <div>
                      <span className="text-white font-medium">Usar SSL (HTTPS)</span>
                      <p className="text-dark-500 text-sm">Conexión segura al panel</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Documentation Link */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-dark-400" />
                <span className="text-dark-300 text-sm">
                  Las credenciales API se encuentran en Configuration &gt; API Credentials
                </span>
              </div>
              <a
                href="https://www.virtualizor.com/admin-api/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-accent-400 hover:text-accent-300 text-sm"
              >
                Ver documentación
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Test Connection */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-800">
              {connectionStatus.virtualizor?.lastCheck && (
                <span className="text-dark-500 text-sm">
                  Última verificación: {new Date(connectionStatus.virtualizor.lastCheck).toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="secondary"
                leftIcon={testingIntegration === 'virtualizor' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                onClick={() => handleTestConnection('virtualizor')}
                disabled={testingIntegration === 'virtualizor'}
              >
                Probar Conexión
              </Button>
            </div>

            {connectionStatus.virtualizor?.error && (
              <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
                Error: {connectionStatus.virtualizor.error}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Coming Soon */}
      <Card className="opacity-60">
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-dark-700 flex items-center justify-center">
              <Server className="w-7 h-7 text-dark-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Más integraciones próximamente</h3>
              <p className="text-dark-400 text-sm mt-0.5">
                cPanel/WHM, DirectAdmin, Proxmox, y más
              </p>
            </div>
          </div>
          <Badge variant="default">Próximamente</Badge>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminIntegrations;
