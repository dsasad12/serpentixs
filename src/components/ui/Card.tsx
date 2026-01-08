import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

const Card = ({ children, className = '', hover = false, glow = false, onClick }: CardProps) => {
  const baseClass = 'card';
  const hoverClass = hover ? 'card-hover cursor-pointer' : '';
  const glowClass = glow ? 'card-glow' : '';

  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseClass} ${hoverClass} ${glowClass} ${className}`}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseClass} ${hoverClass} ${glowClass} ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

const CardTitle = ({ children, className = '' }: CardTitleProps) => {
  return (
    <h3 className={`text-xl font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

const CardDescription = ({ children, className = '' }: CardDescriptionProps) => {
  return (
    <p className={`text-dark-400 text-sm mt-1 ${className}`}>
      {children}
    </p>
  );
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

const CardContent = ({ children, className = '' }: CardContentProps) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return (
    <div className={`mt-4 pt-4 border-t border-dark-800 ${className}`}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
