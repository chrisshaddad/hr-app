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
  Tag as TagIcon,
} from 'lucide-react';
import type { ApplicationStage, ApplicationInJob } from '@repo/contracts';

interface JobStage {
  id: string;
  name: string;
  isLocked: boolean;
  orderIndex: number;
}

// Mapping from DB stage name → ApplicationStage enum value
const STAGE_NAME_TO_ENUM: Record<string, ApplicationStage> = {
  Applied: 'APPLIED',
  Screening: 'SCREENING',
  '1st Interview': 'INTERVIEW_1',
  '2nd Interview': 'INTERVIEW_2',
  Offered: 'OFFERED',
  Hired: 'HIRED',
  Rejected: 'REJECTED',
};

const STAGE_COLORS: Record<string, string> = {
  APPLIED: 'bg-gray-50',
  SCREENING: 'bg-blue-50/50',
  INTERVIEW_1: 'bg-purple-50/50',
  INTERVIEW_2: 'bg-indigo-50/50',
  OFFERED: 'bg-amber-50/50',
  HIRED: 'bg-green-50/50',
  REJECTED: 'bg-red-50/50',
};

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

function stageEnumForDbStage(stage: JobStage): ApplicationStage | null {
  return STAGE_NAME_TO_ENUM[stage.name] ?? null;
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
  stageName,
  stageEnum,
  applications,
  bgColor,
}: {
  stageName: string;
  stageEnum: ApplicationStage | null;
  applications: ApplicationInJob[];
  bgColor: string;
}) {
  const filtered = stageEnum
    ? applications.filter((a) => a.currentStage === stageEnum)
    : [];
  return (
    <div className={cn('flex min-w-[17rem] flex-col rounded-xl p-3', bgColor)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            {stageName}
          </span>
          <Badge
            variant="secondary"
            className="h-5 min-w-5 justify-center rounded-full bg-primary-base px-1.5 text-xs font-medium text-white"
          >
            {filtered.length}
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
        {filtered.map((app) => (
          <CandidateCard key={app.id} application={app} />
        ))}
      </div>
    </div>
  );
}

function PipelineView({
  applications,
  dbStages,
}: {
  applications: ApplicationInJob[];
  dbStages: JobStage[];
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {dbStages.map((stage) => {
        const enumVal = stageEnumForDbStage(stage);
        const bgColor = enumVal
          ? (STAGE_COLORS[enumVal] ?? 'bg-gray-50')
          : 'bg-gray-50';
        return (
          <PipelineColumn
            key={stage.id}
            stageName={stage.name}
            stageEnum={enumVal}
            applications={applications}
            bgColor={bgColor}
          />
        );
      })}
    </div>
  );
}

// ─── Table View ────────────────────────────────────────────

function TableView({
  applications,
  dbStages,
}: {
  applications: ApplicationInJob[];
  dbStages: JobStage[];
}) {
  const stageLabel = (enumVal: string) => {
    const found = dbStages.find((s) => STAGE_NAME_TO_ENUM[s.name] === enumVal);
    return found?.name ?? enumVal;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
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
                        <SelectValue>
                          {stageLabel(app.currentStage)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {dbStages.map((stage) => {
                          const enumVal = stageEnumForDbStage(stage);
                          if (!enumVal) return null;
                          return (
                            <SelectItem key={stage.id} value={enumVal}>
                              {stage.name}
                            </SelectItem>
                          );
                        })}
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
        {[...Array(5)].map((_, i) => (
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

  // Use per-job hiring stages (sorted by orderIndex)
  const pipelineStages: JobStage[] = (job.hiringStages ?? [])
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((jhs) => ({
      id: jhs.hiringStageId,
      name: jhs.hiringStage.name,
      isLocked: jhs.hiringStage.isLocked,
      orderIndex: jhs.orderIndex,
    }));

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
          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <TagIcon className="h-3.5 w-3.5 text-gray-400" />
              {job.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
          {/* Description */}
          {job.description && (
            <div
              className="tiptap mt-3 max-w-3xl text-sm leading-relaxed text-gray-600"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search what you need"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border-gray-200 bg-white pl-10 text-sm placeholder:text-gray-400 sm:w-64"
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
        <PipelineView
          applications={filteredApplications}
          dbStages={pipelineStages}
        />
      ) : (
        <TableView
          applications={filteredApplications}
          dbStages={pipelineStages}
        />
      )}
    </div>
  );
}
