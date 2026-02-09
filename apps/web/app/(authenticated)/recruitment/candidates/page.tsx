'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function RecruitmentCandidatesPage() {
  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardContent className="space-y-3 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Recruitment Candidates
        </h1>
        <p className="text-sm text-gray-600">
          Candidate management is available inside each job detail.
        </p>
        <p className="text-sm text-gray-600">
          Open{' '}
          <Link
            href="/recruitment"
            className="font-medium text-primary underline"
          >
            Jobs
          </Link>{' '}
          and click a job to view candidate list/board pipelines.
        </p>
      </CardContent>
    </Card>
  );
}
