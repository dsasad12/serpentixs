import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Wallet,
  Bitcoin,
  Building2,
  Save,
  RefreshCw,
  Globe,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { 
  usePaymentSettingsStore, 
  type CryptoSettings,
} from '../../stores';
import { 
  MERCADOPAGO_COUNTRIES, 
  type MercadoPagoCountry,
  type BankAccount,
  type BankRegion,
} from '../../lib/payments';

const AdminPaymentSettings = () => {
  const {
    settings,
    isLoading,
    lastSaved,
    updatePayPalSettings,
    updateMercadoPagoCountry,
    updateCryptoSettings,
    updateBankTransferSettings,
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
    saveSettings,
    testConnection,
  } = usePaymentSettingsStore();

  const [expandedSections, setExpandedSections] = useState<string[]>(['paypal']);
  const [testingGateway, setTestingGateway] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);
  const [bankForm, setBankForm] = useState<Partial<BankAccount>>({
    region: 'europe',
    currency: 'EUR',
    isActive: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleTestConnection = async (gateway: string) => {
    setTestingGateway(gateway);
    const result = await testConnection(gateway as 'paypal' | 'mercadopago' | 'crypto' | 'banktransfer');
    setTestResults((prev) => ({ ...prev, [gateway]: result }));
    setTestingGateway(null);
  };

  const handleSave = async () => {
    await saveSettings();
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openBankModal = (account?: BankAccount) => {
    if (account) {
      setEditingBankAccount(account);
      setBankForm(account);
    } else {
      setEditingBankAccount(null);
      setBankForm({
        region: 'europe',
        currency: 'EUR',
        isActive: true,
      });
    }
    setShowBankModal(true);
  };

  const saveBankAccount = () => {
    if (!bankForm.bankName || !bankForm.accountHolder) return;

    const account: BankAccount = {
      id: editingBankAccount?.id || `bank_${Date.now()}`,
      region: bankForm.region as BankRegion,
      bankName: bankForm.bankName || '',
      accountHolder: bankForm.accountHolder || '',
      accountNumber: bankForm.accountNumber || '',
      routingNumber: bankForm.routingNumber,
      iban: bankForm.iban,
      bic: bankForm.bic,
      clabe: bankForm.clabe,
      currency: bankForm.currency || 'EUR',
      country: bankForm.country || 'ES',
      isActive: bankForm.isActive ?? true,
      instructions: bankForm.instructions,
    };

    if (editingBankAccount) {
      updateBankAccount(account.id, account);
    } else {
      addBankAccount(account);
    }

    setShowBankModal(false);
    setBankForm({ region: 'europe', currency: 'EUR', isActive: true });
    setEditingBankAccount(null);
  };

  const SectionHeader = ({ 
    title, 
    icon: Icon, 
    section, 
    enabled,
    onToggle,
  }: { 
    title: string; 
    icon: React.ElementType; 
    section: string;
    enabled: boolean;
    onToggle: () => void;
  }) => (
    <div
      className="w-full flex items-center justify-between p-4 hover:bg-dark-800/50 transition-colors cursor-pointer"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-primary-500/20' : 'bg-dark-700'}`}>
          <Icon className={`w-5 h-5 ${enabled ? 'text-primary-400' : 'text-dark-400'}`} />
        </div>
        <div className="text-left">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={enabled ? 'success' : 'default'} size="sm">
              {enabled ? 'Activo' : 'Inactivo'}
            </Badge>
            {testResults[section] && (
              <Badge 
                variant={testResults[section].success ? 'success' : 'danger'} 
                size="sm"
              >
                {testResults[section].success ? 'Conectado' : 'Error'}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
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
          <h1 className="text-3xl font-bold text-white">Configuración de Pagos</h1>
          <p className="text-dark-400 mt-1">
            Configura las pasarelas de pago para tu tienda
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

      {/* PayPal Section */}
      <Card className="overflow-hidden">
        <SectionHeader
          title="PayPal"
          icon={CreditCard}
          section="paypal"
          enabled={settings.paypal.enabled}
          onToggle={() => updatePayPalSettings({ enabled: !settings.paypal.enabled })}
        />
        {expandedSections.includes('paypal') && (
          <CardContent className="border-t border-dark-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Client ID"
                placeholder="Tu PayPal Client ID"
                value={settings.paypal.clientId}
                onChange={(e) => updatePayPalSettings({ clientId: e.target.value })}
              />
              <div className="relative">
                <Input
                  label="Client Secret"
                  type={showPassword['paypal_secret'] ? 'text' : 'password'}
                  placeholder="Tu PayPal Client Secret"
                  value={settings.paypal.clientSecret}
                  onChange={(e) => updatePayPalSettings({ clientSecret: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('paypal_secret')}
                  className="absolute right-3 top-9 text-dark-400 hover:text-white"
                >
                  {showPassword['paypal_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre de Marca"
                placeholder="Nombre que aparece en PayPal"
                value={settings.paypal.brandName}
                onChange={(e) => updatePayPalSettings({ brandName: e.target.value })}
              />
              <Input
                label="Webhook ID (opcional)"
                placeholder="ID del webhook de PayPal"
                value={settings.paypal.webhookId || ''}
                onChange={(e) => updatePayPalSettings({ webhookId: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.paypal.sandbox}
                onChange={(e) => updatePayPalSettings({ sandbox: e.target.checked })}
                className="w-5 h-5 rounded border-dark-700 bg-dark-800 text-primary-500"
              />
              <div>
                <span className="text-white font-medium">Modo Sandbox</span>
                <p className="text-dark-500 text-sm">Usar entorno de pruebas de PayPal</p>
              </div>
            </label>
            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                leftIcon={testingGateway === 'paypal' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                onClick={() => handleTestConnection('paypal')}
                disabled={testingGateway === 'paypal'}
              >
                Probar Conexión
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* MercadoPago Section */}
      <Card className="overflow-hidden">
        <SectionHeader
          title="Mercado Pago"
          icon={Wallet}
          section="mercadopago"
          enabled={settings.mercadopago.enabled}
          onToggle={() => updateMercadoPagoCountry('AR' as MercadoPagoCountry, { 
            ...settings.mercadopago.countries['AR'], 
            enabled: !settings.mercadopago.enabled 
          })}
        />
        {expandedSections.includes('mercadopago') && (
          <CardContent className="border-t border-dark-800 space-y-6">
            <div className="bg-dark-800/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Configuración por país</p>
                  <p className="text-dark-400 text-sm mt-1">
                    Mercado Pago requiere credenciales diferentes para cada país. Configura solo los países donde operarás.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(MERCADOPAGO_COUNTRIES).map(([code, country]) => {
                const countrySettings = settings.mercadopago.countries[code as MercadoPagoCountry];
                const isEnabled = countrySettings?.enabled || false;

                return (
                  <Card key={code} className={`${isEnabled ? 'border-primary-500/30' : ''}`}>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{country.flag}</span>
                          <div>
                            <p className="font-medium text-white">{country.name}</p>
                            <p className="text-dark-500 text-xs">{country.currency}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => updateMercadoPagoCountry(code as MercadoPagoCountry, {
                              ...countrySettings,
                              enabled: e.target.checked,
                            })}
                            aria-label={`Activar ${country.name}`}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      {isEnabled && (
                        <div className="space-y-2 pt-2 border-t border-dark-700">
                          <Input
                            placeholder="Access Token"
                            type="password"
                            className="text-sm py-2"
                            value={countrySettings?.accessToken || ''}
                            onChange={(e) => updateMercadoPagoCountry(code as MercadoPagoCountry, {
                              ...countrySettings,
                              accessToken: e.target.value,
                            })}
                          />
                          <Input
                            placeholder="Public Key"
                            className="text-sm py-2"
                            value={countrySettings?.publicKey || ''}
                            onChange={(e) => updateMercadoPagoCountry(code as MercadoPagoCountry, {
                              ...countrySettings,
                              publicKey: e.target.value,
                            })}
                          />
                          <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={countrySettings?.sandbox || false}
                              onChange={(e) => updateMercadoPagoCountry(code as MercadoPagoCountry, {
                                ...countrySettings,
                                sandbox: e.target.checked,
                              })}
                              className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500"
                            />
                            <span className="text-dark-400">Sandbox</span>
                          </label>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                leftIcon={testingGateway === 'mercadopago' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                onClick={() => handleTestConnection('mercadopago')}
                disabled={testingGateway === 'mercadopago'}
              >
                Probar Conexiones
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Crypto Section */}
      <Card className="overflow-hidden">
        <SectionHeader
          title="Criptomonedas"
          icon={Bitcoin}
          section="crypto"
          enabled={settings.crypto.enabled}
          onToggle={() => updateCryptoSettings({ enabled: !settings.crypto.enabled })}
        />
        {expandedSections.includes('crypto') && (
          <CardContent className="border-t border-dark-800 space-y-4">
            <Select
              label="Proveedor"
              value={settings.crypto.provider}
              onChange={(e) => updateCryptoSettings({ provider: e.target.value as CryptoSettings['provider'] })}
              options={[
                { value: 'coingate', label: 'CoinGate' },
                { value: 'nowpayments', label: 'NOWPayments' },
                { value: 'coinpayments', label: 'CoinPayments' },
              ]}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="API Key"
                  type={showPassword['crypto_key'] ? 'text' : 'password'}
                  placeholder="Tu API Key"
                  value={settings.crypto.apiKey}
                  onChange={(e) => updateCryptoSettings({ apiKey: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('crypto_key')}
                  className="absolute right-3 top-9 text-dark-400 hover:text-white"
                >
                  {showPassword['crypto_key'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {settings.crypto.provider === 'coinpayments' && (
                <>
                  <div className="relative">
                    <Input
                      label="API Secret"
                      type={showPassword['crypto_secret'] ? 'text' : 'password'}
                      placeholder="Tu API Secret"
                      value={settings.crypto.apiSecret || ''}
                      onChange={(e) => updateCryptoSettings({ apiSecret: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('crypto_secret')}
                      className="absolute right-3 top-9 text-dark-400 hover:text-white"
                    >
                      {showPassword['crypto_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Input
                    label="Merchant ID"
                    placeholder="Tu Merchant ID"
                    value={settings.crypto.merchantId || ''}
                    onChange={(e) => updateCryptoSettings({ merchantId: e.target.value })}
                  />
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Criptomonedas Aceptadas
              </label>
              <div className="flex flex-wrap gap-2">
                {['BTC', 'ETH', 'LTC', 'USDT', 'USDC', 'DOGE', 'XRP', 'BNB'].map((crypto) => {
                  const isAccepted = settings.crypto.acceptedCurrencies.includes(crypto);
                  return (
                    <button
                      key={crypto}
                      onClick={() => {
                        const newCurrencies = isAccepted
                          ? settings.crypto.acceptedCurrencies.filter((c) => c !== crypto)
                          : [...settings.crypto.acceptedCurrencies, crypto];
                        updateCryptoSettings({ acceptedCurrencies: newCurrencies });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isAccepted
                          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                          : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-600'
                      }`}
                    >
                      {crypto}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.crypto.sandbox}
                onChange={(e) => updateCryptoSettings({ sandbox: e.target.checked })}
                className="w-5 h-5 rounded border-dark-700 bg-dark-800 text-primary-500"
              />
              <div>
                <span className="text-white font-medium">Modo Sandbox</span>
                <p className="text-dark-500 text-sm">Usar entorno de pruebas</p>
              </div>
            </label>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                leftIcon={testingGateway === 'crypto' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                onClick={() => handleTestConnection('crypto')}
                disabled={testingGateway === 'crypto'}
              >
                Probar Conexión
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bank Transfer Section */}
      <Card className="overflow-hidden">
        <SectionHeader
          title="Transferencia Bancaria"
          icon={Building2}
          section="banktransfer"
          enabled={settings.bankTransfer.enabled}
          onToggle={() => updateBankTransferSettings({ enabled: !settings.bankTransfer.enabled })}
        />
        {expandedSections.includes('banktransfer') && (
          <CardContent className="border-t border-dark-800 space-y-6">
            {/* Meru Integration */}
            <div className="bg-gradient-to-r from-blue-500/10 to-primary-500/10 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white font-medium">Integración con Meru</p>
                  <p className="text-dark-400 text-sm mt-1">
                    Meru proporciona cuentas bancarias virtuales en Europa (SEPA), USA y México para recibir pagos internacionales.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Input
                      label="Meru API Key"
                      type="password"
                      placeholder="Tu Meru API Key"
                      value={settings.bankTransfer.meruApiKey || ''}
                      onChange={(e) => updateBankTransferSettings({ meruApiKey: e.target.value })}
                    />
                    <Input
                      label="Meru Secret Key"
                      type="password"
                      placeholder="Tu Meru Secret Key"
                      value={settings.bankTransfer.meruSecretKey || ''}
                      onChange={(e) => updateBankTransferSettings({ meruSecretKey: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Accounts List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Cuentas Bancarias</h4>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => openBankModal()}
                >
                  Añadir Cuenta
                </Button>
              </div>

              {settings.bankTransfer.accounts.length === 0 ? (
                <div className="text-center py-8 bg-dark-800/50 rounded-xl">
                  <Building2 className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400">No hay cuentas bancarias configuradas</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => openBankModal()}
                  >
                    Añadir Primera Cuenta
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {settings.bankTransfer.accounts.map((account) => (
                    <div
                      key={account.id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${
                        account.isActive ? 'bg-dark-800/50 border-dark-700' : 'bg-dark-900/50 border-dark-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                          {account.region === 'europe' && <span className="text-lg">🇪🇺</span>}
                          {account.region === 'usa' && <span className="text-lg">🇺🇸</span>}
                          {account.region === 'mexico' && <span className="text-lg">🇲🇽</span>}
                          {account.region === 'other' && <Building2 className="w-5 h-5 text-dark-400" />}
                        </div>
                        <div>
                          <p className="font-medium text-white">{account.bankName}</p>
                          <p className="text-dark-400 text-sm">
                            {account.iban || account.clabe || account.accountNumber} • {account.currency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={account.isActive ? 'success' : 'default'} size="sm">
                          {account.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                        <button
                          onClick={() => openBankModal(account)}
                          aria-label="Editar cuenta bancaria"
                          className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeBankAccount(account.id)}
                          aria-label="Eliminar cuenta bancaria"
                          className="p-2 text-dark-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dark-800">
              <Input
                label="Horas de Expiración"
                type="number"
                min="1"
                max="168"
                value={settings.bankTransfer.expirationHours}
                onChange={(e) => updateBankTransferSettings({ expirationHours: parseInt(e.target.value) || 48 })}
                hint="Tiempo máximo para completar la transferencia"
              />
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.bankTransfer.autoConfirm}
                    onChange={(e) => updateBankTransferSettings({ autoConfirm: e.target.checked })}
                    className="w-5 h-5 rounded border-dark-700 bg-dark-800 text-primary-500"
                  />
                  <div>
                    <span className="text-white font-medium">Auto-confirmar con Meru</span>
                    <p className="text-dark-500 text-sm">Confirmar automáticamente cuando se detecte el pago</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                leftIcon={testingGateway === 'banktransfer' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                onClick={() => handleTestConnection('banktransfer')}
                disabled={testingGateway === 'banktransfer'}
              >
                Verificar Cuentas
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bank Account Modal */}
      <Modal
        isOpen={showBankModal}
        onClose={() => {
          setShowBankModal(false);
          setEditingBankAccount(null);
        }}
        title={editingBankAccount ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Región"
            value={bankForm.region || 'europe'}
            onChange={(e) => {
              const region = e.target.value as BankRegion;
              const currencyMap: Record<BankRegion, string> = {
                europe: 'EUR',
                usa: 'USD',
                mexico: 'MXN',
                other: 'USD',
              };
              setBankForm({ ...bankForm, region, currency: currencyMap[region] });
            }}
            options={[
              { value: 'europe', label: '🇪🇺 Europa (SEPA)' },
              { value: 'usa', label: '🇺🇸 Estados Unidos' },
              { value: 'mexico', label: '🇲🇽 México' },
              { value: 'other', label: '🌍 Otro' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre del Banco"
              placeholder="Ej: BBVA"
              value={bankForm.bankName || ''}
              onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
              required
            />
            <Input
              label="Moneda"
              placeholder="EUR, USD, MXN"
              value={bankForm.currency || ''}
              onChange={(e) => setBankForm({ ...bankForm, currency: e.target.value })}
              required
            />
          </div>

          <Input
            label="Titular de la Cuenta"
            placeholder="Nombre completo o empresa"
            value={bankForm.accountHolder || ''}
            onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
            required
          />

          {bankForm.region === 'europe' && (
            <>
              <Input
                label="IBAN"
                placeholder="ES00 0000 0000 0000 0000 0000"
                value={bankForm.iban || ''}
                onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
              />
              <Input
                label="BIC/SWIFT"
                placeholder="XXXXXXXX"
                value={bankForm.bic || ''}
                onChange={(e) => setBankForm({ ...bankForm, bic: e.target.value })}
              />
            </>
          )}

          {bankForm.region === 'usa' && (
            <>
              <Input
                label="Número de Cuenta"
                placeholder="Account Number"
                value={bankForm.accountNumber || ''}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
              />
              <Input
                label="Routing Number (ABA)"
                placeholder="9 dígitos"
                value={bankForm.routingNumber || ''}
                onChange={(e) => setBankForm({ ...bankForm, routingNumber: e.target.value })}
              />
            </>
          )}

          {bankForm.region === 'mexico' && (
            <Input
              label="CLABE"
              placeholder="18 dígitos"
              value={bankForm.clabe || ''}
              onChange={(e) => setBankForm({ ...bankForm, clabe: e.target.value })}
            />
          )}

          {bankForm.region === 'other' && (
            <Input
              label="Número de Cuenta"
              placeholder="Account Number"
              value={bankForm.accountNumber || ''}
              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
            />
          )}

          <Textarea
            label="Instrucciones de Pago"
            placeholder="Instrucciones adicionales para el cliente..."
            value={bankForm.instructions || ''}
            onChange={(e) => setBankForm({ ...bankForm, instructions: e.target.value })}
            rows={2}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={bankForm.isActive ?? true}
              onChange={(e) => setBankForm({ ...bankForm, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-dark-700 bg-dark-800 text-primary-500"
            />
            <span className="text-white font-medium">Cuenta Activa</span>
          </label>

          <div className="flex gap-3 pt-4 border-t border-dark-800">
            <Button variant="secondary" className="flex-1" onClick={() => setShowBankModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" className="flex-1" onClick={saveBankAccount}>
              {editingBankAccount ? 'Guardar Cambios' : 'Añadir Cuenta'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminPaymentSettings;
