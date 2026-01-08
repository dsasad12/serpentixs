import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../stores';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { toast } from '../../components/ui/Toast';

const CartPage = () => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  const {
    items,
    subtotal,
    tax,
    total,
    discount,
    couponCode: appliedCoupon,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    const success = await applyCoupon(couponCode);
    setIsApplyingCoupon(false);

    if (success) {
      toast.success('¡Cupón aplicado!', 'El descuento se ha aplicado a tu pedido');
      setCouponCode('');
    } else {
      toast.error('Cupón inválido', 'El código introducido no es válido');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-24 h-24 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-dark-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Tu carrito está vacío</h1>
          <p className="text-dark-400 mb-8">
            Parece que aún no has añadido ningún servicio. ¡Explora nuestros planes!
          </p>
          <Link to="/services/game-hosting">
            <Button variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Ver Servicios
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Tu Carrito</h1>
          <p className="text-dark-400 mb-8">
            Tienes {items.length} {items.length === 1 ? 'artículo' : 'artículos'} en tu carrito
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Product info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.productName}</h3>
                        <p className="text-dark-400 text-sm">{item.planName}</p>
                        <p className="text-primary-400 text-sm mt-1">
                          Facturación: {item.billingCycle}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Reducir cantidad"
                          className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                          className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold text-white">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-dark-500 text-sm">
                            €{item.price.toFixed(2)} c/u
                          </p>
                        )}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Eliminar del carrito"
                        className="p-2 text-dark-400 hover:text-danger-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent>
                  <h2 className="text-xl font-semibold text-white mb-6">Resumen del Pedido</h2>

                  {/* Coupon */}
                  <div className="mb-6">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-success-500/10 border border-success-500/20 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-success-400" />
                          <span className="text-success-400 font-medium">{appliedCoupon}</span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-dark-400 hover:text-white text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Código de cupón"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          leftIcon={<Tag className="w-4 h-4" />}
                        />
                        <Button
                          variant="secondary"
                          onClick={handleApplyCoupon}
                          isLoading={isApplyingCoupon}
                        >
                          Aplicar
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-dark-500 mt-2">
                      Prueba: WELCOME10, SAVE20, HOSTING50
                    </p>
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 py-4 border-t border-dark-800">
                    <div className="flex justify-between text-dark-400">
                      <span>Subtotal</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-success-400">
                        <span>Descuento</span>
                        <span>-€{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-dark-400">
                      <span>IVA (21%)</span>
                      <span>€{tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4 border-t border-dark-800">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-2xl font-bold text-white">€{total.toFixed(2)}</span>
                  </div>

                  <Link to="/checkout" className="block mt-4">
                    <Button
                      variant="primary"
                      className="w-full"
                      size="lg"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Proceder al Pago
                    </Button>
                  </Link>

                  <Link to="/services/game-hosting" className="block mt-4">
                    <Button variant="ghost" className="w-full">
                      Seguir Comprando
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CartPage;
