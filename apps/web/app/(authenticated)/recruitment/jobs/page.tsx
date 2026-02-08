'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJobs, deleteJob } from '@/hooks/use-jobs';
import { CreateJobDialog } from './create-job-dialog';
import { EditJobDialog } from './edit-job-dialog';
import { useUser } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  MoreVertical,
  Users,
  Briefcase,
  CalendarClock,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiPatch } from '@/lib/api';
import { mutate } from 'swr';
import type { JobStatus, JobListItem } from '@repo/contracts';

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dotColor: string }
> = {
  DRAFT: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700',
    dotColor: 'bg-gray-400',
  },
  ACTIVE: {
    label: 'Active',
    color: 'bg-green-100 text-green-700',
    dotColor: 'bg-green-500',
  },
  ON_HOLD: {
    label: 'On Hold',
    color: 'bg-yellow-100 text-yellow-700',
    dotColor: 'bg-yellow-500',
  },
  CLOSED: {
    label: 'Closed',
    color: 'bg-gray-100 text-gray-600',
    dotColor: 'bg-gray-500',
  },
  INACTIVE: {
    label: 'Inactive',
    color: 'bg-red-100 text-red-700',
    dotColor: 'bg-red-500',
  },
};

const DEPARTMENT_LABELS: Record<string, string> = {
  DEVELOPMENT: 'IT',
  DESIGN: 'Designer',
  MARKETING: 'Marketing',
  MANAGEMENT: 'Management',
  HR: 'HR',
  SALES: 'Sales',
  OTHER: 'Other',
};

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

function formatTimeAgo(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `Created ${diffMins}m ago`;
  if (diffHours < 24) return `Created ${diffHours}h ago`;
  if (diffDays < 30) return `Created ${diffDays}d ago`;
  return `Created ${diffMonths}m ago`;
}

function JobStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT!;
  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </Badge>
  );
}

function isJobExpired(job: JobListItem): boolean {
  if (!job.expectedClosingDate) return false;
  const closing = new Date(job.expectedClosingDate);
  closing.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return closing < today;
}

function StatusDropdown({
  job,
  onStatusChange,
  onReactivateRequest,
}: {
  job: JobListItem;
  onStatusChange: (jobId: string, status: JobStatus) => void;
  onReactivateRequest: (job: JobListItem, newStatus: JobStatus) => void;
}) {
  const expired = isJobExpired(job);
  const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.DRAFT!;

  const handleChange = (value: string) => {
    const newStatus = value as JobStatus;
    // If the job is closed/expired and user wants to reactivate, ask for confirmation
    if (
      (job.status === 'CLOSED' || expired) &&
      (newStatus === 'ACTIVE' ||
        newStatus === 'DRAFT' ||
        newStatus === 'ON_HOLD')
    ) {
      onReactivateRequest(job, newStatus);
      return;
    }
    onStatusChange(job.id, newStatus);
  };

  return (
    <Select value={job.status} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-28 cursor-pointer gap-1 rounded-lg border-gray-200 text-sm font-medium">
        <SelectValue>
          {expired && job.status === 'CLOSED' ? 'Expired' : config.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
          Change Status
        </div>
        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
          <SelectItem key={key} value={key}>
            <div className="flex items-center gap-2">
              <span>{val.label}</span>
              {job.status === key && (
                <span className="text-primary-base">✓</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function JobCard({
  job,
  onClick,
  onStatusChange,
  onReactivateRequest,
  onEdit,
  onDelete,
}: {
  job: JobListItem;
  onClick: () => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
  onReactivateRequest: (job: JobListItem, newStatus: JobStatus) => void;
  onEdit: (job: JobListItem) => void;
  onDelete: (job: JobListItem) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 sm:items-center sm:p-5">
      <div
        className="min-w-0 flex-1 cursor-pointer"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
          <span className="truncate text-lg font-semibold text-gray-900">
            {job.title}
          </span>
          <JobStatusBadge status={job.status} />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {DEPARTMENT_LABELS[job.department] || job.department}
          {job.hiringManager && ` · ${job.hiringManager.name}`}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {job._count.applications} Candidate
            {job._count.applications !== 1 ? 's' : ''} Applied
          </span>
          {job.expectedClosingDate && (
            <span
              className={cn(
                'flex items-center gap-1.5 text-xs',
                new Date(job.expectedClosingDate) < new Date()
                  ? 'font-medium text-red-500'
                  : 'text-gray-400',
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              {new Date(job.expectedClosingDate) < new Date()
                ? 'Expired'
                : `Closes ${new Date(job.expectedClosingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </span>
          )}
        </div>
        {job.tags && job.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="rounded-full px-2 py-0 text-[0.65rem] font-medium"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <span className="hidden text-sm text-gray-400 sm:block">
          {formatTimeAgo(job.createdAt)}
        </span>
        <StatusDropdown
          job={job}
          onStatusChange={onStatusChange}
          onReactivateRequest={onReactivateRequest}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onClick}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(job)}>
              Edit Job
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(job)}
            >
              Delete Job
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function RecruitmentJobsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Edit dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListItem | null>(null);

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingJob, setDeletingJob] = useState<JobListItem | null>(null);

  // Reactivation confirmation dialog state
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [reactivateJob, setReactivateJob] = useState<JobListItem | null>(null);
  const [reactivateStatus, setReactivateStatus] = useState<JobStatus | null>(
    null,
  );
  const [reactivating, setReactivating] = useState(false);

  const isOrgAdmin = user?.role === 'ORG_ADMIN';

  const { jobs, total, isLoading, error } = useJobs({
    search: searchQuery || undefined,
  });

  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    try {
      await apiPatch(`/jobs/${jobId}`, { status });
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/jobs'),
        undefined,
        { revalidate: true },
      );
      toast.success('Job status updated');
    } catch {
      toast.error('Failed to update job status');
    }
  };

  const handleReactivateRequest = (job: JobListItem, newStatus: JobStatus) => {
    setReactivateJob(job);
    setReactivateStatus(newStatus);
    setShowReactivateDialog(true);
  };

  const handleConfirmReactivate = async () => {
    if (!reactivateJob || !reactivateStatus) return;
    setReactivating(true);
    try {
      await apiPatch(`/jobs/${reactivateJob.id}`, {
        status: reactivateStatus,
        // Clear the expired closing date so it doesn't immediately close again
        expectedClosingDate: null,
      });
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/jobs'),
        undefined,
        { revalidate: true },
      );
      toast.success(
        `Job reactivated as ${STATUS_CONFIG[reactivateStatus]?.label ?? reactivateStatus}`,
      );
      setShowReactivateDialog(false);
      setReactivateJob(null);
      setReactivateStatus(null);
    } catch {
      toast.error('Failed to reactivate job');
    } finally {
      setReactivating(false);
    }
  };

  const handleEditJob = (job: JobListItem) => {
    setEditingJob(job);
    setShowEditDialog(true);
  };

  const handleDeleteJob = (job: JobListItem) => {
    setDeletingJob(job);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingJob) return;
    setDeleting(true);
    try {
      await deleteJob(deletingJob.id);
      toast.success('Job deleted successfully');
      setShowDeleteDialog(false);
      setDeletingJob(null);
    } catch {
      toast.error('Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  const handleJobCreated = (jobId: string) => {
    router.push(`/recruitment/jobs/${jobId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
          <p className="mt-1 text-sm text-gray-500">Here&apos;s all job list</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search what you need"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full sm:w-64 rounded-lg border-gray-200 bg-white pl-10 text-sm placeholder:text-gray-400"
            />
          </div>
          {isOrgAdmin && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="h-10 w-full justify-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
          <p className="text-red-500">Failed to load jobs</p>
        </div>
      ) : !jobs?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No jobs yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first job posting to get started
          </p>
          {isOrgAdmin && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="mt-4 w-full justify-center gap-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add New Job
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => router.push(`/recruitment/jobs/${job.id}`)}
              onStatusChange={handleStatusChange}
              onReactivateRequest={handleReactivateRequest}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
            />
          ))}
        </div>
      )}

      {/* Create Job Dialog */}
      <CreateJobDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleJobCreated}
      />

      {/* Edit Job Dialog */}
      <EditJobDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        job={editingJob}
      />

      {/* Delete Job Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">
                {deletingJob?.title}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Expired/Closed Job Confirmation Dialog */}
      <Dialog
        open={showReactivateDialog}
        onOpenChange={setShowReactivateDialog}
      >
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-7 w-7 text-amber-600" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-center text-lg">
                Reactivate Expired Job?
              </DialogTitle>
              <DialogDescription className="text-center">
                <span className="font-semibold text-gray-900">
                  {reactivateJob?.title}
                </span>{' '}
                {reactivateJob?.expectedClosingDate && (
                  <>
                    expired on{' '}
                    <span className="font-medium text-gray-700">
                      {new Date(
                        reactivateJob.expectedClosingDate,
                      ).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    .{' '}
                  </>
                )}
                Changing the status to{' '}
                <span className="font-semibold text-gray-900">
                  {reactivateStatus
                    ? STATUS_CONFIG[reactivateStatus]?.label
                    : ''}
                </span>{' '}
                will reopen this job and clear the closing date.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> The expected closing date will be removed.
              You can set a new one by editing the job after reactivation.
            </p>
          </div>
          <DialogFooter className="mt-2 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowReactivateDialog(false);
                setReactivateJob(null);
                setReactivateStatus(null);
              }}
            >
              Keep Closed
            </Button>
            <Button
              onClick={handleConfirmReactivate}
              disabled={reactivating}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {reactivating ? 'Reactivating...' : 'Yes, Reactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
