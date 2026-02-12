'use client';

import Link from 'next/link';
import { useUser } from '@/hooks/use-auth';
import { useJobs } from '@/hooks/use-jobs';
import { useHiringStages } from '@/hooks/use-hiring-stages';
import { useTags } from '@/hooks/use-tags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  Users,
  GitBranch,
  Tag,
  ArrowRight,
  Plus,
  TrendingUp,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  INACTIVE: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  CLOSED: 'Closed',
  INACTIVE: 'Inactive',
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  isLoading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-32 rounded-xl" />;
  }
  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            color,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="truncate text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, isLoading: userLoading } = useUser();
  const { jobs, total: totalJobs, isLoading: jobsLoading } = useJobs();
  const { stages, isLoading: stagesLoading } = useHiringStages();
  const { tags, isLoading: tagsLoading } = useTags();

  const isLoading = userLoading;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const activeJobs = jobs?.filter((j) => j.status === 'ACTIVE').length ?? 0;
  const draftJobs = jobs?.filter((j) => j.status === 'DRAFT').length ?? 0;
  const totalCandidates =
    jobs?.reduce((sum, j) => sum + (j._count?.applications ?? 0), 0) ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-80" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back,{' '}
          {user?.profile?.firstName ||
            user?.name ||
            user?.email?.split('@')[0] ||
            'User'}
          !
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isSuperAdmin
            ? 'Manage organizations and platform settings.'
            : 'Here\u2019s your recruitment overview.'}
        </p>
      </div>

      {/* Stats */}
      {!isSuperAdmin && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Jobs"
            value={totalJobs ?? 0}
            subtitle={`${activeJobs} active, ${draftJobs} draft`}
            icon={Briefcase}
            color="bg-blue-100 text-blue-600"
            isLoading={jobsLoading}
          />
          <StatCard
            title="Total Candidates"
            value={totalCandidates}
            subtitle="Across all jobs"
            icon={Users}
            color="bg-purple-100 text-purple-600"
            isLoading={jobsLoading}
          />
          <StatCard
            title="Hiring Stages"
            value={stages?.length ?? 0}
            subtitle="Workflow stages configured"
            icon={GitBranch}
            color="bg-green-100 text-green-600"
            isLoading={stagesLoading}
          />
          <StatCard
            title="Tags"
            value={tags?.length ?? 0}
            subtitle="Organization tags"
            icon={Tag}
            color="bg-amber-100 text-amber-600"
            isLoading={tagsLoading}
          />
        </div>
      )}

      {/* Quick Actions + Recent Jobs */}
      {!isSuperAdmin && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Jobs */}
          <Card className="border-gray-200 bg-white shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Recent Jobs
              </CardTitle>
              <Link href="/recruitment/jobs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer gap-1 text-sm text-gray-500 hover:text-gray-900"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : !jobs?.length ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Briefcase className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">No jobs yet</p>
                  <Link href="/recruitment/jobs" className="mt-2">
                    <Button
                      size="sm"
                      className="cursor-pointer gap-1.5 bg-gray-900 text-white hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4" />
                      Create First Job
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {jobs.slice(0, 5).map((job) => (
                    <Link
                      key={job.id}
                      href={`/recruitment/jobs/${job.id}`}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {job._count.applications} candidate
                          {job._count.applications !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'ml-3 shrink-0 rounded-full text-xs',
                          STATUS_COLORS[job.status],
                        )}
                      >
                        {STATUS_LABELS[job.status] ?? job.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/recruitment/jobs">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer justify-start gap-3 border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  Manage Jobs
                </Button>
              </Link>
              <Link href="/recruitment/candidates">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer justify-start gap-3 border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Users className="h-4 w-4 text-purple-500" />
                  View Candidates
                </Button>
              </Link>
              <Link href="/recruitment/settings">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer justify-start gap-3 border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <GitBranch className="h-4 w-4 text-green-500" />
                  Hiring Workflow
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer justify-start gap-3 border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  Account Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Super Admin — simple profile card */}
      {isSuperAdmin && user && (
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm capitalize text-gray-900">
                  {user.role.toLowerCase().replace('_', ' ')}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
