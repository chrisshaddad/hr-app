import type { ChangeEvent } from 'react';
import { useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TaskType } from '@repo/contracts';

interface TemplateTaskFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formValues: {
    name: string;
    description: string;
    taskType: TaskType | '';
    dueInDays: string;
  };
  onFormChange: (
    field: 'name' | 'description' | 'taskType' | 'dueInDays',
    value: string,
  ) => void;
  formErrors: { name?: string; taskType?: string };
  formError: string | null;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
}

export function TemplateTaskFormSheet({
  open,
  onOpenChange,
  title,
  formValues,
  onFormChange,
  formErrors,
  formError,
  isSubmitting,
  onSubmit,
}: TemplateTaskFormSheetProps) {
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

  const handleDueInDaysChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onFormChange('dueInDays', e.target.value);
    },
    [onFormChange],
  );

  const handleTaskTypeChange = useCallback(
    (value: string) => {
      onFormChange('taskType', value);
    },
    [onFormChange],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full max-w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-6">
          <SheetTitle className="text-lg">{title}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="task-name" className="text-sm font-medium">
              Task Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-name"
              placeholder="Complete onboarding form"
              value={formValues.name}
              onChange={handleNameChange}
              aria-invalid={formErrors.name ? 'true' : 'false'}
            />
            {formErrors.name ? (
              <p className="text-xs text-destructive">{formErrors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-type" className="text-sm font-medium">
              Task Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formValues.taskType}
              onValueChange={handleTaskTypeChange}
            >
              <SelectTrigger id="task-type">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECKLIST">Checklist</SelectItem>
                <SelectItem value="UPLOAD">Upload</SelectItem>
                <SelectItem value="EMPLOYEE_INFORMATION">
                  Employee Information
                </SelectItem>
              </SelectContent>
            </Select>
            {formErrors.taskType ? (
              <p className="text-xs text-destructive">{formErrors.taskType}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due-in-days" className="text-sm font-medium">
              Due in Days
            </Label>
            <Input
              id="task-due-in-days"
              type="number"
              placeholder="7"
              value={formValues.dueInDays}
              onChange={handleDueInDaysChange}
            />
            <p className="text-xs text-muted-foreground">
              Number of days after checklist start date. Leave empty for no due
              date.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="task-description"
              placeholder="Task description"
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
