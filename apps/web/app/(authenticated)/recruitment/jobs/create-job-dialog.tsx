'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  GripVertical,
  CheckCircle2,
  Lock,
  Tag as TagIcon,
  Check,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { createJob } from '@/hooks/use-jobs';
import { useBranches } from '@/hooks/use-branches';
import { useHiringStages } from '@/hooks/use-hiring-stages';
import { useTags } from '@/hooks/use-tags';
import type { JobDepartment, EmploymentType } from '@repo/contracts';

interface WorkflowStage {
  hiringStageId: string;
  name: string;
  isLocked: boolean;
  orderIndex: number;
}

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
  FULL_TIME: 'Fulltime',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (jobId: string) => void;
}

export function CreateJobDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateJobDialogProps) {
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  // Step 1 form state
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<JobDepartment | ''>('');
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [expectedClosingDate, setExpectedClosingDate] = useState('');
  const [description, setDescription] = useState('');

  // Step 2 state
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const { branches } = useBranches();
  const { stages } = useHiringStages();
  const { tags } = useTags();

  // Initialize workflow stages from global stages
  useEffect(() => {
    if (stages && stages.length > 0 && workflowStages.length === 0) {
      setWorkflowStages(
        stages.map((s) => ({
          hiringStageId: s.id,
          name: s.name,
          isLocked: s.isLocked,
          orderIndex: s.orderIndex,
        })),
      );
    }
  }, [stages, workflowStages.length]);

  const moveStage = useCallback((fromIndex: number, toIndex: number) => {
    setWorkflowStages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved!);
      return updated.map((s, i) => ({ ...s, orderIndex: i }));
    });
  }, []);

  const canMoveUp = (index: number) => {
    if (index === 0) return false;
    if (workflowStages[index]?.isLocked) return false;
    const target = index - 1;
    if (workflowStages[target]?.isLocked && target === 0) return false;
    return true;
  };

  const canMoveDown = (index: number) => {
    if (index >= workflowStages.length - 1) return false;
    if (workflowStages[index]?.isLocked) return false;
    const target = index + 1;
    if (
      workflowStages[target]?.isLocked &&
      target === workflowStages.length - 1
    )
      return false;
    return true;
  };

  const hasBranches = branches && branches.length > 0;

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setDepartment('');
    setEmploymentType('');
    setLocation('');
    setQuantity('1');
    setExpectedClosingDate('');
    setDescription('');
    setMemberSearch('');
    setSelectedTagIds([]);
    setWorkflowStages([]);
    setDragIndex(null);
    setShowSuccess(false);
    setCreatedJobId(null);
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      resetForm();
    }
    onOpenChange(value);
  };

  const isStep1Valid =
    title.trim() !== '' && department !== '' && employmentType !== '';

  const handleNext = () => {
    if (!isStep1Valid) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleCreate = async () => {
    if (!isStep1Valid) return;
    setCreating(true);
    try {
      const created = await createJob({
        title,
        department: department as JobDepartment,
        employmentType: employmentType as EmploymentType,
        description: description || undefined,
        quantity: parseInt(quantity, 10) || 1,
        expectedClosingDate: expectedClosingDate || undefined,
        location: location || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        hiringStages:
          workflowStages.length > 0
            ? workflowStages.map((s) => ({
                hiringStageId: s.hiringStageId,
                orderIndex: s.orderIndex,
              }))
            : undefined,
      });
      setCreatedJobId(created.id);
      setShowSuccess(true);
    } catch {
      toast.error('Failed to create job');
    } finally {
      setCreating(false);
    }
  };

  const handleCheckNow = () => {
    if (createdJobId) {
      handleClose(false);
      onSuccess(createdJobId);
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Add Job Success!
            </h2>
            <p className="text-center text-sm text-gray-500">
              New job has been successfully created, stay tuned!
            </p>
            <Button
              onClick={handleCheckNow}
              className="mt-2 w-full bg-gray-900 text-white hover:bg-gray-800"
            >
              Check Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Create New Job
            </DialogTitle>
            <span className="text-sm font-medium text-primary-base">
              STEP {step} OF 2
            </span>
          </div>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 text-sm font-medium ${
              step === 1 ? 'text-primary-base' : 'text-gray-400'
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === 1
                  ? 'bg-primary-base text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              1
            </span>
            <span className="hidden sm:inline">Job Info</span>
          </button>
          <button
            onClick={() => isStep1Valid && setStep(2)}
            className={`flex items-center gap-2 text-sm font-medium ${
              step === 2 ? 'text-primary-base' : 'text-gray-400'
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === 2
                  ? 'bg-primary-base text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              2
            </span>
            <span className="hidden sm:inline">Hiring Team & Workflow</span>
          </button>
        </div>

        {/* Step 1: Job Info */}
        {step === 1 && (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="job-title">
                Job Title<span className="text-red-500">*</span>
              </Label>
              <Input
                id="job-title"
                placeholder="Job title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>
                  Employment Type<span className="text-red-500">*</span>
                </Label>
                <Select
                  value={employmentType}
                  onValueChange={(v) => setEmploymentType(v as EmploymentType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
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
              <div className="space-y-2">
                <Label>
                  Department<span className="text-red-500">*</span>
                </Label>
                <Select
                  value={department}
                  onValueChange={(v) => setDepartment(v as JobDepartment)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
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
                <Label>Office</Label>
                {hasBranches ? (
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select office" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="e.g. Main Office, Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing-date">Expected Closing Date</Label>
                <Input
                  id="closing-date"
                  type="date"
                  placeholder="Select Date"
                  value={expectedClosingDate}
                  onChange={(e) => setExpectedClosingDate(e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  Job will be automatically closed after this date
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Job description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={5}
              />
            </div>
          </div>
        )}

        {/* Step 2: Hiring Team & Workflow */}
        {step === 2 && (
          <div className="space-y-6 py-2">
            {/* Invite Member */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Invite Member</Label>
              <div className="relative">
                <Input
                  placeholder="Search name or email address"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Tags — selectable */}
            {tags && tags.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  <TagIcon className="mr-1.5 inline h-4 w-4" />
                  Tags
                  {selectedTagIds.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      {selectedTagIds.length} selected
                    </span>
                  )}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          isSelected
                            ? 'border-primary-base bg-primary-base/10 text-primary-base'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hiring Workflow — reorderable */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Hiring Workflow
                </Label>
                <span className="text-xs text-gray-400">
                  Drag or use arrows to reorder
                </span>
              </div>
              <div className="space-y-1">
                {workflowStages.map((stage, index) => (
                  <div
                    key={stage.hiringStageId}
                    draggable={!stage.isLocked}
                    onDragStart={() => !stage.isLocked && setDragIndex(index)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragIndex === null || stage.isLocked) return;
                    }}
                    onDrop={() => {
                      if (
                        dragIndex !== null &&
                        dragIndex !== index &&
                        !stage.isLocked
                      ) {
                        moveStage(dragIndex, index);
                      }
                      setDragIndex(null);
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-colors ${
                      dragIndex === index
                        ? 'border-primary-base bg-primary-base/5'
                        : 'border-gray-200'
                    } ${!stage.isLocked ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    {stage.isLocked ? (
                      <Lock className="h-4 w-4 shrink-0 text-gray-300" />
                    ) : (
                      <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
                    )}
                    <span className="flex-1 text-sm font-medium text-gray-700">
                      {stage.name}
                    </span>
                    {!stage.isLocked && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={!canMoveUp(index)}
                          onClick={() =>
                            canMoveUp(index) && moveStage(index, index - 1)
                          }
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={!canMoveDown(index)}
                          onClick={() =>
                            canMoveDown(index) && moveStage(index, index + 1)
                          }
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {workflowStages.length === 0 && (
                  <p className="py-4 text-center text-sm text-gray-400">
                    No workflow stages configured. Go to Settings to set them
                    up.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
          <Button
            variant="outline"
            onClick={step === 1 ? () => handleClose(false) : handleBack}
            className="rounded-lg"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step === 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isStep1Valid}
              className="rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              {creating ? 'Creating...' : 'Create Job'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
