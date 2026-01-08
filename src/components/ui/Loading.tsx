import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const Loading = ({ size = 'md', text, fullScreen = false }: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-500`} />
      {text && <p className="text-dark-400 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton component for loading states
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

const Skeleton = ({
  className = '',
  variant = 'text',
}: SkeletonProps) => {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`bg-dark-800 animate-pulse ${variantClasses[variant]} ${className}`}
    />
  );
};

// Page Loading component with logo
const PageLoading = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center mx-auto">
            <span className="text-3xl font-bold text-white">S</span>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 animate-ping opacity-20" />
        </div>
        <Loading size="md" text="Loading SerpentixsPay..." />
      </div>
    </div>
  );
};

export { Loading, Skeleton, PageLoading };
