import { useCallback } from 'react';
import type { ChangeEvent } from 'react';

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TemplateFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formValues: { name: string; description: string };
  onFormChange: (field: 'name' | 'description', value: string) => void;
  formErrors: { name?: string };
  formError: string | null;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
}

function TemplateFormSheet(props: TemplateFormSheetProps) {
  const {
    formError,
    formErrors,
    formValues,
    isSubmitting,
    onFormChange,
    onOpenChange,
    onSubmit,
    open,
    title,
  } = props;

  const handleNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onFormChange('name', e.target.value);
    },
    [onFormChange],
  );

  const handleDescriptionChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onFormChange('description', e.target.value);
    },
    [onFormChange],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full max-w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-6">
          <SheetTitle className="text-lg">{title}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-5 px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="template-name" className="text-sm font-medium">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="template-name"
              placeholder="Template name"
              value={formValues.name}
              onChange={handleNameChange}
              aria-invalid={formErrors.name ? 'true' : 'false'}
            />
            {formErrors.name ? (
              <p className="text-xs text-destructive">{formErrors.name}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="template-description"
              className="text-sm font-medium"
            >
              Description
            </Label>
            <Textarea
              id="template-description"
              placeholder="Template description"
              value={formValues.description}
              onChange={handleDescriptionChange}
              className="min-h-32 resize-none"
            />
          </div>
          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}
        </div>
        <SheetFooter className="flex-row justify-end gap-3 border-t px-6 py-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : title.includes('New')
                ? 'Create'
                : 'Save'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default TemplateFormSheet;
