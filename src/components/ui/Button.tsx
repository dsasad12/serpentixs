import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'ref' | 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40',
      secondary: 'bg-dark-800 text-white hover:bg-dark-700 border border-dark-700 hover:border-dark-600',
      accent: 'bg-gradient-to-r from-accent-600 to-accent-500 text-white hover:from-accent-500 hover:to-accent-400 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40',
      success: 'bg-gradient-to-r from-success-600 to-success-500 text-white hover:from-success-500 hover:to-success-400 shadow-lg shadow-success-500/25',
      danger: 'bg-gradient-to-r from-danger-600 to-danger-500 text-white hover:from-danger-500 hover:to-danger-400 shadow-lg shadow-danger-500/25',
      ghost: 'text-dark-300 hover:text-white hover:bg-dark-800/50',
    };

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: '',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
