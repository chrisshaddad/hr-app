'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJobs, createJob, deleteJob } from '@/hooks/use-jobs';
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
import { Label } from '@/components/ui/label';
import { Search, Plus, MoreVertical, Users, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { apiPatch } from '@/lib/api';
import { mutate } from 'swr';
import type {
  JobStatus,
  JobDepartment,
  EmploymentType,
  JobListItem,
} from '@repo/contracts';

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

function StatusDropdown({
  job,
  onStatusChange,
}: {
  job: JobListItem;
  onStatusChange: (jobId: string, status: JobStatus) => void;
}) {
  const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.DRAFT!;
  return (
    <Select
      value={job.status}
      onValueChange={(value) => onStatusChange(job.id, value as JobStatus)}
    >
      <SelectTrigger className="h-9 w-28 gap-1 rounded-lg border-gray-200 text-sm font-medium">
        <SelectValue>{config.label}</SelectValue>
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
  onEdit,
  onDelete,
}: {
  job: JobListItem;
  onClick: () => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
  onEdit: (job: JobListItem) => void;
  onDelete: (job: JobListItem) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300">
      <div
        className="flex-1 cursor-pointer"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-900">
            {job.title}
          </span>
          <JobStatusBadge status={job.status} />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {DEPARTMENT_LABELS[job.department] || job.department}
          {job.hiringManager && ` · ${job.hiringManager.name}`}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>
            {job._count.applications} Candidate
            {job._count.applications !== 1 ? 's' : ''} Applied
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-gray-400 sm:block">
          {formatTimeAgo(job.createdAt)}
        </span>
        <StatusDropdown job={job} onStatusChange={onStatusChange} />
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
  const [creating, setCreating] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    department: 'DEVELOPMENT' as JobDepartment,
    employmentType: 'FULL_TIME' as EmploymentType,
    description: '',
  });

  // Edit dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    department: 'DEVELOPMENT' as JobDepartment,
    employmentType: 'FULL_TIME' as EmploymentType,
    description: '',
  });

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingJob, setDeletingJob] = useState<JobListItem | null>(null);

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

  const handleEditJob = (job: JobListItem) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      department: job.department as JobDepartment,
      employmentType: job.employmentType as EmploymentType,
      description: job.description || '',
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingJob || !editForm.title.trim()) {
      toast.error('Job title is required');
      return;
    }
    setEditing(true);
    try {
      await apiPatch(`/jobs/${editingJob.id}`, {
        title: editForm.title,
        department: editForm.department,
        employmentType: editForm.employmentType,
        description: editForm.description || undefined,
      });
      toast.success('Job updated successfully');
      setShowEditDialog(false);
      setEditingJob(null);
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/jobs'),
        undefined,
        { revalidate: true },
      );
    } catch {
      toast.error('Failed to update job');
    } finally {
      setEditing(false);
    }
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

  const handleCreateJob = async () => {
    if (!newJob.title.trim()) {
      toast.error('Job title is required');
      return;
    }
    setCreating(true);
    try {
      const created = await createJob({
        title: newJob.title,
        department: newJob.department,
        employmentType: newJob.employmentType,
        description: newJob.description || undefined,
      });
      toast.success('Job created successfully');
      setShowCreateDialog(false);
      setNewJob({
        title: '',
        department: 'DEVELOPMENT',
        employmentType: 'FULL_TIME',
        description: '',
      });
      router.push(`/recruitment/jobs/${created.id}`);
    } catch {
      toast.error('Failed to create job');
    } finally {
      setCreating(false);
    }
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
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
            />
          ))}
        </div>
      )}

      {/* Create Job Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g. Senior Frontend Developer"
                value={newJob.title}
                onChange={(e) =>
                  setNewJob((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={newJob.department}
                  onValueChange={(value) =>
                    setNewJob((prev) => ({
                      ...prev,
                      department: value as JobDepartment,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select
                  value={newJob.employmentType}
                  onValueChange={(value) =>
                    setNewJob((prev) => ({
                      ...prev,
                      employmentType: value as EmploymentType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EMPLOYMENT_TYPE_LABELS).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                placeholder="Job description..."
                value={newJob.description}
                onChange={(e) =>
                  setNewJob((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateJob}
              disabled={creating}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              {creating ? 'Creating...' : 'Create Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Job Title</Label>
              <Input
                id="edit-title"
                placeholder="e.g. Senior Frontend Developer"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={editForm.department}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({
                      ...prev,
                      department: value as JobDepartment,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select
                  value={editForm.employmentType}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({
                      ...prev,
                      employmentType: value as EmploymentType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EMPLOYMENT_TYPE_LABELS).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <textarea
                id="edit-description"
                placeholder="Job description..."
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={editing}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              {editing ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
