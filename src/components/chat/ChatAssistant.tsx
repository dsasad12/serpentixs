import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Headphones,
  ArrowRight,
} from 'lucide-react';
import { useSiteConfigStore, useAuthStore } from '../../stores';

interface Message {
  id: string;
  type: 'bot' | 'user' | 'system';
  content: string;
  timestamp: Date;
  options?: QuickOption[];
}

interface QuickOption {
  id: string;
  label: string;
  action: 'navigate' | 'message' | 'support';
  value: string;
}

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSupportOptions, setShowSupportOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { config } = useSiteConfigStore();
  const { user } = useAuthStore();
  const { branding, serviceCategories, gameCategories, discord } = config;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'bot',
        content: `¡Hola${user?.firstName ? ` ${user.firstName}` : ''}! 👋 Soy el asistente virtual de ${branding.siteName}. ¿En qué puedo ayudarte hoy?`,
        timestamp: new Date(),
        options: [
          { id: '1', label: '🛒 Ver productos', action: 'message', value: 'productos' },
          { id: '2', label: '💰 Precios', action: 'message', value: 'precios' },
          { id: '3', label: '🎮 Game Hosting', action: 'message', value: 'game hosting' },
          { id: '4', label: '🆘 Soporte técnico', action: 'support', value: 'support' },
        ],
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user, branding.siteName]);

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let options: QuickOption[] = [];

    // Product/service related queries
    if (lowerMessage.includes('producto') || lowerMessage.includes('servicio') || lowerMessage.includes('ofrec')) {
      const services = serviceCategories.filter(s => s.enabled).map(s => s.name).join(', ');
      response = `Ofrecemos los siguientes servicios: ${services}. ¿Cuál te interesa conocer más?`;
      options = serviceCategories.filter(s => s.enabled).slice(0, 4).map(s => ({
        id: s.id,
        label: s.name,
        action: 'message' as const,
        value: s.name.toLowerCase(),
      }));
    }
    // Pricing queries
    else if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuánto') || lowerMessage.includes('cuanto')) {
      const priceInfo = serviceCategories.filter(s => s.enabled).map(s => `• ${s.name}: ${s.price}`).join('\n');
      response = `Aquí tienes nuestros precios:\n\n${priceInfo}\n\n¿Te gustaría contratar alguno de estos servicios?`;
      options = [
        { id: '1', label: '✅ Sí, contratar', action: 'navigate' as const, value: '/client/order' },
        { id: '2', label: '❓ Más información', action: 'message' as const, value: 'más información' },
      ];
    }
    // Game hosting queries
    else if (lowerMessage.includes('game') || lowerMessage.includes('juego') || lowerMessage.includes('minecraft') || lowerMessage.includes('rust') || lowerMessage.includes('servidor de')) {
      const games = gameCategories.filter(g => g.enabled).slice(0, 6).map(g => `• ${g.name}: ${g.price}`).join('\n');
      response = `¡Tenemos servidores para los mejores juegos! 🎮\n\n${games}\n\nTodos incluyen protección DDoS, panel de control y soporte 24/7.`;
      options = [
        { id: '1', label: '🎮 Ver todos los juegos', action: 'navigate' as const, value: '/services/game-hosting' },
        { id: '2', label: '💳 Contratar ahora', action: 'navigate' as const, value: '/client/order' },
      ];
    }
    // VPS queries
    else if (lowerMessage.includes('vps') || lowerMessage.includes('virtual')) {
      response = `Nuestros VPS incluyen:\n\n• Hardware de última generación\n• SSD NVMe ultrarrápidos\n• Root access completo\n• Protección DDoS\n• Uptime 99.99%\n\n${serviceCategories.find(s => s.slug === 'vps')?.price || 'Desde €4.99/mes'}`;
      options = [
        { id: '1', label: '📋 Ver planes VPS', action: 'navigate' as const, value: '/services/vps' },
        { id: '2', label: '🆘 Hablar con soporte', action: 'support' as const, value: 'support' },
      ];
    }
    // Web hosting queries
    else if (lowerMessage.includes('web') || lowerMessage.includes('hosting') || lowerMessage.includes('página') || lowerMessage.includes('sitio')) {
      response = `Nuestro Web Hosting incluye:\n\n• SSD NVMe para máxima velocidad\n• SSL gratuito\n• Panel cPanel\n• Backups automáticos\n• Email profesional\n\n${serviceCategories.find(s => s.slug === 'web-hosting')?.price || 'Desde €3.99/mes'}`;
      options = [
        { id: '1', label: '🌐 Ver planes Web', action: 'navigate' as const, value: '/services/web-hosting' },
        { id: '2', label: '💳 Contratar', action: 'navigate' as const, value: '/client/order' },
      ];
    }
    // Support/help queries
    else if (lowerMessage.includes('ayuda') || lowerMessage.includes('soporte') || lowerMessage.includes('problema') || lowerMessage.includes('técnico')) {
      response = `Entiendo que necesitas ayuda. Tenemos varias opciones de soporte:\n\n• 💬 Chat en vivo con un agente\n• 🎫 Crear ticket de soporte\n• 📚 Base de conocimiento\n\n¿Cómo prefieres que te ayudemos?`;
      options = [
        { id: '1', label: '👨‍💻 Hablar con agente', action: 'support' as const, value: 'agent' },
        { id: '2', label: '🎫 Crear ticket', action: 'navigate' as const, value: '/client/tickets' },
        { id: '3', label: '📚 Base de conocimiento', action: 'navigate' as const, value: '/client/knowledgebase' },
      ];
    }
    // Greeting
    else if (lowerMessage.includes('hola') || lowerMessage.includes('buenas') || lowerMessage.includes('hey')) {
      response = `¡Hola! 👋 Es un placer saludarte. ¿En qué puedo ayudarte hoy? Puedo informarte sobre nuestros productos, precios, o conectarte con soporte técnico.`;
      options = [
        { id: '1', label: '🛒 Ver productos', action: 'message' as const, value: 'productos' },
        { id: '2', label: '💰 Precios', action: 'message' as const, value: 'precios' },
        { id: '3', label: '🆘 Soporte', action: 'support' as const, value: 'support' },
      ];
    }
    // Contract/buy
    else if (lowerMessage.includes('contratar') || lowerMessage.includes('comprar') || lowerMessage.includes('adquirir')) {
      response = `¡Excelente decisión! 🎉 Para contratar un servicio, puedes:\n\n1. Ir directamente a contratar servicio\n2. Ver todos nuestros productos primero\n\n¿Qué prefieres?`;
      options = [
        { id: '1', label: '🚀 Contratar ahora', action: 'navigate' as const, value: '/client/order' },
        { id: '2', label: '👀 Ver productos', action: 'navigate' as const, value: '/services' },
      ];
    }
    // Default response
    else {
      response = `Gracias por tu mensaje. Puedo ayudarte con:\n\n• Información sobre productos y precios\n• Contratación de servicios\n• Soporte técnico\n\n¿Qué necesitas?`;
      options = [
        { id: '1', label: '🛒 Productos', action: 'message' as const, value: 'productos' },
        { id: '2', label: '💰 Precios', action: 'message' as const, value: 'precios' },
        { id: '3', label: '🆘 Soporte', action: 'support' as const, value: 'support' },
      ];
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: response,
      timestamp: new Date(),
      options,
    };
  };

  const handleSendMessage = (message?: string) => {
    const text = message || inputValue.trim();
    if (!text) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleOptionClick = (option: QuickOption) => {
    if (option.action === 'navigate') {
      window.location.href = option.value;
    } else if (option.action === 'support') {
      setShowSupportOptions(true);
    } else {
      handleSendMessage(option.value);
    }
  };

  const handleConnectDiscord = () => {
    // Check if Discord is configured
    if (!discord.enabled || !discord.webhookUrl) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: '⚠️ El soporte por Discord no está disponible en este momento. Por favor, crea un ticket de soporte tradicional o intenta más tarde.',
        timestamp: new Date(),
        options: [
          { id: '1', label: '🎫 Crear ticket', action: 'navigate' as const, value: '/client/tickets' },
          { id: '2', label: '💬 Chat en vivo', action: 'navigate' as const, value: '/client/live-support' },
        ],
      };
      setMessages(prev => [...prev, errorMessage]);
      setShowSupportOptions(false);
      return;
    }

    // Add system message about Discord connection
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: '🔗 Conectando con soporte a través de Discord...',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);

    // Generate ticket number
    const ticketNumber = Math.floor(1000 + Math.random() * 9000);
    const ticketChannel = `${discord.ticketChannelPrefix}${ticketNumber}`;

    // In production, this would send to Discord webhook to create a channel in the configured category
    // POST to discord.webhookUrl with the ticket info
    // The webhook would create a channel under discord.categoryId
    
    // Simulate creating Discord ticket
    setTimeout(() => {
      const welcomeMsg = discord.welcomeMessage || '¡Hola! Un agente de soporte se conectará contigo en breve.';
      const confirmMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `¡Ticket creado exitosamente! 🎫\n\n${welcomeMsg}\n\n📋 **Ticket:** #${ticketNumber}\n📁 **Canal:** ${ticketChannel}\n\nUn agente del equipo de soporte ha sido notificado y se conectará contigo pronto.\n\nPuedes seguir escribiendo tu consulta aquí y el agente la verá cuando se conecte.`,
        timestamp: new Date(),
        options: discord.inviteUrl ? [
          { id: '1', label: '🔗 Abrir en Discord', action: 'navigate' as const, value: discord.inviteUrl },
        ] : undefined,
      };
      setMessages(prev => [...prev, confirmMessage]);
      setShowSupportOptions(false);
    }, 2000);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 lg:bottom-8 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg shadow-primary-600/30 flex items-center justify-center ${isOpen ? 'hidden' : ''}`}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-dark-950 animate-pulse" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 lg:bottom-8 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-dark-900 rounded-2xl border border-dark-700 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-600 to-accent-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Asistente Virtual</h3>
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
                    En línea
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar chat"
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.type === 'system' ? 'w-full' : ''}`}>
                    {message.type === 'system' ? (
                      <div className="text-center py-2 px-4 bg-dark-800 rounded-xl text-dark-300 text-sm">
                        {message.content}
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        {message.type === 'bot' && (
                          <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary-400" />
                          </div>
                        )}
                        <div>
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              message.type === 'user'
                                ? 'bg-primary-600 text-white rounded-br-md'
                                : 'bg-dark-800 text-dark-200 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                          </div>
                          
                          {/* Quick Options */}
                          {message.options && message.options.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {message.options.map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => handleOptionClick(option)}
                                  className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 text-dark-200 rounded-full border border-dark-600 hover:border-primary-500/50 transition-colors"
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-accent-600/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-accent-400" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="px-4 py-3 bg-dark-800 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-dark-500 rounded-full animate-bounce typing-dot-1" />
                      <span className="w-2 h-2 bg-dark-500 rounded-full animate-bounce typing-dot-2" />
                      <span className="w-2 h-2 bg-dark-500 rounded-full animate-bounce typing-dot-3" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Support Options Modal */}
              {showSupportOptions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-800 rounded-xl p-4 border border-dark-700"
                >
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-primary-400" />
                    Conectar con Soporte
                  </h4>
                  <p className="text-sm text-dark-400 mb-4">
                    Selecciona cómo quieres contactar con nuestro equipo:
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleConnectDiscord}
                      className="w-full flex items-center gap-3 p-3 bg-[#5865F2] hover:bg-[#4752C4] rounded-xl text-white transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      <div className="text-left">
                        <p className="font-medium">Discord</p>
                        <p className="text-xs text-white/70">Chat en vivo con soporte</p>
                      </div>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </button>
                    <button
                      onClick={() => {
                        setShowSupportOptions(false);
                        window.location.href = '/client/tickets';
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-dark-700 hover:bg-dark-600 rounded-xl text-white transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <div className="text-left">
                        <p className="font-medium">Crear Ticket</p>
                        <p className="text-xs text-dark-400">Respuesta en menos de 24h</p>
                      </div>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowSupportOptions(false)}
                    className="w-full mt-3 text-sm text-dark-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-dark-700 bg-dark-850">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  aria-label="Enviar mensaje"
                  className="w-11 h-11 bg-primary-600 hover:bg-primary-500 disabled:bg-dark-700 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <p className="text-xs text-dark-500 mt-2 text-center">
                Powered by <span className="text-primary-400">{branding.siteName}</span> AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAssistant;
