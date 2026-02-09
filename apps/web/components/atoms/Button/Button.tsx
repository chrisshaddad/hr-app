import { cn } from '@/lib/utils';
import { ButtonProps } from './Button.types';

const Button = ({
  text,
  onClick,
  endIcon,
  className,
  startIcon,
  fullWidth,
  size = 'lg',
  disabled = false,
  variant = 'primary',
}: ButtonProps) => {
  const variantStyles = {
    primary: 'bg-greyscale-900 text-others-white',
    secondary: 'bg-others-white text-greyscale-900 border border-greyscale-900',
  };
  const sizeStyles = {
    sm: 'h-8 text-xs',
    md: 'h-12 text-sm',
    lg: 'h-14 text-base',
  };
  const disabledStyles = 'bg-greyscale-200 text-[#969696] border-0';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[10px] px-6 font-medium transition-colors cursor-pointer whitespace-nowrap disabled:pointer-events-none',
        sizeStyles[size],
        fullWidth ? 'w-full' : 'w-fit',
        disabled ? disabledStyles : variantStyles[variant],
        className,
      )}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {text}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export { Button };
