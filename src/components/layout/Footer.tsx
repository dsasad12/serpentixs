import { Link } from 'react-router-dom';
import {
  Twitter,
  Github,
  MessageCircle,
  Mail,
  MapPin,
  Phone,
  Shield,
  CreditCard,
  Clock,
} from 'lucide-react';
import { useSiteConfigStore } from '../../stores';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { config } = useSiteConfigStore();
  const { branding } = config;

  const footerLinks = {
    services: [
      { name: 'Game Hosting', href: '/services/game-hosting' },
      { name: 'Web Hosting', href: '/services/web-hosting' },
      { name: 'VPS', href: '/services/vps' },
      { name: 'Servidores Dedicados', href: '/services/dedicated' },
      { name: 'Dominios', href: '/services/domains' },
    ],
    company: [
      { name: 'Sobre Nosotros', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Carreras', href: '/careers' },
      { name: 'Socios', href: '/partners' },
      { name: 'Contacto', href: '/contact' },
    ],
    support: [
      { name: 'Centro de Ayuda', href: '/help' },
      { name: 'Base de Conocimiento', href: '/knowledgebase' },
      { name: 'Estado del Sistema', href: '/status' },
      { name: 'Abrir Ticket', href: '/client/tickets/new' },
      { name: 'API Documentation', href: '/docs/api' },
    ],
    legal: [
      { name: 'Términos de Servicio', href: '/legal/terms' },
      { name: 'Política de Privacidad', href: '/legal/privacy' },
      { name: 'SLA', href: '/legal/sla' },
      { name: 'AUP', href: '/legal/aup' },
      { name: 'GDPR', href: '/legal/gdpr' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/serpentixspay', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/serpentixspay', label: 'GitHub' },
    { icon: MessageCircle, href: 'https://discord.gg/serpentixspay', label: 'Discord' },
  ];

  const features = [
    { icon: Shield, text: 'Protección DDoS' },
    { icon: CreditCard, text: 'Pagos Seguros' },
    { icon: Clock, text: 'Soporte 24/7' },
  ];

  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      {/* Features bar */}
      <div className="border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center gap-3 text-dark-300">
                <feature.icon className="w-5 h-5 text-primary-400" />
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              {branding.logoUrl && branding.logoUrl !== '/logo.svg' ? (
                <img 
                  src={branding.logoUrl} 
                  alt={branding.logoAlt || branding.siteName}
                  className="w-10 h-10 rounded-xl object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{branding.siteName?.[0] || 'S'}</span>
                </div>
              )}
              <span className="text-xl font-bold font-display">
                <span className="text-white">{branding.siteName}</span>
              </span>
            </Link>
            <p className="text-dark-400 mb-6 max-w-xs">
              {branding.siteDescription || 'Soluciones de hosting premium para tu negocio. Servidores de alto rendimiento con soporte 24/7.'}
            </p>
            
            {/* Contact info */}
            <div className="space-y-3">
              <a href="mailto:info@serpentixspay.com" className="flex items-center gap-3 text-dark-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                info@serpentixspay.com
              </a>
              <a href="tel:+34900123456" className="flex items-center gap-3 text-dark-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                +34 900 123 456
              </a>
              <p className="flex items-center gap-3 text-dark-400">
                <MapPin className="w-4 h-4" />
                Madrid, España
              </p>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Servicios</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-dark-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-dark-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Soporte</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-dark-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-dark-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-dark-500 text-sm">
              © {currentYear} {branding.siteName}. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 opacity-50" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-50" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
