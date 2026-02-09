'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function RecruitmentSettingsPage() {
  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardContent className="space-y-3 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Recruitment Settings
        </h1>
        <p className="text-sm text-gray-600">
          Workflow stages and hiring team management are configured per job.
        </p>
        <p className="text-sm text-gray-600">
          Go to{' '}
          <Link
            href="/recruitment"
            className="font-medium text-primary underline"
          >
            Jobs
          </Link>{' '}
          and edit any listing to customize the hiring workflow.
        </p>
      </CardContent>
    </Card>
  );
}
