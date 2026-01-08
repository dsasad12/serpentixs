import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Save,
  RefreshCw,
  ExternalLink,
  Shield,
  Bell,
  Hash,
  Link,
  Key,
  Server,
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useSiteConfigStore } from '../../stores';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const AdminDiscordSettings = () => {
  const { config, updateDiscord, saveConfig } = useSiteConfigStore();
  const { discord } = config;
  
  const [isSaving, setIsSaving] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveConfig();
      // Show success notification
    } catch (error) {
      console.error('Error saving Discord settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    
    // Simulate testing connection
    setTimeout(() => {
      if (discord.webhookUrl && discord.guildId) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
      
      setTimeout(() => setTestStatus('idle'), 3000);
    }, 2000);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
            </div>
            Integración Discord
          </h1>
          <p className="text-dark-400 mt-1">
            Configura la integración con Discord para tickets de soporte
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            leftIcon={
              testStatus === 'testing' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : testStatus === 'success' ? (
                <CheckCircle className="w-4 h-4 text-success-400" />
              ) : testStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-error-400" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )
            }
          >
            {testStatus === 'testing' ? 'Probando...' : testStatus === 'success' ? '¡Conectado!' : testStatus === 'error' ? 'Error' : 'Probar Conexión'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            leftIcon={isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className={discord.enabled ? 'border-success-500/30' : 'border-warning-500/30'}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${discord.enabled ? 'bg-success-500/20' : 'bg-warning-500/20'}`}>
                {discord.enabled ? (
                  <CheckCircle className="w-6 h-6 text-success-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-warning-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {discord.enabled ? 'Discord Integración Activa' : 'Discord Integración Desactivada'}
                </h3>
                <p className="text-sm text-dark-400">
                  {discord.enabled 
                    ? 'Los clientes pueden crear tickets de soporte que se envían a Discord' 
                    : 'Activa la integración para recibir tickets de soporte en Discord'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={discord.enabled}
                onChange={(e) => updateDiscord({ enabled: e.target.checked })}
                aria-label="Activar integración de Discord"
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-success-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary-400" />
              Configuración del Servidor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                ID del Servidor (Guild ID)
              </label>
              <div className="relative">
                <Input
                  value={discord.guildId}
                  onChange={(e) => updateDiscord({ guildId: e.target.value })}
                  placeholder="123456789012345678"
                  leftIcon={<Hash className="w-4 h-4" />}
                />
                {discord.guildId && (
                  <button
                    onClick={() => copyToClipboard(discord.guildId, 'guildId')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                  >
                    {copied === 'guildId' ? <CheckCircle className="w-4 h-4 text-success-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <p className="text-xs text-dark-500 mt-1">
                Activa el modo desarrollador en Discord y haz clic derecho en tu servidor para copiar el ID
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                ID de Categoría para Tickets
              </label>
              <div className="relative">
                <Input
                  value={discord.categoryId}
                  onChange={(e) => updateDiscord({ categoryId: e.target.value })}
                  placeholder="123456789012345678"
                  leftIcon={<Hash className="w-4 h-4" />}
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">
                Los tickets se crearán como canales dentro de esta categoría
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                ID del Rol de Soporte
              </label>
              <div className="relative">
                <Input
                  value={discord.supportRoleId}
                  onChange={(e) => updateDiscord({ supportRoleId: e.target.value })}
                  placeholder="123456789012345678"
                  leftIcon={<Shield className="w-4 h-4" />}
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">
                Este rol será mencionado cuando se cree un nuevo ticket
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Prefijo de Canal de Ticket
              </label>
              <Input
                value={discord.ticketChannelPrefix}
                onChange={(e) => updateDiscord({ ticketChannelPrefix: e.target.value })}
                placeholder="ticket-"
                leftIcon={<MessageSquare className="w-4 h-4" />}
              />
              <p className="text-xs text-dark-500 mt-1">
                Ejemplo: ticket-1234, soporte-1234
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bot & Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary-400" />
              Bot y Webhook
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                URL del Webhook
              </label>
              <Input
                value={discord.webhookUrl}
                onChange={(e) => updateDiscord({ webhookUrl: e.target.value })}
                placeholder="https://discord.com/api/webhooks/..."
                leftIcon={<Link className="w-4 h-4" />}
              />
              <p className="text-xs text-dark-500 mt-1">
                Crea un webhook en el canal de notificaciones de tu servidor
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Token del Bot (Opcional)
              </label>
              <div className="relative">
                <Input
                  type={showBotToken ? 'text' : 'password'}
                  value={discord.botToken}
                  onChange={(e) => updateDiscord({ botToken: e.target.value })}
                  placeholder="••••••••••••••••••••••••••"
                  leftIcon={<Key className="w-4 h-4" />}
                />
                <button
                  onClick={() => setShowBotToken(!showBotToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                >
                  {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-dark-500 mt-1">
                Necesario para crear canales automáticamente. Puedes crear un bot en Discord Developer Portal
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                URL de Invitación al Servidor
              </label>
              <Input
                value={discord.inviteUrl}
                onChange={(e) => updateDiscord({ inviteUrl: e.target.value })}
                placeholder="https://discord.gg/tu-servidor"
                leftIcon={<ExternalLink className="w-4 h-4" />}
              />
              <p className="text-xs text-dark-500 mt-1">
                Los clientes podrán unirse a tu servidor para ver sus tickets
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-400" />
              Mensaje de Bienvenida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Mensaje al crear ticket
              </label>
              <textarea
                value={discord.welcomeMessage}
                onChange={(e) => updateDiscord({ welcomeMessage: e.target.value })}
                placeholder="¡Hola! Un agente de soporte se conectará contigo en breve..."
                rows={4}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
              />
              <p className="text-xs text-dark-500 mt-1">
                Este mensaje se mostrará cuando un cliente cree un ticket de soporte
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-400" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'newTicket', label: 'Nuevo ticket creado', description: 'Notificar cuando un cliente crea un ticket' },
              { key: 'ticketReply', label: 'Respuesta en ticket', description: 'Notificar cuando el cliente responde' },
              { key: 'ticketClosed', label: 'Ticket cerrado', description: 'Notificar cuando se cierra un ticket' },
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
                <div>
                  <p className="font-medium text-white">{notification.label}</p>
                  <p className="text-sm text-dark-400">{notification.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discord.notifications[notification.key as keyof typeof discord.notifications]}
                    onChange={(e) => updateDiscord({
                      notifications: {
                        ...discord.notifications,
                        [notification.key]: e.target.checked,
                      },
                    })}
                    aria-label={notification.label}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary-400" />
            Guía de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '1',
                title: 'Crear Bot en Discord',
                description: 'Ve a Discord Developer Portal y crea una nueva aplicación con bot',
                link: 'https://discord.com/developers/applications',
              },
              {
                step: '2',
                title: 'Configurar Permisos',
                description: 'El bot necesita permisos para crear canales y enviar mensajes',
              },
              {
                step: '3',
                title: 'Crear Categoría',
                description: 'Crea una categoría en tu servidor donde se crearán los tickets',
              },
              {
                step: '4',
                title: 'Añadir Webhook',
                description: 'Crea un webhook para recibir notificaciones de nuevos tickets',
              },
            ].map((item) => (
              <div key={item.step} className="p-4 bg-dark-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold mb-3">
                  {item.step}
                </div>
                <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-sm text-dark-400">{item.description}</p>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 mt-2"
                  >
                    Ir al portal <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminDiscordSettings;
