'use client';

import { AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { TextareaProps } from './TextArea.types';

const TextArea = ({
  name,
  label,
  value,
  error,
  onBlur,
  touched,
  onChange,
  rows = 4,
  className,
  placeholder,
  required = false,
}: TextareaProps) => {
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
          'relative w-full rounded-[10px] border',
          borderColor,
          className,
        )}
      >
        <textarea
          name={name}
          rows={rows}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-6 py-5 rounded-[10px] font-medium text-sm border-0 outline-none focus:border-0 focus:outline-none focus:ring-0 text-greyscale-900 placeholder:text-greyscale-500 resize-none overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        />
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

export { TextArea };
