'use client';

import { useState } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { cn } from '@/lib/utils';
import { DropdownItem, DropdownProps } from './Dropdown.types';

const Dropdown = ({
  items,
  value,
  label,
  error,
  onBlur,
  touched,
  onChange,
  className,
  placeholder,
  align = 'start',
  required = false,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);

  const selectedItem = items.find((item) => item.value === value);
  const hasValue = !!selectedItem;
  const showError = error && touched;
  const triggerText = selectedItem?.label || placeholder;
  const borderColor = showError
    ? 'border-Alerts-Error-Base'
    : 'border-GreyScale-300';

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onBlur) {
      onBlur();
    }
  };

  return (
    <div className="flex flex-col gap-[10px]">
      {label && (
        <p className="text-GreyScale-900 text-sm font-medium select-none flex items-center gap-1">
          {label}
          {required && <span className="text-Alerts-Error-Base">*</span>}
        </p>
      )}
      <DropdownMenu.Root open={open} onOpenChange={handleOpenChange}>
        <DropdownMenu.Trigger asChild>
          <button
            className={cn(
              'inline-flex items-center justify-between gap-[10px] px-5 h-13 select-none rounded-[10px] border cursor-pointer bg-Others-White text-sm focus:outline-none',
              className,
              borderColor,
            )}
          >
            <span
              className={cn(
                'text-[14px]',
                hasValue
                  ? 'text-GreyScale-900 font-medium'
                  : 'text-GreyScale-500 font-normal',
              )}
            >
              {triggerText}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-GreyScale-900 transition-transform duration-200',
                open && 'rotate-180',
              )}
            />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align={align}
            sideOffset={5}
            className={cn(
              'min-w-[220px] bg-Others-White rounded-[12px] shadow-[0_2px_8px_0_rgba(0,0,0,0.1)] p-4 z-50',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            )}
          >
            <p className="text-GreyScale-900 text-base font-bold select-none">
              {placeholder}
            </p>
            <div className="pt-4 gap-2 flex flex-col">
              {items.map((item: DropdownItem) => {
                const isSelected = value === item.value;

                return (
                  <DropdownMenu.Item
                    key={item.value}
                    className={cn(
                      'relative flex items-center justify-between py-2 pr-4 h-13 text-sm text-GreyScale-900 rounded-[10px] cursor-pointer outline-none',
                      isSelected ? 'bg-GreyScale-100 pl-4' : '',
                      'data-disabled:pointer-events-none data-disabled:opacity-50',
                    )}
                    onSelect={(e) => {
                      e.preventDefault();
                      onChange?.(item.value);
                      setOpen(false);
                    }}
                  >
                    <span className="text-GreyScale-900 text-sm font-bold">
                      {item.label}
                    </span>
                    {isSelected && (
                      <Check className="h-6 w-6 text-Primary-Base" />
                    )}
                  </DropdownMenu.Item>
                );
              })}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {showError && (
        <div className="flex items-center gap-1">
          <AlertCircle className="h-4 w-4 text-Alerts-Error-Base" />
          <p className="text-Alerts-Error-Base text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export { Dropdown };
