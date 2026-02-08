'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useJob } from '@/hooks/use-jobs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  Clock,
  Link as LinkIcon,
  MoreHorizontal,
  MessageSquare,
  Smile,
  Plus,
  Pencil,
  Trash2,
  FileText,
} from 'lucide-react';
import type { ApplicationStage, ApplicationInJob } from '@repo/contracts';

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  APPLIED: { label: 'Applied', color: 'bg-gray-100 text-gray-700' },
  SCREENING: { label: 'Screening', color: 'bg-blue-100 text-blue-700' },
  INTERVIEW_1: {
    label: '1st Interview',
    color: 'bg-purple-100 text-purple-700',
  },
  INTERVIEW_2: {
    label: '2nd Interview',
    color: 'bg-indigo-100 text-indigo-700',
  },
  OFFERED: { label: 'Hiring', color: 'bg-yellow-100 text-yellow-700' },
  HIRED: { label: 'Hiring', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

const PIPELINE_STAGES: ApplicationStage[] = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW_1',
  'INTERVIEW_2',
  'OFFERED',
  'HIRED',
  'REJECTED',
];

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

// ─── Pipeline / Kanban View ────────────────────────────────

function CandidateCard({ application }: { application: ApplicationInJob }) {
  const { candidate } = application;
  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback
              className={cn(
                'text-xs font-medium text-white',
                getAvatarColor(fullName),
              )}
            >
              {getInitials(candidate.firstName, candidate.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-gray-900">{fullName}</p>
            <p className="text-xs text-gray-500">{candidate.email}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-gray-600"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Move Stage</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          {application._count.communications}
        </span>
        <span className="flex items-center gap-1">
          <Smile className="h-3.5 w-3.5" />
          {application._count.interviews}
        </span>
      </div>
    </div>
  );
}

function PipelineColumn({
  stage,
  applications,
}: {
  stage: ApplicationStage;
  applications: ApplicationInJob[];
}) {
  const config = STAGE_CONFIG[stage]!;
  return (
    <div className="flex min-w-[17rem] flex-col rounded-xl bg-gray-50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            {config.label}
          </span>
          <Badge
            variant="secondary"
            className="h-5 min-w-5 justify-center rounded-full bg-primary-base px-1.5 text-xs font-medium text-white"
          >
            {applications.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 hover:text-gray-600"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto">
        {applications.map((app) => (
          <CandidateCard key={app.id} application={app} />
        ))}
      </div>
    </div>
  );
}

function PipelineView({ applications }: { applications: ApplicationInJob[] }) {
  const grouped = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = applications.filter((a) => a.currentStage === stage);
      return acc;
    },
    {} as Record<ApplicationStage, ApplicationInJob[]>,
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => (
        <PipelineColumn
          key={stage}
          stage={stage}
          applications={grouped[stage]!}
        />
      ))}
    </div>
  );
}

// ─── Table View ────────────────────────────────────────────

function TableView({ applications }: { applications: ApplicationInJob[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-medium text-gray-500">
              Name
            </TableHead>
            <TableHead className="text-xs font-medium text-gray-500">
              Phone Number
            </TableHead>
            <TableHead className="text-xs font-medium text-gray-500">
              CV
            </TableHead>
            <TableHead className="text-xs font-medium text-gray-500">
              Created Date
            </TableHead>
            <TableHead className="text-xs font-medium text-gray-500">
              Stages
            </TableHead>
            <TableHead className="text-right text-xs font-medium text-gray-500">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-12 text-center text-gray-500"
              >
                No candidates applied yet
              </TableCell>
            </TableRow>
          ) : (
            applications.map((app) => {
              const { candidate } = app;
              const fullName = `${candidate.firstName} ${candidate.lastName}`;
              const stageConfig = STAGE_CONFIG[app.currentStage]!;
              return (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className={cn(
                            'text-xs font-medium text-white',
                            getAvatarColor(fullName),
                          )}
                        >
                          {getInitials(candidate.firstName, candidate.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {candidate.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {candidate.phone || '—'}
                  </TableCell>
                  <TableCell>
                    {candidate.resumeUrl ? (
                      <a
                        href={candidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        CV.pdf
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(app.appliedAt).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={app.currentStage}>
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue>{stageConfig.label}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {PIPELINE_STAGES.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {STAGE_CONFIG[stage]!.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary-base hover:bg-primary-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="flex gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-96 w-72" />
        ))}
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { job, isLoading, error } = useJob(jobId);
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) return <LoadingSkeleton />;

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500">
          {error ? 'Failed to load job' : 'Job not found'}
        </p>
      </div>
    );
  }

  const filteredApplications = job.applications.filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.candidate.firstName.toLowerCase().includes(q) ||
      app.candidate.lastName.toLowerCase().includes(q) ||
      (app.candidate.email && app.candidate.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
            <Link
              href="/recruitment/jobs"
              className="hover:text-gray-700 hover:underline"
            >
              List Job
            </Link>
            <span>{'>'}</span>
            <span className="font-medium text-gray-700">{job.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search what you need"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-64 rounded-lg border-gray-200 bg-white pl-10 text-sm placeholder:text-gray-400"
            />
          </div>
          <Button className="h-10 gap-2 rounded-lg bg-primary-base px-4 text-sm font-medium text-white hover:bg-primary-base/90">
            Add Candidates
            <ChevronDown className="h-4 w-4" />
          </Button>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-white">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('table')}
              className={cn(
                'h-9 w-9 rounded-l-lg rounded-r-none',
                viewMode === 'table'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-400',
              )}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('pipeline')}
              className={cn(
                'h-9 w-9 rounded-l-none rounded-r-none border-x border-gray-200',
                viewMode === 'pipeline'
                  ? 'bg-primary-base text-white'
                  : 'text-gray-400',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-l-none rounded-r-lg text-gray-400"
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-l-none rounded-r-lg text-gray-400"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'pipeline' ? (
        <PipelineView applications={filteredApplications} />
      ) : (
        <TableView applications={filteredApplications} />
      )}
    </div>
  );
}
