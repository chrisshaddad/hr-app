'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, File } from 'lucide-react';

import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTemplate } from '@/hooks/use-template';
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

  const { template, isLoading, error } = useTemplate(templateId, {
    enabled: !!templateId,
  });

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
        <CardHeader>
          <CardTitle className="text-lg">Template Steps</CardTitle>
        </CardHeader>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Template steps coming soon.
        </CardContent>
      </Card>
    </div>
  );
}
