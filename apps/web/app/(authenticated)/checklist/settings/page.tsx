'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Eye,
  FileText,
  LayoutList,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useTemplates } from '@/hooks/use-templates';
import type { TemplateType } from '@repo/contracts';

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

function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ChecklistSettingsPage() {
  const [activeNav, setActiveNav] = useState<(typeof navItems)[number]['id']>(
    navItems[0].id,
  );

  const { templates, isLoading, error } = useTemplates({
    type: activeNav,
  });

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
            <Button className="gap-2" size="sm">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </div>
          {isLoading ? (
            <Card className="border-foreground/5">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Loading templates...
              </CardContent>
            </Card>
          ) : null}
          {error ? (
            <Card className="border-foreground/5">
              <CardContent className="py-10 text-center text-sm text-destructive">
                Failed to load templates. Please try again.
              </CardContent>
            </Card>
          ) : null}
          {!isLoading && !error && templates.length === 0 ? (
            <Card className="border-foreground/5">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No templates yet.
              </CardContent>
            </Card>
          ) : null}
          {templates.map((template) => {
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
                      <Badge variant="secondary" className="text-xs">
                        {template.type === 'ONBOARDING'
                          ? 'Onboarding'
                          : 'Offboarding'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon-sm"
                          variant="secondary"
                          aria-label="View template"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="secondary"
                          aria-label="Edit template"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          aria-label="Delete template"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border bg-background/80 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Type
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {template.type === 'ONBOARDING'
                        ? 'Onboarding'
                        : 'Offboarding'}
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
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ChecklistSettingsPage;
