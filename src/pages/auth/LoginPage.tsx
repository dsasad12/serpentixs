import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from '../../components/ui/Toast';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success('¡Bienvenido!', 'Has iniciado sesión correctamente');
      navigate('/client');
    } catch (error) {
      toast.error('Error', 'Email o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold font-display">
              <span className="text-white">Serpentixs</span>
              <span className="gradient-text">Pay</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido de nuevo</h1>
          <p className="text-dark-400 mb-8">
            Inicia sesión para acceder a tu panel de control
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-dark-400">Recordarme</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Iniciar Sesión
            </Button>
          </form>

          <p className="mt-8 text-center text-dark-400">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Regístrate gratis
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-600 to-primary-800" />
        <div className="absolute inset-0 bg-dark-950/20" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 auth-pattern-overlay" />

        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-8 mx-auto">
              <span className="text-5xl font-bold text-white">S</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Panel de Control
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              Gestiona tus servicios, facturas y soporte desde un único lugar.
              Simple, rápido y seguro.
            </p>

            <div className="mt-12 grid grid-cols-3 gap-8">
              {[
                { value: '50K+', label: 'Clientes' },
                { value: '99.9%', label: 'Uptime' },
                { value: '24/7', label: 'Soporte' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
