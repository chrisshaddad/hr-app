'use client';

import {
  Eye,
  FileText,
  LayoutList,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTemplates } from '@/hooks/use-templates';
import type { Template, TemplateType } from '@repo/contracts';
import TemplateFormSheet from '@/components/template-form-sheet';

const navItems = [
  {
    id: 'ONBOARDING',
    label: 'Onboarding',
    description: 'New hires and transfers',
    icon: LayoutList,
  },
  {
    id: 'OFFBOARDING',
    label: 'Offboarding',
    description: 'Exit workflows and access',
    icon: ShieldCheck,
  },
] as const satisfies ReadonlyArray<{
  id: TemplateType;
  label: string;
  description: string;
  icon: React.ElementType;
}>;

function ChecklistSettingsPage() {
  const [activeNav, setActiveNav] = useState<(typeof navItems)[number]['id']>(
    navItems[0].id,
  );
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<{ name?: string }>(() => ({}));
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(
    null,
  );

  const {
    templates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useTemplates({
    type: activeNav,
  });
  const templateList = templates ?? [];

  const resetFormState = useCallback(() => {
    setFormValues({ name: '', description: '' });
    setFormErrors({});
    setFormError(null);
    setSubmitting(false);
    setEditingTemplateId(null);
  }, []);

  const handleFormOpenChange = useCallback(
    (open: boolean) => {
      setFormSheetOpen(open);
      if (!open) {
        resetFormState();
      }
    },
    [resetFormState],
  );

  const handleFormChange = useCallback(
    (field: 'name' | 'description', value: string) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
      if (field === 'name' && formErrors.name) {
        setFormErrors((prev) => ({ ...prev, name: undefined }));
      }
    },
    [formErrors.name],
  );

  const handleFormSubmit = useCallback(async () => {
    const trimmedName = formValues.name.trim();
    const trimmedDescription = formValues.description.trim();

    if (!trimmedName) {
      setFormErrors({ name: 'Template name is required.' });
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (formMode === 'create') {
        await createTemplate({
          type: activeNav,
          name: trimmedName,
          description: trimmedDescription ? trimmedDescription : undefined,
        });
      } else if (editingTemplateId) {
        await updateTemplate(editingTemplateId, {
          name: trimmedName,
          description: trimmedDescription ? trimmedDescription : undefined,
        });
      }
      handleFormOpenChange(false);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : `Unable to ${formMode} template. Please try again.`;
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    formMode,
    formValues,
    editingTemplateId,
    activeNav,
    createTemplate,
    updateTemplate,
    handleFormOpenChange,
  ]);

  const handleCreateClick = useCallback(() => {
    setFormMode('create');
    resetFormState();
    setFormSheetOpen(true);
  }, [resetFormState]);

  const openEditForm = useCallback((template: Template) => {
    setFormMode('edit');
    setEditingTemplateId(template.id);
    setFormValues({
      name: template.name,
      description: template.description ?? '',
    });
    setFormErrors({});
    setFormError(null);
    setFormSheetOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (templateId: string) => {
      if (!confirm('Are you sure you want to delete this template?')) {
        return;
      }

      setDeletingTemplateId(templateId);
      try {
        await deleteTemplate(templateId);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to delete template';
        alert(message);
      } finally {
        setDeletingTemplateId(null);
      }
    },
    [deleteTemplate],
  );

  return (
    <div className="relative space-y-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_55%),radial-gradient(circle_at_bottom,rgba(251,146,60,0.16),transparent_55%)]" />

      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Checklist Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage templates, steps, and access rules for every employee flow.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <Card className="gap-4 py-5">
          <CardHeader className="pb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Template Groups
            </CardTitle>
            <CardDescription className="text-sm">
              Organize journeys by lifecycle stage.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  type="button"
                  className={`cursor-pointer flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition hover:border-foreground/20 hover:bg-accent/60 ${
                    isActive === true
                      ? 'border-foreground/20 bg-accent/60 shadow-sm'
                      : 'border-transparent'
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {navItems.find((item) => item.id === activeNav)?.label}
            </h2>
            <Button className="gap-2" size="sm" onClick={handleCreateClick}>
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </div>
          {isLoading && (
            <Card className="border-foreground/5">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Loading templates...
              </CardContent>
            </Card>
          )}
          {error && (
            <Card className="border-foreground/5">
              <CardContent className="py-10 text-center text-sm text-destructive">
                Failed to load templates. Please try again.
              </CardContent>
            </Card>
          )}
          {!isLoading && !error && templateList.length === 0 && (
            <Card className="border-foreground/5">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No templates yet.
              </CardContent>
            </Card>
          )}

          {templateList.map((template) => {
            return (
              <Card key={template.id} className="border-foreground/5">
                <CardHeader className="gap-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          template.type === 'ONBOARDING'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <FileText className="h-5 w-5" />
                      </span>
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {template.name}
                        </CardTitle>
                        <CardDescription>
                          {template.description ?? 'No description provided.'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Link href={`/checklist/settings/${template.id}`}>
                          <Button
                            size="icon-sm"
                            variant="secondary"
                            aria-label="View template"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon-sm"
                          variant="secondary"
                          aria-label="Edit template"
                          onClick={() => openEditForm(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          aria-label="Delete template"
                          onClick={() => handleDelete(template.id)}
                          disabled={deletingTemplateId === template.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
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
            );
          })}
        </div>
      </div>

      <TemplateFormSheet
        open={formSheetOpen}
        onOpenChange={handleFormOpenChange}
        title={formMode === 'create' ? 'New Template' : 'Edit Template'}
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

export default ChecklistSettingsPage;
