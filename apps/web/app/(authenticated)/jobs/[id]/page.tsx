'use client';

import { toast } from 'sonner';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import {
  ChevronRight,
  Plus,
  List,
  LayoutGrid,
  Pencil,
  Trash2,
} from 'lucide-react';

import type {
  ApplyJobRequest,
  ApplyJobResponse,
  PublicJobResponse,
  JobApplicationsResponse,
} from '@repo/contracts';
import { cn } from '@/lib/utils';
import { fetcher, apiPost, apiPatch } from '@/lib/api';
import type { JobApplicationItem } from '../jobs.types';
import { CreateCandidateForm } from '@/components/molecules';
import type { Stage } from '@/components/atoms/KanbanBoard/KanbanBoard.types';
import {
  Button,
  SideModal,
  Grid,
  Chip,
  KanbanBoard,
  SearchInput,
} from '@/components/atoms';
import type { CandidateCardData } from '@/components/molecules/CandidateCard/CandidateCard.types';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [job, setJob] = useState<PublicJobResponse | null>(null);
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [isLoadingJobDetails, setIsLoadingJobDetails] = useState<boolean>(true);

  const loadJob = async () => {
    try {
      const data = await fetcher<PublicJobResponse>(`/public/jobs/${jobId}`);

      setJob(data);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load job details');
    }
  };

  const loadApplicationsByJobId = async () => {
    try {
      const data = await fetcher<JobApplicationsResponse>(
        `/jobs/${jobId}/applications`,
      );

      setApplications(data.applications || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load job applications');
    }
  };

  useEffect(() => {
    if (!jobId) return;

    const fetchData = async () => {
      setIsLoadingJobDetails(true);

      await Promise.all([loadJob(), loadApplicationsByJobId()]);

      setIsLoadingJobDetails(false);
    };

    fetchData();
  }, [jobId]);

  const handleAddCandidate = async (formData: {
    fullName: string;
    email: string;
    phone: string;
    coverLetter: string;
  }) => {
    try {
      const payload: ApplyJobRequest = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        coverLetter: formData.coverLetter.trim() || undefined,
      };

      await apiPost<ApplyJobResponse>(`/jobs/${jobId}/applications`, payload);

      toast.success('Candidate added to job successfully');

      setIsAddCandidateOpen(false);

      await loadApplicationsByJobId();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add candidate to job');
      throw error; // Re-throw to let form handle it
    }
  };

  const filteredApplications = useMemo(() => {
    if (!searchTerm) return applications;

    const searchLower = searchTerm.toLowerCase();
    const statusMap: Record<string, string> = {
      applied: 'APPLIED',
      screening: 'SCREENING',
      'first interview': 'FIRST_INTERVIEW',
      '1st interview': 'FIRST_INTERVIEW',
      'second interview': 'SECOND_INTERVIEW',
      '2nd interview': 'SECOND_INTERVIEW',
      offered: 'OFFERED',
      hired: 'HIRED',
      rejected: 'REJECTED',
    };

    return applications.filter((app) => {
      const fullName =
        `${app.candidate.firstName} ${app.candidate.lastName}`.toLowerCase();
      const matchesName = fullName.includes(searchLower);

      const statusMatch = statusMap[searchLower] === app.status;

      const statusDisplayNames: Record<string, string[]> = {
        APPLIED: ['applied'],
        SCREENING: ['screening'],
        FIRST_INTERVIEW: ['first interview', '1st interview'],
        SECOND_INTERVIEW: ['second interview', '2nd interview'],
        OFFERED: ['offered'],
        HIRED: ['hired'],
        REJECTED: ['rejected'],
      };
      const statusMatches =
        statusDisplayNames[app.status]?.some((name) =>
          name.includes(searchLower),
        ) || false;

      return matchesName || statusMatch || statusMatches;
    });
  }, [applications, searchTerm]);

  const gridData = useMemo(() => {
    return filteredApplications.map((app) => ({
      id: app.applicationId,
      name: `${app.candidate.firstName} ${app.candidate.lastName}`,
      email: app.candidate.email,
      phone: (app.candidate as any).phone || '-',
      status: app.status,
      appliedAt: new Date(app.appliedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }));
  }, [filteredApplications]);

  const kanbanStages: Stage[] = useMemo(
    () => [
      { id: 'APPLIED', name: 'Applied' },
      { id: 'SCREENING', name: 'Screening' },
      { id: 'FIRST_INTERVIEW', name: '1st Interview' },
      { id: 'SECOND_INTERVIEW', name: '2nd Interview' },
      { id: 'OFFERED', name: 'Offered' },
      { id: 'HIRED', name: 'Hired' },
      { id: 'REJECTED', name: 'Rejected' },
    ],
    [],
  );

  const kanbanCandidates = useMemo<CandidateCardData[]>(() => {
    return filteredApplications.map((app) => {
      const firstName = app.candidate.firstName;
      const lastName = app.candidate.lastName;
      const fullName = `${firstName} ${lastName}`;
      const initials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

      return {
        initials,
        viewCount: 0,
        name: fullName,
        status: app.status,
        id: app.applicationId,
        email: app.candidate.email,
        messageCount: (app.candidate as any).communicationCount || 0,
      };
    });
  }, [filteredApplications]);

  const handleMoveCandidate = async (
    candidateId: string,
    newStageId: string,
  ) => {
    try {
      setApplications((prev) =>
        prev.map((app) =>
          app.applicationId === candidateId
            ? { ...app, status: newStageId as any }
            : app,
        ),
      );

      await apiPatch(`/jobs/applications/${candidateId}/status`, {
        status: newStageId,
      });

      toast.success('Candidate status updated successfully');
    } catch (error: any) {
      await loadApplicationsByJobId();
      toast.error(error?.message || 'Failed to update candidate status');
    }
  };

  const columns: ColumnDef<(typeof gridData)[0]>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Candidate',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="text-greyscale-900 text-xs font-medium">
                {row.name}
              </span>
              <span className="text-greyscale-600 text-xs font-medium">
                {row.email}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: (info) => (
          <span className="text-greyscale-900 text-xs">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue() as string;
          const statusMap: Record<
            string,
            {
              variant: 'default' | 'success' | 'warning' | 'error' | 'info';
              label: string;
            }
          > = {
            APPLIED: { variant: 'info', label: 'Applied' },
            SCREENING: { variant: 'default', label: 'Screening' },
            FIRST_INTERVIEW: { variant: 'warning', label: '1st Interview' },
            SECOND_INTERVIEW: { variant: 'warning', label: '2nd Interview' },
            OFFERED: { variant: 'success', label: 'Offered' },
            HIRED: { variant: 'success', label: 'Hired' },
            REJECTED: { variant: 'error', label: 'Rejected' },
          };
          const statusConfig = statusMap[status] || {
            variant: 'default' as const,
            label: status,
          };
          return (
            <Chip variant={statusConfig.variant} text={statusConfig.label} />
          );
        },
      },
      {
        accessorKey: 'appliedAt',
        header: 'Applied Date',
        cell: (info) => (
          <span className="text-greyscale-900 text-xs">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const applicationId = info.row.original.id;
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toast.info('Update functionality coming soon');
                }}
                className="w-8 h-8 rounded-md bg-others-blue hover:opacity-90 flex items-center justify-center transition-colors"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4 text-others-white" />
              </button>
              <button
                onClick={() => {
                  toast.info('Delete functionality coming soon');
                }}
                className="w-8 h-8 rounded-md bg-alerts-error-base hover:bg-alerts-error-dark flex items-center justify-center transition-colors"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4 text-others-white" />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  if (!jobId) {
    return null;
  }

  return (
    <>
      <div className="bg-others-white h-full rounded-[16px] p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-[28px] font-bold text-greyscale-900">
              Recruitment
            </p>
            <div className="flex items-center gap-2">
              <p
                onClick={() => router.push('/jobs')}
                className="text-greyscale-600 text-sm cursor-pointer hover:text-greyscale-900 transition-colors"
              >
                List of jobs
              </p>
              <ChevronRight className="h-4 w-4 text-greyscale-900" />
              <p className="text-greyscale-900 text-sm">{job?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            {applications.length > 0 && (
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or status..."
                className="w-[300px]"
              />
            )}
            <Button
              text="Add Candidate"
              startIcon={<Plus className="h-5 w-5" />}
              onClick={() => setIsAddCandidateOpen(true)}
            />
            <div className="flex items-center gap-2 bg-greyscale-100 rounded-full p-1 shadow-sm h-9">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'relative flex items-center justify-center transition-all duration-200',
                  viewMode === 'table'
                    ? 'w-8 h-8 rounded-full bg-primary-base'
                    : 'w-8 h-8 rounded-full',
                )}
                aria-label="Table view"
              >
                <List
                  className={cn(
                    'h-4 w-4 transition-colors',
                    viewMode === 'table'
                      ? 'text-others-white'
                      : 'text-greyscale-500',
                  )}
                />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'relative flex items-center justify-center transition-all duration-200',
                  viewMode === 'kanban'
                    ? 'w-8 h-8 rounded-full bg-primary-base'
                    : 'w-8 h-8 rounded-full',
                )}
                aria-label="Kanban view"
              >
                <LayoutGrid
                  className={cn(
                    'h-4 w-4 transition-colors',
                    viewMode === 'kanban'
                      ? 'text-others-white'
                      : 'text-greyscale-500',
                  )}
                />
              </button>
            </div>
          </div>
        </div>
        {isLoadingJobDetails ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="relative inline-block w-12 h-12">
              <span
                className="absolute left-0 top-0 w-12 h-12 rounded-full border-t-4 border-r-4 border-t-primary-base border-r-transparent"
                style={{
                  animation: 'rotation 1s linear infinite',
                }}
              />
              <span
                className="absolute left-0 top-0 w-12 h-12 rounded-full border-l-4 border-b-4 border-b-transparent"
                style={{
                  animation: 'rotation 0.5s linear infinite reverse',
                  borderLeftColor: 'var(--color-alerts-success-base)',
                }}
              />
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 h-full">
            <img src="/icons/noJob.svg" alt="No jobs" />
            <div className="flex flex-col gap-2">
              <p className="text-greyscale-900 text-3xl font-bold">
                No applications yet
              </p>
              <p className="text-greyscale-900 text[18px]">
                Add candidates to this job to see them here
              </p>
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 h-full py-12">
            <img src="/icons/noJob.svg" alt="No results" />
            <div className="flex flex-col gap-2">
              <p className="text-greyscale-900 text-3xl font-bold">
                No candidates found
              </p>
              <p className="text-greyscale-600 text-lg">
                Try adjusting your search term
              </p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <Grid data={gridData} columns={columns} pageSize={10} />
            ) : (
              <div className="flex-1 min-h-0">
                <KanbanBoard
                  stages={kanbanStages}
                  candidates={kanbanCandidates}
                  onMoveCandidate={handleMoveCandidate}
                />
              </div>
            )}
          </>
        )}
      </div>
      <SideModal
        width="600px"
        open={isAddCandidateOpen}
        onOpenChange={setIsAddCandidateOpen}
      >
        <CreateCandidateForm
          onClose={() => setIsAddCandidateOpen(false)}
          handleCreateCandidate={handleAddCandidate}
        />
      </SideModal>
    </>
  );
}
