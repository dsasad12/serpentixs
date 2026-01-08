import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Paperclip,
  Image,
  Smile,
  Phone,
  Video,
  Check,
  CheckCheck,
  Clock,
  Headphones,
  ArrowLeft,
} from 'lucide-react';
import { useAuthStore, useSiteConfigStore } from '../../stores';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system' | 'bot';
  senderName: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: { type: string; url: string; name: string }[];
}

interface SupportAgent {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'busy' | 'offline';
  department: string;
}

const ClientLiveSupport = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<SupportAgent | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const { config } = useSiteConfigStore();
  const { branding } = config;

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate agent responses (in production, this would be WebSocket)
  useEffect(() => {
    if (isConnected && currentAgent) {
      // Simulate occasional agent messages
      const timer = setInterval(() => {
        if (Math.random() > 0.7 && messages.length > 0) {
          // Agent is typing indicator could go here
        }
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isConnected, currentAgent, messages]);

  const handleStartChat = () => {
    setIsConnecting(true);
    setQueuePosition(Math.floor(Math.random() * 3) + 1);

    // Simulate connection process
    setTimeout(() => {
      setQueuePosition(prev => (prev && prev > 1 ? prev - 1 : null));
    }, 2000);

    setTimeout(() => {
      const newTicketId = `LIVE-${Date.now().toString(36).toUpperCase()}`;
      setTicketId(newTicketId);
      setIsConnecting(false);
      setIsConnected(true);
      setCurrentAgent({
        id: '1',
        name: 'Carlos M.',
        status: 'online',
        department: 'Soporte Técnico',
      });

      // Welcome message from system
      const systemMessage: ChatMessage = {
        id: '1',
        sender: 'system',
        senderName: 'Sistema',
        content: `Chat iniciado. Ticket #${newTicketId}`,
        timestamp: new Date(),
        status: 'read',
      };

      const agentMessage: ChatMessage = {
        id: '2',
        sender: 'agent',
        senderName: 'Carlos M.',
        content: `¡Hola ${user?.firstName || 'amigo'}! 👋 Soy Carlos del equipo de soporte técnico de ${branding.siteName}. ¿En qué puedo ayudarte hoy?`,
        timestamp: new Date(),
        status: 'read',
      };

      setMessages([systemMessage, agentMessage]);
    }, 4000);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: user?.firstName || 'Cliente',
      content: inputValue,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => (m.id === newMessage.id ? { ...m, status: 'delivered' as const } : m))
      );
    }, 500);

    // Simulate agent reading
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => (m.id === newMessage.id ? { ...m, status: 'read' as const } : m))
      );
    }, 1500);

    // Simulate agent response
    setTimeout(() => {
      const responses = [
        'Entiendo tu situación. Déjame revisar eso por ti.',
        'Gracias por la información. Estoy verificando en nuestro sistema.',
        '¡Claro! Te ayudo con eso ahora mismo.',
        'Perfecto, ya tengo acceso a tu cuenta. Dame un momento.',
        'Voy a escalar esto a nuestro equipo especializado.',
      ];

      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        senderName: currentAgent?.name || 'Agente',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        status: 'read',
      };

      setMessages(prev => [...prev, agentResponse]);
    }, 3000 + Math.random() * 2000);
  };

  const handleEndChat = () => {
    const endMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'system',
      senderName: 'Sistema',
      content: 'Chat finalizado. Gracias por contactarnos. Se ha enviado una copia de esta conversación a tu email.',
      timestamp: new Date(),
      status: 'read',
    };

    setMessages(prev => [...prev, endMessage]);
    setTimeout(() => {
      setIsConnected(false);
      setCurrentAgent(null);
      setMessages([]);
      setTicketId(null);
    }, 2000);
  };

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-dark-500" />;
      case 'sent':
        return <Check className="w-3 h-3 text-dark-500" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-dark-500" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-primary-400" />;
    }
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
            <Headphones className="w-8 h-8 text-primary-400" />
            Soporte en Vivo
          </h1>
          <p className="text-dark-400 mt-1">
            Chatea en tiempo real con nuestro equipo de soporte
          </p>
        </div>
        {ticketId && (
          <Badge variant="primary">Ticket #{ticketId}</Badge>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            {!isConnected && !isConnecting ? (
              /* Start Chat Screen */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-600/20 to-accent-600/20 flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-primary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Soporte en Tiempo Real
                  </h2>
                  <p className="text-dark-400 mb-6">
                    Conecta con un agente de soporte para resolver tus dudas al instante.
                    Nuestro equipo está disponible 24/7.
                  </p>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-success-400">
                      <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
                      <span className="text-sm">3 agentes disponibles</span>
                    </div>
                    <div className="text-dark-500">|</div>
                    <div className="text-dark-400 text-sm">
                      Tiempo de espera: ~2 min
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartChat}
                    leftIcon={<Headphones className="w-5 h-5" />}
                  >
                    Iniciar Chat
                  </Button>
                  <p className="text-xs text-dark-500 mt-4">
                    También puedes contactarnos por{' '}
                    <a href="#" className="text-primary-400 hover:underline">
                      Discord
                    </a>{' '}
                    o crear un{' '}
                    <a href="/client/tickets" className="text-primary-400 hover:underline">
                      ticket de soporte
                    </a>
                  </p>
                </div>
              </div>
            ) : isConnecting ? (
              /* Connecting Screen */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-primary-600 border-t-transparent animate-spin mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Conectando con soporte...
                  </h3>
                  {queuePosition && (
                    <p className="text-dark-400">
                      Posición en cola: <span className="text-primary-400 font-semibold">{queuePosition}</span>
                    </p>
                  )}
                  <p className="text-sm text-dark-500 mt-4">
                    Un agente estará contigo en breve
                  </p>
                </div>
              </div>
            ) : (
              /* Active Chat */
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center text-white font-semibold">
                        {currentAgent?.name?.[0] || 'A'}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 rounded-full border-2 border-dark-800" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{currentAgent?.name}</h3>
                      <p className="text-xs text-dark-400">{currentAgent?.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Llamada telefónica"
                      className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <button
                      aria-label="Videollamada"
                      className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <Video className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleEndChat}
                      className="px-3 py-1.5 text-sm text-error-400 hover:text-error-300 hover:bg-error-500/10 rounded-lg transition-colors"
                    >
                      Finalizar
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${
                        message.sender === 'system' ? 'justify-center' : ''
                      }`}
                    >
                      {message.sender === 'system' ? (
                        <div className="px-4 py-2 bg-dark-800 rounded-full text-dark-400 text-sm">
                          {message.content}
                        </div>
                      ) : (
                        <div className={`flex items-end gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                          {message.sender !== 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {message.senderName[0]}
                            </div>
                          )}
                          <div>
                            <div
                              className={`px-4 py-3 rounded-2xl ${
                                message.sender === 'user'
                                  ? 'bg-primary-600 text-white rounded-br-md'
                                  : 'bg-dark-800 text-dark-200 rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-dark-500 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                              <span>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {message.sender === 'user' && getStatusIcon(message.status)}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-dark-700 bg-dark-800/50">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      id="chat-file-upload"
                      aria-label="Adjuntar archivo"
                      className="hidden"
                    />
                    <button
                      type="button"
                      aria-label="Adjuntar archivo"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Adjuntar imagen"
                      className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <Image className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 px-4 py-3 bg-dark-900 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                    />
                    <button
                      type="button"
                      aria-label="Insertar emoji"
                      className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!inputValue.trim()}
                      leftIcon={<Send className="w-4 h-4" />}
                    >
                      Enviar
                    </Button>
                  </form>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Discord Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-dark-400 mb-4">
                Únete a nuestro Discord para soporte de la comunidad y anuncios.
              </p>
              <a
                href="https://discord.gg/tu-servidor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-medium transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
                Unirse a Discord
              </a>
            </CardContent>
          </Card>

          {/* Quick Help */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ayuda Rápida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Base de Conocimiento', href: '/client/knowledgebase' },
                { label: 'Preguntas Frecuentes', href: '/faq' },
                { label: 'Estado del Sistema', href: '/status' },
                { label: 'Guías de Inicio', href: '/guides' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between p-3 bg-dark-800/50 hover:bg-dark-800 rounded-xl text-dark-300 hover:text-white transition-colors"
                >
                  <span className="text-sm">{link.label}</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </a>
              ))}
            </CardContent>
          </Card>

          {/* Ticket Alternative */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-dark-400 mb-4">
                ¿Prefieres un ticket tradicional? Te responderemos en menos de 24 horas.
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => window.location.href = '/client/tickets'}
                leftIcon={<MessageSquare className="w-4 h-4" />}
              >
                Crear Ticket
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientLiveSupport;
