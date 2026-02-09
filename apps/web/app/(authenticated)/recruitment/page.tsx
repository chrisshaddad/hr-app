'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bold,
  Briefcase,
  Check,
  ChevronRight,
  GripVertical,
  Italic,
  Link as LinkIcon,
  List,
  Lock,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Smile,
  Underline,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CandidateStage,
  CandidateProfile,
  EvaluationRating,
  JobCardRecord,
  JobStatus,
  getRecruitmentSeed,
} from '@/lib/recruitment-mock';

type PipelineViewMode = 'list' | 'board';
type CandidateTab =
  | 'profile'
  | 'email'
  | 'evaluation'
  | 'comments'
  | 'activity';

interface JobFormState {
  id?: string;
  title: string;
  status: JobStatus;
  department: string;
  location: string;
  employmentType: string;
  openingsQuantity: number;
  closingDate: string;
  description: string;
  hiringTeamIds: string[];
  workflowStages: CandidateStage[];
}

const fixedStages: CandidateStage[] = [
  'Applied',
  'Offered',
  'Hired',
  'Rejected',
];

const emptyJobForm: JobFormState = {
  title: '',
  status: 'ACTIVE',
  department: '',
  location: '',
  employmentType: 'Full-time',
  openingsQuantity: 1,
  closingDate: '',
  description: '',
  hiringTeamIds: [],
  workflowStages: [
    'Applied',
    'Screening',
    'Interview',
    'Offered',
    'Hired',
    'Rejected',
  ],
};

const ratingOptions: { value: EvaluationRating; emoji: string }[] = [
  { value: 'Strong No', emoji: '😞' },
  { value: 'No', emoji: '🙁' },
  { value: 'Not Sure', emoji: '😐' },
  { value: 'Yes', emoji: '🙂' },
  { value: 'Excellent', emoji: '🤩' },
];

function statusBadgeVariant(
  status: JobStatus,
): 'success' | 'muted' | 'warning' {
  if (status === 'ACTIVE') return 'success';
  if (status === 'CLOSED') return 'muted';
  return 'warning';
}

function humanActionStatus(status: JobStatus): JobCardRecord['actionState'] {
  if (status === 'ACTIVE') return 'Active';
  if (status === 'CLOSED') return 'Closed';
  return 'Unactive';
}

export default function RecruitmentPage() {
  const initialJobs = useMemo(() => getRecruitmentSeed(), []);
  const [jobs, setJobs] = useState<JobCardRecord[]>(initialJobs);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobModalStep, setJobModalStep] = useState<1 | 2>(1);
  const [jobForm, setJobForm] = useState<JobFormState>(emptyJobForm);
  const [stageSearch, setStageSearch] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [candidateViewMode, setCandidateViewMode] =
    useState<PipelineViewMode>('list');
  const [candidateDetail, setCandidateDetail] =
    useState<CandidateProfile | null>(null);
  const [candidateTab, setCandidateTab] = useState<CandidateTab>('profile');
  const [candidateComment, setCandidateComment] = useState('');

  const selectedJob = jobs.find((job) => job.id === selectedJobId) || null;

  const allMembers = useMemo(() => {
    const map = new Map<string, JobCardRecord['hiringTeam'][number]>();
    jobs.forEach((job) => {
      job.hiringTeam.forEach((member) => {
        map.set(member.id, member);
      });
    });
    return Array.from(map.values());
  }, [jobs]);

  const filteredMembers = allMembers.filter((member) => {
    const q = stageSearch.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q)
    );
  });

  const openCreateModal = () => {
    setJobModalOpen(true);
    setJobModalStep(1);
    setJobForm(emptyJobForm);
    setStageSearch('');
    setNewStageName('');
  };

  const openEditModal = (job: JobCardRecord) => {
    setJobModalOpen(true);
    setJobModalStep(1);
    setJobForm({
      id: job.id,
      title: job.jobTitle,
      status: job.status,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      openingsQuantity: job.openingsQuantity,
      closingDate: job.closingDate,
      description: job.description,
      hiringTeamIds: job.hiringTeam.map((member) => member.id),
      workflowStages: [...job.workflowStages],
    });
    setStageSearch('');
    setNewStageName('');
  };

  const saveJob = () => {
    if (
      !jobForm.title.trim() ||
      !jobForm.department.trim() ||
      !jobForm.location.trim() ||
      !jobForm.employmentType.trim() ||
      !jobForm.description.trim()
    ) {
      return;
    }

    const selectedMembers = allMembers.filter((member) =>
      jobForm.hiringTeamIds.includes(member.id),
    );
    const assembledMembers =
      selectedMembers.length > 0 ? selectedMembers : allMembers.slice(0, 2);

    if (jobForm.id) {
      setJobs((prev) =>
        prev.map((job) => {
          if (job.id !== jobForm.id) return job;
          const refreshedPipeline = jobForm.workflowStages.map((stage) => {
            const existing = job.pipeline.find((item) => item.stage === stage);
            return {
              stage,
              isLocked: fixedStages.includes(stage),
              candidates: existing?.candidates || [],
            };
          });
          const candidatesApplied = refreshedPipeline.reduce(
            (total, stage) => total + stage.candidates.length,
            0,
          );
          return {
            ...job,
            jobTitle: jobForm.title,
            status: jobForm.status,
            department: jobForm.department,
            location: jobForm.location,
            actionState: humanActionStatus(jobForm.status),
            employmentType: jobForm.employmentType,
            openingsQuantity: jobForm.openingsQuantity,
            closingDate: jobForm.closingDate,
            description: jobForm.description,
            hiringTeam: assembledMembers,
            workflowStages: jobForm.workflowStages,
            pipeline: refreshedPipeline,
            candidatesApplied,
          };
        }),
      );
    } else {
      const newId = `JOB-${100 + jobs.length + 1}`;
      const newJob: JobCardRecord = {
        id: newId,
        jobTitle: jobForm.title,
        status: jobForm.status,
        department: jobForm.department,
        location: jobForm.location,
        candidatesApplied: 0,
        createdAtLabel: 'Just now',
        actionState: humanActionStatus(jobForm.status),
        employmentType: jobForm.employmentType,
        openingsQuantity: jobForm.openingsQuantity,
        closingDate: jobForm.closingDate,
        description: jobForm.description,
        workflowStages: [...jobForm.workflowStages],
        hiringTeam: assembledMembers,
        pipeline: jobForm.workflowStages.map((stage) => ({
          stage,
          isLocked: fixedStages.includes(stage),
          candidates: [],
        })),
      };
      setJobs((prev) => [newJob, ...prev]);
      setSelectedJobId(newId);
    }

    setJobModalOpen(false);
  };

  const updateJobStatus = (jobId: string, nextStatus: JobStatus) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: nextStatus,
              actionState: humanActionStatus(nextStatus),
            }
          : job,
      ),
    );
  };

  const moveCandidate = (
    jobId: string,
    candidateId: string,
    fromStage: CandidateStage,
    toStage: CandidateStage,
  ) => {
    if (fromStage === toStage) return;
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;
        const sourceStage = job.pipeline.find(
          (stage) => stage.stage === fromStage,
        );
        const candidate = sourceStage?.candidates.find(
          (item) => item.id === candidateId,
        );
        if (!candidate) return job;

        const nextPipeline = job.pipeline.map((stage) => {
          if (stage.stage === fromStage) {
            return {
              ...stage,
              candidates: stage.candidates.filter(
                (item) => item.id !== candidateId,
              ),
            };
          }
          if (stage.stage === toStage) {
            return {
              ...stage,
              candidates: [
                ...stage.candidates,
                {
                  ...candidate,
                  currentStatus: toStage,
                  activityHistory: [
                    {
                      actor: 'Pixel Office',
                      action: 'moved candidate' as const,
                      fromStage,
                      toStage,
                      timestamp: 'now',
                    },
                    ...candidate.activityHistory,
                  ],
                },
              ],
            };
          }
          return stage;
        });

        return { ...job, pipeline: nextPipeline };
      }),
    );
  };

  const updateCandidateDetail = (
    updater: (candidate: CandidateProfile) => CandidateProfile,
  ) => {
    if (!candidateDetail || !selectedJob) return;
    const updated = updater(candidateDetail);
    setCandidateDetail(updated);
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== selectedJob.id) return job;
        return {
          ...job,
          pipeline: job.pipeline.map((stage) => ({
            ...stage,
            candidates: stage.candidates.map((candidate) =>
              candidate.id === updated.id ? updated : candidate,
            ),
          })),
        };
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s all job listings
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Add new
        </Button>
      </div>

      {!selectedJob ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.jobTitle}
                      </h3>
                      <Badge variant={statusBadgeVariant(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {job.department} • {job.location}
                    </p>
                    <p className="mt-4 text-sm text-gray-600">
                      {job.candidatesApplied} Candidates Applied
                    </p>
                  </button>

                  <div className="flex items-center gap-2">
                    <Select
                      value={job.status}
                      onValueChange={(value) =>
                        updateJobStatus(job.id, value as JobStatus)
                      }
                    >
                      <SelectTrigger className="w-32 bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="UNACTIVE">Unactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon-sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(job)}>
                          Edit job
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setJobs((prev) =>
                              prev.filter((item) => item.id !== job.id),
                            );
                            if (selectedJobId === job.id) {
                              setSelectedJobId(null);
                            }
                          }}
                        >
                          Delete job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Button
                  variant="ghost"
                  className="mb-2 -ml-2 h-8 px-2 text-gray-600"
                  onClick={() => setSelectedJobId(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Jobs
                </Button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedJob.jobTitle}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedJob.department} • {selectedJob.location} •{' '}
                  {selectedJob.createdAtLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => openEditModal(selectedJob)}
                >
                  Edit Job
                </Button>
                <Tabs
                  value={candidateViewMode}
                  onValueChange={(value) =>
                    setCandidateViewMode(value as PipelineViewMode)
                  }
                >
                  <TabsList>
                    <TabsTrigger value="list">List view</TabsTrigger>
                    <TabsTrigger value="board">Board view</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-3">
                <Tabs
                  value={candidateViewMode}
                  onValueChange={(value) =>
                    setCandidateViewMode(value as PipelineViewMode)
                  }
                >
                  <TabsContent value="list" className="space-y-3">
                    {selectedJob.pipeline.map((stage) => (
                      <div
                        key={stage.stage}
                        className="rounded-lg border border-gray-200 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">
                            {stage.stage} ({stage.candidates.length})
                          </h3>
                          {stage.stage === 'Interview' ? (
                            <Button size="sm" variant="outline">
                              Schedule Interview
                            </Button>
                          ) : null}
                        </div>
                        {stage.candidates.length === 0 ? (
                          <p className="text-sm text-gray-400">
                            No candidates in this stage
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {stage.candidates.map((candidate) => (
                              <div
                                key={candidate.id}
                                className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3"
                              >
                                <button
                                  type="button"
                                  className="text-left"
                                  onClick={() => {
                                    setCandidateDetail(candidate);
                                    setCandidateTab('profile');
                                  }}
                                >
                                  <p className="font-medium text-gray-900">
                                    {candidate.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {candidate.email} • {candidate.appliedDate}
                                  </p>
                                </button>
                                <Select
                                  value={stage.stage}
                                  onValueChange={(value) =>
                                    moveCandidate(
                                      selectedJob.id,
                                      candidate.id,
                                      stage.stage,
                                      value as CandidateStage,
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-40 bg-white text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {selectedJob.workflowStages.map(
                                      (workflowStage) => (
                                        <SelectItem
                                          key={workflowStage}
                                          value={workflowStage}
                                        >
                                          {workflowStage}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="board">
                    <div className="grid gap-3 overflow-x-auto pb-1 md:grid-cols-2 xl:grid-cols-3">
                      {selectedJob.pipeline.map((stage) => (
                        <div
                          key={stage.stage}
                          className="min-h-60 rounded-lg border border-gray-200 bg-gray-50 p-3"
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            const payload =
                              event.dataTransfer.getData('text/plain');
                            const [candidateId, sourceStage] =
                              payload.split('::');
                            if (!candidateId || !sourceStage) return;
                            moveCandidate(
                              selectedJob.id,
                              candidateId,
                              sourceStage as CandidateStage,
                              stage.stage,
                            );
                          }}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {stage.stage}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {stage.candidates.length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {stage.candidates.map((candidate) => (
                              <button
                                key={candidate.id}
                                type="button"
                                draggable
                                onDragStart={(event) => {
                                  event.dataTransfer.setData(
                                    'text/plain',
                                    `${candidate.id}::${stage.stage}`,
                                  );
                                }}
                                className="w-full rounded-md border border-gray-200 bg-white p-3 text-left shadow-sm"
                                onClick={() => {
                                  setCandidateDetail(candidate);
                                  setCandidateTab('profile');
                                }}
                              >
                                <p className="font-medium text-gray-900">
                                  {candidate.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {candidate.email}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Hiring Team
                  </h3>
                  <div className="space-y-2">
                    {selectedJob.hiringTeam.map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback className="bg-gray-900 text-xs font-semibold text-white">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Activity Logs
                  </h3>
                  <div className="space-y-2">
                    {selectedJob.pipeline
                      .flatMap((stage) => stage.candidates)
                      .flatMap((candidate) => candidate.activityHistory)
                      .slice(0, 4)
                      .map((activity, idx) => (
                        <p
                          key={`${activity.timestamp}-${idx}`}
                          className="text-xs text-gray-600"
                        >
                          {activity.actor} moved candidate from{' '}
                          {activity.fromStage} to {activity.toStage} (
                          {activity.timestamp})
                        </p>
                      ))}
                    {!selectedJob.pipeline
                      .flatMap((stage) => stage.candidates)
                      .flatMap((candidate) => candidate.activityHistory)
                      .length ? (
                      <p className="text-xs text-gray-400">No activity yet</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={jobModalOpen} onOpenChange={setJobModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {jobForm.id ? 'Edit Job Posting' : 'Create a New Job'}
            </DialogTitle>
            <DialogDescription>
              Step {jobModalStep} of 2 •{' '}
              {jobModalStep === 1 ? 'Job Info' : 'Hiring Team & Workflow'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Badge
                variant={jobModalStep === 1 ? 'default' : 'success'}
                className="px-3 py-1"
              >
                Job Info
              </Badge>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <Badge
                variant={jobModalStep === 2 ? 'default' : 'muted'}
                className="px-3 py-1"
              >
                Hiring Team & Workflow
              </Badge>
            </div>

            {jobModalStep === 1 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Job Title *
                  </label>
                  <Input
                    value={jobForm.title}
                    onChange={(event) =>
                      setJobForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Enter role title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Employment Type *
                  </label>
                  <Select
                    value={jobForm.employmentType}
                    onValueChange={(value) =>
                      setJobForm((prev) => ({ ...prev, employmentType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Department *
                  </label>
                  <Select
                    value={jobForm.department}
                    onValueChange={(value) =>
                      setJobForm((prev) => ({ ...prev, department: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Designer">Designer</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Office *
                  </label>
                  <Select
                    value={jobForm.location}
                    onValueChange={(value) =>
                      setJobForm((prev) => ({ ...prev, location: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select office" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unpixel HQ">Unpixel HQ</SelectItem>
                      <SelectItem value="Unpixel Indonesia">
                        Unpixel Indonesia
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Quantity *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={jobForm.openingsQuantity}
                    onChange={(event) =>
                      setJobForm((prev) => ({
                        ...prev,
                        openingsQuantity: Number(event.target.value || 1),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Closing Date
                  </label>
                  <Input
                    type="date"
                    value={jobForm.closingDate}
                    onChange={(event) =>
                      setJobForm((prev) => ({
                        ...prev,
                        closingDate: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <div className="flex items-center gap-1 rounded-t-md border border-b-0 border-gray-200 bg-gray-50 p-2">
                    <Button type="button" size="icon-xs" variant="ghost">
                      <Bold className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="icon-xs" variant="ghost">
                      <Italic className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="icon-xs" variant="ghost">
                      <Underline className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="icon-xs" variant="ghost">
                      <Smile className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="icon-xs" variant="ghost">
                      <LinkIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="icon-xs" variant="ghost">
                      <List className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Textarea
                    className="min-h-32 rounded-t-none border-gray-200"
                    value={jobForm.description}
                    onChange={(event) =>
                      setJobForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Describe responsibilities and expectations"
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Invite Member</h4>
                  <Input
                    placeholder="Search by name or email"
                    value={stageSearch}
                    onChange={(event) => setStageSearch(event.target.value)}
                  />
                  <div className="space-y-2 rounded-lg border border-gray-200 p-3">
                    {filteredMembers.map((member) => {
                      const active = jobForm.hiringTeamIds.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarFallback className="bg-gray-900 text-xs font-semibold text-white">
                                {member.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {member.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {member.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant={active ? 'outline' : 'default'}
                            onClick={() =>
                              setJobForm((prev) => ({
                                ...prev,
                                hiringTeamIds: active
                                  ? prev.hiringTeamIds.filter(
                                      (id) => id !== member.id,
                                    )
                                  : [...prev.hiringTeamIds, member.id],
                              }))
                            }
                          >
                            {active ? 'Remove' : 'Invite'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Hiring Workflow
                  </h4>
                  <div className="space-y-2 rounded-lg border border-gray-200 p-3">
                    {jobForm.workflowStages.map((stage, index) => {
                      const locked = fixedStages.includes(stage);
                      return (
                        <div
                          key={`${stage}-${index}`}
                          className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                        >
                          <div className="flex items-center gap-2 text-sm">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <span>{stage}</span>
                            {locked ? (
                              <Lock className="h-3.5 w-3.5 text-gray-400" />
                            ) : null}
                          </div>
                          {locked ? (
                            <span className="text-xs text-gray-400">
                              Mandatory
                            </span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                size="icon-xs"
                                variant="ghost"
                                onClick={() =>
                                  setJobForm((prev) => {
                                    if (index === 0) return prev;
                                    const nextStages = [...prev.workflowStages];
                                    const previousStage = nextStages[index - 1];
                                    const currentStage = nextStages[index];
                                    if (!previousStage || !currentStage)
                                      return prev;
                                    nextStages[index - 1] = currentStage;
                                    nextStages[index] = previousStage;
                                    return {
                                      ...prev,
                                      workflowStages: nextStages,
                                    };
                                  })
                                }
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                size="icon-xs"
                                variant="ghost"
                                onClick={() =>
                                  setJobForm((prev) => {
                                    if (
                                      index ===
                                      prev.workflowStages.length - 1
                                    )
                                      return prev;
                                    const nextStages = [...prev.workflowStages];
                                    const nextStage = nextStages[index + 1];
                                    const currentStage = nextStages[index];
                                    if (!nextStage || !currentStage)
                                      return prev;
                                    nextStages[index + 1] = currentStage;
                                    nextStages[index] = nextStage;
                                    return {
                                      ...prev,
                                      workflowStages: nextStages,
                                    };
                                  })
                                }
                              >
                                ↓
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="ghost"
                                  >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setJobForm((prev) => ({
                                        ...prev,
                                        workflowStages:
                                          prev.workflowStages.filter(
                                            (_, stageIndex) =>
                                              stageIndex !== index,
                                          ),
                                      }))
                                    }
                                  >
                                    Remove stage
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add custom stage"
                      value={newStageName}
                      onChange={(event) => setNewStageName(event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const stage = newStageName.trim();
                        if (!stage) return;
                        if (
                          jobForm.workflowStages.includes(
                            stage as CandidateStage,
                          )
                        )
                          return;
                        setJobForm((prev) => ({
                          ...prev,
                          workflowStages: [
                            ...prev.workflowStages,
                            stage as CandidateStage,
                          ],
                        }));
                        setNewStageName('');
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (jobModalStep === 1) {
                  setJobModalOpen(false);
                  return;
                }
                setJobModalStep(1);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {jobModalStep === 1 ? (
              <Button type="button" onClick={() => setJobModalStep(2)}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={saveJob}>
                {jobForm.id ? 'Save Changes' : 'Publish Job'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(candidateDetail)}
        onOpenChange={(open) => {
          if (!open) setCandidateDetail(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          {candidateDetail ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarFallback className="bg-gray-900 text-sm font-semibold text-white">
                      {candidateDetail.avatarUrl}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{candidateDetail.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm font-normal text-gray-500">
                      <Badge variant="outline">
                        {candidateDetail.currentStatus.toUpperCase()}
                      </Badge>
                      <span>{candidateDetail.appliedJob}</span>
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {candidateDetail.email}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {candidateDetail.phone}
                  </span>
                  <Select
                    value={candidateDetail.currentStatus}
                    onValueChange={(value) =>
                      updateCandidateDetail((prev) => ({
                        ...prev,
                        currentStatus: value as CandidateStage,
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 w-44 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedJob.workflowStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          Move To: {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DialogDescription>
              </DialogHeader>

              <Tabs
                value={candidateTab}
                onValueChange={(value) =>
                  setCandidateTab(value as CandidateTab)
                }
                className="space-y-4"
              >
                <TabsList className="h-auto flex-wrap gap-2 bg-transparent p-0">
                  {(
                    [
                      'profile',
                      'email',
                      'evaluation',
                      'comments',
                      'activity',
                    ] as CandidateTab[]
                  ).map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-full border border-transparent px-3 py-1.5 text-sm capitalize data-[state=active]:border-gray-900 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="profile">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                      <CardContent className="space-y-3 p-4">
                        <h4 className="font-semibold text-gray-900">Profile</h4>
                        <p className="text-sm text-gray-600">
                          Candidate applied on {candidateDetail.appliedDate}{' '}
                          with rating {candidateDetail.rating}/5.
                        </p>
                        <p className="text-sm text-gray-600">
                          Resume/CV preview is available in quick pane for
                          review.
                        </p>
                        <Button variant="outline" size="sm">
                          <Briefcase className="h-4 w-4" />
                          Preview Resume
                        </Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="space-y-3 p-4">
                        <h4 className="font-semibold text-gray-900">
                          Communication Log
                        </h4>
                        <p className="text-sm text-gray-600">
                          Centralized communication with timestamped updates is
                          visible to the entire hiring team.
                        </p>
                        <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                          Template:{' '}
                          {candidateDetail.emailInteraction.templateUsed}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="evaluation">
                  <Card>
                    <CardContent className="space-y-4 p-4">
                      <h4 className="font-semibold text-gray-900">Scorecard</h4>
                      <div className="grid gap-2 md:grid-cols-5">
                        {ratingOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`rounded-md border p-2 text-center text-sm ${candidateDetail.evaluation.selectedRating === option.value ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700'}`}
                            onClick={() =>
                              updateCandidateDetail((prev) => ({
                                ...prev,
                                evaluation: {
                                  ...prev.evaluation,
                                  selectedRating: option.value,
                                },
                              }))
                            }
                          >
                            <p>{option.emoji}</p>
                            <p>{option.value}</p>
                          </button>
                        ))}
                      </div>
                      <div>
                        <div className="mb-2 flex items-center gap-1 rounded-t-md border border-b-0 border-gray-200 bg-gray-50 p-2">
                          <Button type="button" size="icon-xs" variant="ghost">
                            <Bold className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" size="icon-xs" variant="ghost">
                            <Italic className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" size="icon-xs" variant="ghost">
                            <Underline className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" size="icon-xs" variant="ghost">
                            <Smile className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" size="icon-xs" variant="ghost">
                            <LinkIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" size="icon-xs" variant="ghost">
                            <List className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <Textarea
                          className="min-h-28 rounded-t-none border-gray-200"
                          value={candidateDetail.evaluation.comments}
                          onChange={(event) =>
                            updateCandidateDetail((prev) => ({
                              ...prev,
                              evaluation: {
                                ...prev.evaluation,
                                comments: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <Button>
                        <Check className="h-4 w-4" />
                        Submit
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="email">
                  <Card>
                    <CardContent className="space-y-4 p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Template
                          </label>
                          <Select
                            value={
                              candidateDetail.emailInteraction.templateUsed
                            }
                            onValueChange={(value) =>
                              updateCandidateDetail((prev) => ({
                                ...prev,
                                emailInteraction: {
                                  ...prev.emailInteraction,
                                  templateUsed: value,
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Auto Confirmation">
                                Auto Confirmation
                              </SelectItem>
                              <SelectItem value="Interview Invite">
                                Interview Invite
                              </SelectItem>
                              <SelectItem value="Follow Up">
                                Follow Up
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Subject
                          </label>
                          <Input
                            value={candidateDetail.emailInteraction.subject}
                            onChange={(event) =>
                              updateCandidateDetail((prev) => ({
                                ...prev,
                                emailInteraction: {
                                  ...prev.emailInteraction,
                                  subject: event.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                      <Textarea
                        className="min-h-36 border-gray-200"
                        value={candidateDetail.emailInteraction.bodyContent}
                        onChange={(event) =>
                          updateCandidateDetail((prev) => ({
                            ...prev,
                            emailInteraction: {
                              ...prev.emailInteraction,
                              bodyContent: event.target.value,
                            },
                          }))
                        }
                      />
                      <div className="flex items-center justify-between">
                        <Button variant="outline">Back</Button>
                        <Button>Create</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comments">
                  <Card>
                    <CardContent className="space-y-3 p-4">
                      <h4 className="font-semibold text-gray-900">
                        Internal Comments
                      </h4>
                      <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                        @mention teammates to collaborate privately on this
                        candidate.
                      </div>
                      <Textarea
                        className="min-h-24 border-gray-200"
                        value={candidateComment}
                        onChange={(event) =>
                          setCandidateComment(event.target.value)
                        }
                        placeholder="Write a private comment"
                      />
                      <Button variant="outline">
                        <MessageSquare className="h-4 w-4" />
                        Save comment
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity">
                  <Card>
                    <CardContent className="space-y-3 p-4">
                      <h4 className="font-semibold text-gray-900">
                        Activity Audit Log
                      </h4>
                      {candidateDetail.activityHistory.map(
                        (activity, index) => (
                          <div
                            key={`${activity.timestamp}-${index}`}
                            className="rounded-md bg-gray-50 p-3"
                          >
                            <p className="text-sm text-gray-700">
                              {activity.actor} moved candidate from{' '}
                              {activity.fromStage} to {activity.toStage}
                            </p>
                            {activity.reason ? (
                              <p className="text-xs text-gray-500">
                                Reason: {activity.reason}
                              </p>
                            ) : null}
                            <p className="text-xs text-gray-400">
                              {activity.timestamp}
                            </p>
                          </div>
                        ),
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
