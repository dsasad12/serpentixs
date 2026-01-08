import { forwardRef, type InputHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="label">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              input
              ${leftIcon ? 'pl-12' : ''}
              ${rightIcon || error ? 'pr-12' : ''}
              ${error ? 'input-error' : ''}
              ${className}
            `}
            {...props}
          />
          {(rightIcon || error) && (
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${error ? 'text-danger-500' : 'text-dark-500'}`}>
              {error ? <AlertCircle className="w-5 h-5" /> : rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-danger-500 flex items-center gap-1">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-dark-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
