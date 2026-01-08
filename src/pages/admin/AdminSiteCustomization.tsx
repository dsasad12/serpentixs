import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Save,
  RefreshCw,
  Upload,
  Trash2,
  Plus,
  GripVertical,
  Eye,
  Image,
  Type,
  LayoutGrid,
  Gamepad2,
  Server,
  Settings,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import ColorBox from '../../components/ui/ColorBox';
import Badge from '../../components/ui/Badge';
import { Tabs, type Tab } from '../../components/ui/Tabs';
import { useSiteConfigStore, type GameCategory, type ServiceCategory, type StatItem } from '../../stores';
import { Link } from 'react-router-dom';

// Icon options for services
const iconOptions = [
  { value: 'Gamepad2', label: 'Game Controller' },
  { value: 'Globe', label: 'Globe' },
  { value: 'Server', label: 'Server' },
  { value: 'HardDrive', label: 'Hard Drive' },
  { value: 'Shield', label: 'Shield' },
  { value: 'Zap', label: 'Lightning' },
  { value: 'Clock', label: 'Clock' },
  { value: 'HeadphonesIcon', label: 'Headphones' },
];

// Color gradient options
const colorOptions = [
  { value: 'from-green-500 to-emerald-600', label: 'Verde' },
  { value: 'from-blue-500 to-cyan-600', label: 'Azul' },
  { value: 'from-purple-500 to-violet-600', label: 'Morado' },
  { value: 'from-orange-500 to-red-600', label: 'Naranja' },
  { value: 'from-pink-500 to-rose-600', label: 'Rosa' },
  { value: 'from-yellow-500 to-amber-600', label: 'Amarillo' },
  { value: 'from-teal-500 to-cyan-600', label: 'Teal' },
  { value: 'from-indigo-500 to-purple-600', label: 'Indigo' },
];

const AdminSiteCustomization = () => {
  const [activeTab, setActiveTab] = useState('branding');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageTarget, setSelectedImageTarget] = useState<{ type: 'game' | 'service' | 'logo' | 'hero'; id?: string } | null>(null);

  const {
    config,
    updateBranding,
    updateHero,
    addStat,
    updateStat,
    removeStat,
    addServiceCategory,
    updateServiceCategory,
    removeServiceCategory,
    addGameCategory,
    updateGameCategory,
    removeGameCategory,
    saveConfig,
    loadConfig,
    resetToDefaults,
  } = useSiteConfigStore();

  const { branding, hero, stats, serviceCategories, gameCategories } = config;

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const tabs: Tab[] = [
    { id: 'branding', label: 'Marca', icon: <Type className="w-4 h-4" /> },
    { id: 'hero', label: 'Hero', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'stats', label: 'Estadísticas', icon: <Settings className="w-4 h-4" /> },
    { id: 'services', label: 'Servicios', icon: <Server className="w-4 h-4" /> },
    { id: 'games', label: 'Juegos', icon: <Gamepad2 className="w-4 h-4" /> },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await saveConfig();
    setTimeout(() => setIsSaving(false), 1500);
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de que quieres restablecer toda la configuración a los valores por defecto?')) {
      resetToDefaults();
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedImageTarget) return;

    // For now, create a local URL - in production, upload to server
    const imageUrl = URL.createObjectURL(file);
    
    switch (selectedImageTarget.type) {
      case 'game':
        if (selectedImageTarget.id) {
          updateGameCategory(selectedImageTarget.id, { image: imageUrl });
        }
        break;
      case 'service':
        if (selectedImageTarget.id) {
          updateServiceCategory(selectedImageTarget.id, { image: imageUrl });
        }
        break;
      case 'logo':
        updateBranding({ logoUrl: imageUrl });
        break;
      case 'hero':
        updateHero({ backgroundImage: imageUrl });
        break;
    }
    
    setSelectedImageTarget(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImageUpload = (type: 'game' | 'service' | 'logo' | 'hero', id?: string) => {
    setSelectedImageTarget({ type, id });
    fileInputRef.current?.click();
  };

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Add new stat
  const handleAddStat = () => {
    const newStat: StatItem = {
      id: generateId(),
      value: '0',
      label: 'Nueva Estadística',
      enabled: true,
      order: stats.length + 1,
    };
    addStat(newStat);
  };

  // Add new service category
  const handleAddService = () => {
    const newService: ServiceCategory = {
      id: generateId(),
      name: 'Nuevo Servicio',
      slug: 'nuevo-servicio',
      description: 'Descripción del servicio',
      icon: 'Server',
      price: 'Desde €0.00/mes',
      color: 'from-blue-500 to-cyan-600',
      popular: false,
      enabled: true,
      order: serviceCategories.length + 1,
    };
    addServiceCategory(newService);
  };

  // Add new game category
  const handleAddGame = () => {
    const newGame: GameCategory = {
      id: generateId(),
      name: 'Nuevo Juego',
      slug: 'nuevo-juego',
      description: 'Descripción del juego',
      image: '',
      price: 'Desde €0.00/mes',
      popular: false,
      enabled: true,
      order: gameCategories.length + 1,
    };
    addGameCategory(newGame);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
        aria-label="Subir imagen"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Palette className="w-8 h-8 text-primary-400" />
            Personalización del Sitio
          </h1>
          <p className="text-dark-400 mt-1">
            Personaliza el nombre, aspecto y contenido del sitio web
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/" target="_blank">
            <Button variant="secondary" leftIcon={<Eye className="w-4 h-4" />}>
              Ver Sitio
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={handleReset}
          >
            Restablecer
          </Button>
          <Button
            variant="primary"
            leftIcon={isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-primary-400" />
                Información de la Marca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nombre del Sitio"
                value={branding.siteName}
                onChange={(e) => updateBranding({ siteName: e.target.value })}
                placeholder="SerpentixPay"
              />
              <Input
                label="Eslogan"
                value={branding.siteSlogan}
                onChange={(e) => updateBranding({ siteSlogan: e.target.value })}
                placeholder="Hosting de Alto Rendimiento"
              />
              <Textarea
                label="Descripción del Sitio"
                value={branding.siteDescription}
                onChange={(e) => updateBranding({ siteDescription: e.target.value })}
                placeholder="Descripción para SEO y metadatos..."
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-primary-400" />
                Logo e Imágenes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center overflow-hidden">
                    {branding.logoUrl ? (
                      <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <Image className="w-8 h-8 text-dark-500" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Upload className="w-4 h-4" />}
                      onClick={() => triggerImageUpload('logo')}
                    >
                      Subir Logo
                    </Button>
                    <p className="text-xs text-dark-500">PNG, JPG o SVG. Max 2MB</p>
                  </div>
                </div>
              </div>
              <Input
                label="URL del Logo (alternativa)"
                value={branding.logoUrl}
                onChange={(e) => updateBranding({ logoUrl: e.target.value })}
                placeholder="/logo.svg"
              />
              <Input
                label="Alt del Logo"
                value={branding.logoAlt}
                onChange={(e) => updateBranding({ logoAlt: e.target.value })}
                placeholder="Logo de mi empresa"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary-400" />
                Colores (Próximamente)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Color Primario</label>
                  <div className="flex items-center gap-2">
                    <ColorBox 
                      color={branding.primaryColor}
                      className="w-10 h-10 rounded-lg border border-dark-600" 
                    />
                    <Input
                      value={branding.primaryColor}
                      onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Color de Acento</label>
                  <div className="flex items-center gap-2">
                    <ColorBox 
                      color={branding.accentColor}
                      className="w-10 h-10 rounded-lg border border-dark-600" 
                    />
                    <Input
                      value={branding.accentColor}
                      onChange={(e) => updateBranding({ accentColor: e.target.value })}
                      placeholder="#d946ef"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hero Tab */}
      {activeTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Título Principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Primera línea del título"
                value={hero.title}
                onChange={(e) => updateHero({ title: e.target.value })}
                placeholder="Hosting de"
              />
              <Input
                label="Título destacado (gradiente)"
                value={hero.highlightedTitle}
                onChange={(e) => updateHero({ highlightedTitle: e.target.value })}
                placeholder="Alto Rendimiento"
              />
              <Textarea
                label="Subtítulo"
                value={hero.subtitle}
                onChange={(e) => updateHero({ subtitle: e.target.value })}
                placeholder="Descripción del servicio..."
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badge y Botones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hero.showBadge}
                    onChange={(e) => updateHero({ showBadge: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-dark-300">Mostrar badge</span>
                </label>
              </div>
              {hero.showBadge && (
                <Input
                  label="Texto del Badge"
                  value={hero.badge}
                  onChange={(e) => updateHero({ badge: e.target.value })}
                  placeholder="Nuevo: Panel de control mejorado disponible"
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Botón Primario - Texto"
                  value={hero.primaryButtonText}
                  onChange={(e) => updateHero({ primaryButtonText: e.target.value })}
                  placeholder="Ver Planes"
                />
                <Input
                  label="Botón Primario - Enlace"
                  value={hero.primaryButtonLink}
                  onChange={(e) => updateHero({ primaryButtonLink: e.target.value })}
                  placeholder="/services/game-hosting"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Botón Secundario - Texto"
                  value={hero.secondaryButtonText}
                  onChange={(e) => updateHero({ secondaryButtonText: e.target.value })}
                  placeholder="Contactar Ventas"
                />
                <Input
                  label="Botón Secundario - Enlace"
                  value={hero.secondaryButtonLink}
                  onChange={(e) => updateHero({ secondaryButtonLink: e.target.value })}
                  placeholder="/contact"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Estadísticas del Hero</CardTitle>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddStat}
            >
              Añadir Estadística
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.map((stat) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-xl border border-dark-700"
                >
                  <GripVertical className="w-5 h-5 text-dark-500 cursor-grab" />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      value={stat.value}
                      onChange={(e) => updateStat(stat.id, { value: e.target.value })}
                      placeholder="50K+"
                    />
                    <Input
                      value={stat.label}
                      onChange={(e) => updateStat(stat.id, { label: e.target.value })}
                      placeholder="Clientes Activos"
                    />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={stat.enabled}
                          onChange={(e) => updateStat(stat.id, { enabled: e.target.checked })}
                          className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-dark-300 text-sm">Activo</span>
                      </label>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStat(stat.id)}
                    className="text-error-400 hover:text-error-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Categorías de Servicios</CardTitle>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddService}
            >
              Añadir Servicio
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {serviceCategories.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 bg-dark-800/50 rounded-xl border border-dark-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-dark-500 cursor-grab" />
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                        {service.image ? (
                          <img src={service.image} alt={service.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Server className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{service.name}</h3>
                        <p className="text-sm text-dark-400">/{service.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {service.popular && <Badge variant="primary">Popular</Badge>}
                      {service.enabled ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="default">Desactivado</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeServiceCategory(service.id)}
                        className="text-error-400 hover:text-error-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                      label="Nombre"
                      value={service.name}
                      onChange={(e) => updateServiceCategory(service.id, { name: e.target.value })}
                    />
                    <Input
                      label="Slug (URL)"
                      value={service.slug}
                      onChange={(e) => updateServiceCategory(service.id, { slug: e.target.value })}
                    />
                    <Select
                      label="Icono"
                      value={service.icon}
                      onChange={(e) => updateServiceCategory(service.id, { icon: e.target.value })}
                      options={iconOptions}
                    />
                    <Select
                      label="Color"
                      value={service.color}
                      onChange={(e) => updateServiceCategory(service.id, { color: e.target.value })}
                      options={colorOptions}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Textarea
                      label="Descripción"
                      value={service.description}
                      onChange={(e) => updateServiceCategory(service.id, { description: e.target.value })}
                      rows={2}
                    />
                    <div className="space-y-4">
                      <Input
                        label="Precio"
                        value={service.price}
                        onChange={(e) => updateServiceCategory(service.id, { price: e.target.value })}
                      />
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={service.popular}
                            onChange={(e) => updateServiceCategory(service.id, { popular: e.target.checked })}
                            className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                          />
                          <span className="text-dark-300 text-sm">Popular</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={service.enabled}
                            onChange={(e) => updateServiceCategory(service.id, { enabled: e.target.checked })}
                            className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                          />
                          <span className="text-dark-300 text-sm">Activo</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-dark-300 mb-2">Imagen (opcional)</label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Upload className="w-4 h-4" />}
                        onClick={() => triggerImageUpload('service', service.id)}
                      >
                        Subir Imagen
                      </Button>
                      <Input
                        value={service.image || ''}
                        onChange={(e) => updateServiceCategory(service.id, { image: e.target.value })}
                        placeholder="URL de la imagen..."
                        className="flex-1"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Games Tab */}
      {activeTab === 'games' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-primary-400" />
              Categorías de Juegos
            </CardTitle>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddGame}
            >
              Añadir Juego
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-dark-400 mb-6">
              Configura los juegos que aparecen en la sección de Game Hosting. Puedes añadir imágenes personalizadas para cada juego.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameCategories.map((game) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-dark-800/50 rounded-xl border border-dark-700 overflow-hidden"
                >
                  {/* Image preview */}
                  <div className="relative aspect-video bg-dark-900">
                    {game.image ? (
                      <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-12 h-12 text-dark-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="font-semibold text-white">{game.name}</span>
                      <div className="flex gap-1">
                        {game.popular && <Badge variant="primary" className="text-xs">Popular</Badge>}
                        {!game.enabled && <Badge variant="default" className="text-xs">Desactivado</Badge>}
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Nombre"
                        value={game.name}
                        onChange={(e) => updateGameCategory(game.id, { name: e.target.value })}
                        placeholder="Minecraft"
                      />
                      <Input
                        label="Slug"
                        value={game.slug}
                        onChange={(e) => updateGameCategory(game.id, { slug: e.target.value })}
                        placeholder="minecraft"
                      />
                    </div>

                    <Textarea
                      label="Descripción"
                      value={game.description}
                      onChange={(e) => updateGameCategory(game.id, { description: e.target.value })}
                      rows={2}
                      placeholder="Descripción corta del juego..."
                    />

                    <Input
                      label="Precio"
                      value={game.price}
                      onChange={(e) => updateGameCategory(game.id, { price: e.target.value })}
                      placeholder="Desde €2.99/mes"
                    />

                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">Imagen del Juego</label>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Upload className="w-4 h-4" />}
                          onClick={() => triggerImageUpload('game', game.id)}
                          className="flex-shrink-0"
                        >
                          Subir
                        </Button>
                        <Input
                          value={game.image}
                          onChange={(e) => updateGameCategory(game.id, { image: e.target.value })}
                          placeholder="URL de la imagen..."
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-dark-700">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={game.popular}
                            onChange={(e) => updateGameCategory(game.id, { popular: e.target.checked })}
                            className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                          />
                          <span className="text-dark-300 text-sm">Popular</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={game.enabled}
                            onChange={(e) => updateGameCategory(game.id, { enabled: e.target.checked })}
                            className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                          />
                          <span className="text-dark-300 text-sm">Activo</span>
                        </label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGameCategory(game.id)}
                        className="text-error-400 hover:text-error-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default AdminSiteCustomization;
