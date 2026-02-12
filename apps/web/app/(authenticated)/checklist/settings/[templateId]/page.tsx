'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, File, Plus } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TaskItem } from '@/components/task-item';
import { useTemplate } from '@/hooks/use-template';
import { apiPost, apiPatch, apiDelete } from '@/lib/api';
import type { TemplateTask, TaskType } from '@repo/contracts';
import { TemplateTaskFormSheet } from '@/components/template-task-form-sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BackButton = () => (
  <div className="flex items-center gap-2">
    <Link href="/checklist/settings">
      <Button variant="ghost" size="sm" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
    </Link>
  </div>
);

export default function TemplateDetailPage() {
  const params = useParams();
  const templateId = params.templateId as string;

  const { template, isLoading, error, mutate } = useTemplate(templateId, {
    enabled: !!templateId,
  });

  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    taskType: '' as TaskType | '',
    dueInDays: '',
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    taskType?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [sortedTasks, setSortedTasks] = useState<TemplateTask[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (template?.templateTasks) {
      setSortedTasks(
        [...template.templateTasks].sort((a, b) => a.order - b.order),
      );
    }
  }, [template?.templateTasks]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = sortedTasks.findIndex((task) => task.id === active.id);
      const newIndex = sortedTasks.findIndex((task) => task.id === over.id);

      const newTasks = arrayMove(sortedTasks, oldIndex, newIndex);
      setSortedTasks(newTasks);

      try {
        const updates = newTasks.map((task, index) => ({
          id: task.id,
          order: index + 1,
        }));

        await Promise.all(
          updates.map((update) =>
            apiPatch(`/checklists/templates/${templateId}/tasks/${update.id}`, {
              order: update.order,
            }),
          ),
        );

        mutate();
      } catch (error) {
        setSortedTasks(sortedTasks);
        alert(
          error instanceof Error ? error.message : 'Failed to reorder tasks',
        );
      }
    },
    [sortedTasks, templateId, mutate],
  );

  const resetForm = useCallback(() => {
    setFormValues({
      name: '',
      description: '',
      taskType: '',
      dueInDays: '',
    });
    setFormErrors({});
    setFormError(null);
    setSubmitting(false);
    setEditingTaskId(null);
  }, []);

  const handleFormOpenChange = useCallback(
    (open: boolean) => {
      setFormSheetOpen(open);
      if (!open) resetForm();
    },
    [resetForm],
  );

  const handleFormChange = useCallback(
    (
      field: 'name' | 'description' | 'taskType' | 'dueInDays',
      value: string,
    ) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
      if (formErrors[field as keyof typeof formErrors]) {
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [formErrors],
  );

  const validateForm = useCallback(() => {
    const errors: typeof formErrors = {};
    if (!formValues.name.trim()) {
      errors.name = 'Task name is required';
    }
    if (!formValues.taskType) {
      errors.taskType = 'Task type is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formValues]);

  const handleFormSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const order =
        formMode === 'create'
          ? (template?.templateTasks?.reduce(
              (max, task) => Math.max(max, task.order),
              0,
            ) ?? 0) + 1
          : undefined;

      const payload = {
        name: formValues.name.trim(),
        description: formValues.description.trim() || null,
        ...(order !== undefined && { order }),
        taskType: formValues.taskType as TaskType,
        dueInDays: formValues.dueInDays ? Number(formValues.dueInDays) : null,
      };

      const endpoint =
        formMode === 'create'
          ? `/checklists/templates/${templateId}/tasks`
          : `/checklists/templates/${templateId}/tasks/${editingTaskId}`;

      const method =
        formMode === 'create' ? apiPost<TemplateTask> : apiPatch<TemplateTask>;
      await method(endpoint, payload);

      mutate();
      handleFormOpenChange(false);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : `Unable to ${formMode} template task. Please try again.`;
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    validateForm,
    formMode,
    template?.templateTasks,
    formValues.name,
    formValues.description,
    formValues.taskType,
    formValues.dueInDays,
    templateId,
    editingTaskId,
    mutate,
    handleFormOpenChange,
  ]);

  const handleCreateClick = useCallback(() => {
    setFormMode('create');
    setFormValues({
      name: '',
      description: '',
      taskType: '',
      dueInDays: '',
    });
    setFormErrors({});
    setFormError(null);
    setFormSheetOpen(true);
  }, []);

  const openEditForm = useCallback((task: TemplateTask) => {
    setFormMode('edit');
    setEditingTaskId(task.id);
    setFormValues({
      name: task.name,
      description: task.description ?? '',
      taskType: task.taskType,
      dueInDays: task.dueInDays ? String(task.dueInDays) : '',
    });
    setFormErrors({});
    setFormError(null);
    setFormSheetOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (taskId: string) => {
      if (!confirm('Are you sure you want to delete this task?')) return;

      setDeletingTaskId(taskId);
      try {
        await apiDelete(`/checklists/templates/${templateId}/tasks/${taskId}`);
        mutate();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete task');
      } finally {
        setDeletingTaskId(null);
      }
    },
    [templateId, mutate],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BackButton />
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading template...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="space-y-6">
        <BackButton />
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            {error ? 'Failed to load template' : 'Template not found'}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />

      <Card>
        <CardHeader className="gap-4">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                template.type === 'ONBOARDING'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <File className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{template.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {template.description ?? 'No description provided.'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-background/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Type
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {template.type === 'ONBOARDING' ? 'Onboarding' : 'Offboarding'}
            </p>
          </div>
          <div className="rounded-lg border bg-background/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Created
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {formatDate(template.createdAt)}
            </p>
          </div>
          <div className="rounded-lg border bg-background/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Updated
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {formatDate(template.updatedAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg">Template Tasks</CardTitle>
          <Button size="sm" className="gap-2" onClick={handleCreateClick}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          {!sortedTasks || sortedTasks.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No tasks yet. Add your first task to get started.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedTasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sortedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onEdit={openEditForm}
                      onDelete={handleDelete}
                      isDeleting={deletingTaskId === task.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <TemplateTaskFormSheet
        open={formSheetOpen}
        onOpenChange={handleFormOpenChange}
        title={
          formMode === 'create' ? 'New Template Task' : 'Edit Template Task'
        }
        formValues={formValues}
        onFormChange={handleFormChange}
        formErrors={formErrors}
        formError={formError}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
