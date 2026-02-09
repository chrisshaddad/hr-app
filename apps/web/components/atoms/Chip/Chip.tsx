import { cn } from '@/lib/utils';
import { ChipProps } from './Chip.types';

const Chip = ({ variant = 'default', text, className }: ChipProps) => {
  const variantStyles = {
    info: 'bg-others-lightblue text-others-blue',
    default: 'bg-greyscale-100 text-greyscale-500',
    success: 'bg-primary-100 text-alerts-success-base',
    warning: 'bg-secondary-200 text-alerts-warning-dark',
    error: 'bg-alerts-error-light text-alerts-error-base',
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        'inline-flex items-center py-1 px-4 rounded-md select-none text-[10px] font-bold w-fit',
        className,
      )}
    >
      {text}
    </div>
  );
};

export { Chip };
