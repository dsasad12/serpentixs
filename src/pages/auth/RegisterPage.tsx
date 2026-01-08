import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Check } from 'lucide-react';
import { useAuthStore } from '../../stores';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from '../../components/ui/Toast';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Nombre muy corto'),
  lastName: z.string().min(2, 'Apellido muy corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const password = watch('password', '');

  const passwordRequirements = [
    { text: 'Al menos 8 caracteres', valid: password.length >= 8 },
    { text: 'Una letra mayúscula', valid: /[A-Z]/.test(password) },
    { text: 'Una letra minúscula', valid: /[a-z]/.test(password) },
    { text: 'Un número', valid: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      toast.success('¡Cuenta creada!', 'Bienvenido a SerpentixsPay');
      navigate('/client');
    } catch (error) {
      toast.error('Error', 'El email ya está registrado');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-primary-600 to-accent-800" />
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
              Únete a la Comunidad
            </h2>
            <p className="text-white/80 text-lg max-w-md mb-8">
              Más de 50,000 clientes confían en nosotros para sus proyectos.
              Empieza tu aventura hoy.
            </p>

            <div className="space-y-4 text-left max-w-sm mx-auto">
              {[
                'Activación instantánea de servicios',
                'Soporte técnico 24/7 incluido',
                'Panel de control intuitivo',
                'Garantía de devolución de 30 días',
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
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

          <h1 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-dark-400 mb-8">
            Empieza gratis. No se requiere tarjeta de crédito.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                placeholder="John"
                leftIcon={<User className="w-5 h-5" />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Apellido"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
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
              
              {/* Password requirements */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-xs ${
                      req.valid ? 'text-success-400' : 'text-dark-500'
                    }`}
                  >
                    <Check className={`w-3 h-3 ${req.valid ? 'opacity-100' : 'opacity-30'}`} />
                    {req.text}
                  </div>
                ))}
              </div>
            </div>

            <Input
              label="Confirmar Contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
                {...register('acceptTerms')}
              />
              <span className="text-sm text-dark-400">
                Acepto los{' '}
                <Link to="/legal/terms" className="text-primary-400 hover:text-primary-300">
                  Términos de Servicio
                </Link>{' '}
                y la{' '}
                <Link to="/legal/privacy" className="text-primary-400 hover:text-primary-300">
                  Política de Privacidad
                </Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-sm text-danger-500">{errors.acceptTerms.message}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Crear Cuenta
            </Button>
          </form>

          <p className="mt-8 text-center text-dark-400">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Inicia sesión
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
