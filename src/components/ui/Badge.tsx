import type { ReactNode } from 'react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'accent' | 'default' | 'info';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const Badge = ({ children, variant = 'default', size = 'md', className = '', dot = false }: BadgeProps) => {
  const baseClass = 'inline-flex items-center rounded-full font-semibold';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };
  
  const variantClasses: Record<BadgeVariant, string> = {
    primary: 'bg-primary-500/20 text-primary-400',
    success: 'bg-success-500/20 text-success-400',
    warning: 'bg-warning-500/20 text-warning-400',
    danger: 'bg-danger-500/20 text-danger-400',
    accent: 'bg-accent-500/20 text-accent-400',
    info: 'bg-blue-500/20 text-blue-400',
    default: 'bg-dark-700 text-dark-300',
  };

  return (
    <span className={`${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {dot && (
        <span className={`w-2 h-2 rounded-full mr-2 ${
          variant === 'success' ? 'bg-success-400' :
          variant === 'warning' ? 'bg-warning-400' :
          variant === 'danger' ? 'bg-danger-400' :
          variant === 'primary' ? 'bg-primary-400' :
          variant === 'accent' ? 'bg-accent-400' :
          variant === 'info' ? 'bg-blue-400' :
          'bg-dark-400'
        }`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
