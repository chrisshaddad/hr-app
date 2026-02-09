'use client';

import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

import { cn } from '@/lib/utils';
import { Input } from '../Input/Input';
import { DatePickerProps } from './DatePicker.types';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/atoms/Dialog/Dialog';

const DatePicker = ({
  label,
  value,
  error,
  onBlur,
  touched,
  onChange,
  className,
  required = false,
  placeholder = 'Select date',
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined,
  );

  const formattedDate = selectedDate ? format(selectedDate, 'dd MMM yyyy') : '';

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const dateString = format(date, 'yyyy-MM-dd');
      onChange?.(dateString);
      setIsOpen(false);
      setTimeout(() => {
        if (onBlur) {
          onBlur();
        }
      }, 0);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (!newOpen && onBlur) {
      setTimeout(() => {
        onBlur();
      }, 100);
    }
  };

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(undefined);
    }
  }, [value]);

  return (
    <>
      <div className={cn('w-full flex flex-col gap-[10px]', className)}>
        {label && (
          <p className="text-GreyScale-900 text-sm font-medium select-none flex items-center gap-1">
            {label}
            {required && <span className="text-Alerts-Error-Base">*</span>}
          </p>
        )}
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          <Input
            label={undefined}
            required={false}
            value={formattedDate}
            error={error}
            touched={touched}
            placeholder={placeholder}
            onChange={() => {}}
            icon={<Calendar className="h-5 w-5 text-GreyScale-900" />}
          />
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="w-auto max-w-[95vw] mx-4 p-6"
          showCloseButton={false}
        >
          <VisuallyHidden.Root>
            <DialogTitle>
              {label ? `Select ${label}` : 'Select date'}
            </DialogTitle>
          </VisuallyHidden.Root>
          <div className="flex justify-center">
            <DayPicker
              animate
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              classNames={{
                today: 'text-Primary-Base',
                selected: 'bg-Primary-Base !text-Others-White rounded-full',
                chevron: 'text-GreyScale-900',
                caption_label: 'text-GreyScale-900 text-[20px] font-bold',
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { DatePicker };
