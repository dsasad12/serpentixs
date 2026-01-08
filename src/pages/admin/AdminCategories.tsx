import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderTree,
  Search,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Gamepad2,
  Globe,
  Server,
  HardDrive,
  AtSign,
  Mail,
  Package,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useCatalogStore, type Category } from '../../stores';

const iconOptions = [
  { value: 'Gamepad2', label: 'Gamepad (Juegos)', icon: Gamepad2 },
  { value: 'Globe', label: 'Globe (Web)', icon: Globe },
  { value: 'Server', label: 'Server (VPS)', icon: Server },
  { value: 'HardDrive', label: 'HardDrive (Dedicados)', icon: HardDrive },
  { value: 'AtSign', label: 'AtSign (Dominios)', icon: AtSign },
  { value: 'Mail', label: 'Mail (Email)', icon: Mail },
  { value: 'Package', label: 'Package (General)', icon: Package },
];

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Gamepad2,
    Globe,
    Server,
    HardDrive,
    AtSign,
    Mail,
    Package,
  };
  return iconMap[iconName] || Package;
};

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  menuSection: Category['menuSection'];
  isActive: boolean;
  order: string;
}

const emptyFormData: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  icon: 'Package',
  menuSection: 'hostings',
  isActive: true,
  order: '1',
};

const AdminCategories = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useCatalogStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>(emptyFormData);
  const [isSaving, setIsSaving] = useState(false);

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = sectionFilter === 'all' || cat.menuSection === sectionFilter;
    return matchesSearch && matchesSection;
  });

  const hostingCategories = categories.filter((c) => c.menuSection === 'hostings');
  const otherCategories = categories.filter((c) => c.menuSection === 'other-services');
  const hiddenCategories = categories.filter((c) => c.menuSection === 'none');

  const getProductCount = (categoryId: string) => {
    return products.filter((p) => p.categoryId === categoryId).length;
  };

  const getSectionLabel = (section: string) => {
    const labels: Record<string, string> = {
      hostings: 'Hostings',
      'other-services': 'Otros Servicios',
      none: 'Sin mostrar en menú',
    };
    return labels[section] || section;
  };

  const getSectionBadgeVariant = (section: string): 'primary' | 'accent' | 'default' => {
    const variants: Record<string, 'primary' | 'accent' | 'default'> = {
      hostings: 'primary',
      'other-services': 'accent',
      none: 'default',
    };
    return variants[section] || 'default';
  };

  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Auto-generate slug from name
      if (field === 'name' && typeof value === 'string') {
        newData.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return newData;
    });
  };

  const resetForm = () => {
    setFormData(emptyFormData);
  };

  const openCreateModal = () => {
    resetForm();
    // Set order to next available
    const maxOrder = Math.max(...categories.map((c) => c.order), 0);
    setFormData((prev) => ({ ...prev, order: (maxOrder + 1).toString() }));
    setShowCreateModal(true);
  };

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      menuSection: category.menuSection,
      isActive: category.isActive,
      order: category.order.toString(),
    });
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleSave = async (isEdit: boolean) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const categoryData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      icon: formData.icon,
      menuSection: formData.menuSection,
      isActive: formData.isActive,
      order: parseInt(formData.order) || 1,
    };

    if (isEdit && selectedCategory) {
      updateCategory(selectedCategory.id, categoryData);
    } else {
      addCategory(categoryData);
    }

    setIsSaving(false);
    setShowCreateModal(false);
    setShowEditModal(false);
    resetForm();
    setSelectedCategory(null);
  };

  const handleDelete = () => {
    if (selectedCategory) {
      deleteCategory(selectedCategory.id);
      setShowDeleteModal(false);
      setSelectedCategory(null);
    }
  };

  const toggleActive = (category: Category) => {
    updateCategory(category.id, { isActive: !category.isActive });
  };

  const CategoryForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    const IconComponent = getIconComponent(formData.icon);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-xl">
          <div className="w-16 h-16 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <IconComponent className="w-8 h-8 text-primary-400" />
          </div>
          <div>
            <p className="text-white font-medium">{formData.name || 'Nueva Categoría'}</p>
            <p className="text-dark-400 text-sm">{formData.slug || 'slug-de-categoria'}</p>
          </div>
        </div>

        <Input
          label="Nombre de la Categoría"
          placeholder="Ej: Game Hosting"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />

        <Input
          label="Slug (URL)"
          placeholder="game-hosting"
          value={formData.slug}
          onChange={(e) => handleInputChange('slug', e.target.value)}
          hint="Se genera automáticamente del nombre"
        />

        <Textarea
          label="Descripción"
          placeholder="Breve descripción de la categoría..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={2}
        />

        <Select
          label="Icono"
          value={formData.icon}
          onChange={(e) => handleInputChange('icon', e.target.value)}
          options={iconOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
        />

        <div>
          <Select
            label="Sección del Menú"
            value={formData.menuSection}
            onChange={(e) => handleInputChange('menuSection', e.target.value as Category['menuSection'])}
            options={[
              { value: 'hostings', label: 'Hostings (Menú principal)' },
              { value: 'other-services', label: 'Otros Servicios (Menú principal)' },
              { value: 'none', label: 'No mostrar en menú' },
            ]}
          />
          <p className="mt-1 text-xs text-gray-400">Define dónde aparecerá esta categoría en el menú de navegación</p>
        </div>

        <Input
          label="Orden"
          type="number"
          min="1"
          value={formData.order}
          onChange={(e) => handleInputChange('order', e.target.value)}
          hint="Orden de aparición dentro de su sección"
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="w-5 h-5 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
          />
          <div>
            <span className="text-white font-medium">Categoría Activa</span>
            <p className="text-dark-500 text-sm">Solo las categorías activas se mostrarán públicamente</p>
          </div>
        </label>

        <div className="flex gap-3 pt-4 border-t border-dark-800">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => handleSave(isEdit)}
            isLoading={isSaving}
            disabled={!formData.name.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? 'Guardar Cambios' : 'Crear Categoría'}
          </Button>
        </div>
      </div>
    );
  };

  const CategoryCard = ({ category }: { category: Category }) => {
    const IconComponent = getIconComponent(category.icon);
    const productCount = getProductCount(category.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        <Card className={`hover:border-primary-500/30 transition-all ${!category.isActive ? 'opacity-60' : ''}`}>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2">
                <button aria-label="Arrastrar para reordenar" className="p-1 text-dark-600 hover:text-dark-400 cursor-grab">
                  <GripVertical className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-primary-400" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white truncate">{category.name}</h3>
                  {!category.isActive && (
                    <Badge variant="default" size="sm">Inactiva</Badge>
                  )}
                </div>
                <p className="text-dark-400 text-sm mb-2 truncate">{category.description}</p>
                <div className="flex items-center gap-3">
                  <Badge variant={getSectionBadgeVariant(category.menuSection)} size="sm">
                    {getSectionLabel(category.menuSection)}
                  </Badge>
                  <span className="text-dark-500 text-xs">
                    {productCount} producto{productCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-dark-600 text-xs">
                    Orden: {category.order}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleActive(category)}
                  className={`p-2 rounded-lg transition-colors ${
                    category.isActive
                      ? 'text-success-400 hover:bg-success-500/10'
                      : 'text-dark-400 hover:bg-dark-800'
                  }`}
                  title={category.isActive ? 'Desactivar' : 'Activar'}
                >
                  {category.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEditModal(category)}
                  className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 text-dark-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                  title="Eliminar"
                  disabled={productCount > 0}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
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
          <h1 className="text-3xl font-bold text-white">Categorías</h1>
          <p className="text-dark-400 mt-1">
            Gestiona las categorías del menú y el catálogo de servicios
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Nueva Categoría
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{categories.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Server className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Hostings</p>
              <p className="text-2xl font-bold text-white">{hostingCategories.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Otros Servicios</p>
              <p className="text-2xl font-bold text-white">{otherCategories.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center">
              <EyeOff className="w-6 h-6 text-dark-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Ocultas</p>
              <p className="text-2xl font-bold text-white">{hiddenCategories.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todas las secciones' },
              { value: 'hostings', label: 'Hostings' },
              { value: 'other-services', label: 'Otros Servicios' },
              { value: 'none', label: 'Sin menú' },
            ]}
            className="w-full md:w-56"
          />
        </CardContent>
      </Card>

      {/* Category Sections */}
      <div className="space-y-8">
        {/* Hostings Section */}
        {(sectionFilter === 'all' || sectionFilter === 'hostings') && hostingCategories.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary-400" />
              Hostings
              <Badge variant="primary" size="sm">{hostingCategories.length}</Badge>
            </h2>
            <div className="space-y-3">
              {hostingCategories
                .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .sort((a, b) => a.order - b.order)
                .map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
            </div>
          </div>
        )}

        {/* Other Services Section */}
        {(sectionFilter === 'all' || sectionFilter === 'other-services') && otherCategories.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-accent-400" />
              Otros Servicios
              <Badge variant="accent" size="sm">{otherCategories.length}</Badge>
            </h2>
            <div className="space-y-3">
              {otherCategories
                .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .sort((a, b) => a.order - b.order)
                .map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
            </div>
          </div>
        )}

        {/* Hidden Section */}
        {(sectionFilter === 'all' || sectionFilter === 'none') && hiddenCategories.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-dark-400" />
              Sin mostrar en menú
              <Badge variant="default" size="sm">{hiddenCategories.length}</Badge>
            </h2>
            <div className="space-y-3">
              {hiddenCategories
                .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .sort((a, b) => a.order - b.order)
                .map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
            </div>
          </div>
        )}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FolderTree className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay categorías</h3>
            <p className="text-dark-400 mb-6">
              {searchTerm ? 'No se encontraron categorías' : 'Comienza creando tu primera categoría'}
            </p>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
              Crear Categoría
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nueva Categoría"
        size="md"
      >
        <CategoryForm isEdit={false} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
          setSelectedCategory(null);
        }}
        title="Editar Categoría"
        size="md"
      >
        <CategoryForm isEdit={true} />
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        title="Eliminar Categoría"
        size="sm"
      >
        <div className="space-y-4">
          {getProductCount(selectedCategory?.id || '') > 0 ? (
            <>
              <p className="text-dark-300">
                No puedes eliminar la categoría{' '}
                <span className="text-white font-medium">{selectedCategory?.name}</span>{' '}
                porque tiene productos asociados.
              </p>
              <p className="text-dark-500 text-sm">
                Primero mueve o elimina los {getProductCount(selectedCategory?.id || '')} productos de esta categoría.
              </p>
              <Button variant="secondary" className="w-full" onClick={() => setShowDeleteModal(false)}>
                Entendido
              </Button>
            </>
          ) : (
            <>
              <p className="text-dark-300">
                ¿Estás seguro de que deseas eliminar la categoría{' '}
                <span className="text-white font-medium">{selectedCategory?.name}</span>?
              </p>
              <p className="text-dark-500 text-sm">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleDelete}>
                  Eliminar
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminCategories;
