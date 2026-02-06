import { cn } from '@/lib/utils';
import { ChipProps } from './Chip.types';

const Chip = ({ variant = 'default', text, className }: ChipProps) => {
  const variantStyles = {
    info: 'bg-Others-LightBlue text-Others-Blue',
    default: 'bg-GreyScale-100 text-GreyScale-500',
    success: 'bg-Primary-100 text-Alerts-Success-Base',
    warning: 'bg-Secondary-200 text-Alerts-Warning-Dark',
    error: 'bg-Alerts-Error-Light text-Alerts-Error-Base',
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
