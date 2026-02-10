'use client';

import { AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { InputProps } from './Input.types';

const Input = ({
  icon,
  name,
  value,
  label,
  error,
  onBlur,
  touched,
  onChange,
  className,
  placeholder,
  type = 'text',
  required = false,
  autoComplete = 'off',
}: InputProps) => {
  const showError = error && touched;
  const borderColor = showError
    ? 'border-alerts-error-base'
    : 'border-greyscale-300';

  return (
    <div className="flex flex-col gap-[10px] w-full">
      {label && (
        <p className="text-greyscale-900 text-sm font-medium select-none flex items-center gap-1">
          {label}
          {required && <span className="text-alerts-error-base">*</span>}
        </p>
      )}
      <div
        className={cn(
          'relative w-full rounded-[10px] border h-13 flex items-center',
          borderColor,
          className,
        )}
      >
        <input
          type={type}
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            'h-full w-full px-5 rounded-[10px] font-medium text-sm border-0 outline-none focus:border-0 focus:outline-none focus:ring-0 text-greyscale-900 placeholder:text-greyscale-500 placeholder:font-normal',
            icon ? 'pr-0' : 'pr-5',
          )}
        />
        {icon && (
          <div className="h-full flex items-center justify-center rounded-r-[10px] pr-5 pl-[10px]">
            {icon}
          </div>
        )}
      </div>
      {showError && (
        <div className="flex items-center gap-1">
          <AlertCircle className="h-4 w-4 text-alerts-error-base" />
          <p className="text-alerts-error-base text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export { Input };
