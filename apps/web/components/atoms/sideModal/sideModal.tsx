'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

import { cn } from '@/lib/utils';
import { SideModalProps } from './SideModal.types';

const SideModal = ({
  open,
  children,
  className,
  onOpenChange,
  side = 'right',
  width = '400px',
}: SideModalProps) => {
  const sideStyles = {
    left: 'left-0 translate-x-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
    right:
      'right-0 translate-x-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-0 z-50 h-full bg-Others-White shadow-[0_2px_8px_0_rgba(0,0,0,0.1)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            sideStyles[side],
            className,
          )}
          style={{ width }}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Side Modal</DialogPrimitive.Title>
          </VisuallyHidden.Root>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export { SideModal };
