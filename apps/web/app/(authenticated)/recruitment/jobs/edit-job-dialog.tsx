'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Lock,
  Tag as TagIcon,
  Check,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBranches } from '@/hooks/use-branches';
import { useHiringStages } from '@/hooks/use-hiring-stages';
import { useTags } from '@/hooks/use-tags';
import { apiPatch } from '@/lib/api';
import { mutate } from 'swr';
import type {
  JobDepartment,
  EmploymentType,
  JobListItem,
} from '@repo/contracts';

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

interface EditJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobListItem | null;
}

export function EditJobDialog({ open, onOpenChange, job }: EditJobDialogProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

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
  const { stages: globalStages } = useHiringStages();
  const { tags } = useTags();

  const hasBranches = branches && branches.length > 0;

  // Populate form when job changes
  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setDepartment(job.department as JobDepartment);
      setEmploymentType(job.employmentType as EmploymentType);
      setLocation(job.location || '');
      setQuantity(String(job.quantity));
      setExpectedClosingDate(
        job.expectedClosingDate
          ? new Date(job.expectedClosingDate).toISOString().split('T')[0]!
          : '',
      );
      setDescription(job.description || '');
      setSelectedTagIds(job.tags?.map((t) => t.id) ?? []);

      // Initialize workflow stages from job's per-job stages, or fallback to global
      if (job.hiringStages && job.hiringStages.length > 0) {
        setWorkflowStages(
          job.hiringStages
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((jhs) => ({
              hiringStageId: jhs.hiringStageId,
              name: jhs.hiringStage.name,
              isLocked: jhs.hiringStage.isLocked,
              orderIndex: jhs.orderIndex,
            })),
        );
      } else if (globalStages && globalStages.length > 0) {
        setWorkflowStages(
          globalStages.map((s) => ({
            hiringStageId: s.id,
            name: s.name,
            isLocked: s.isLocked,
            orderIndex: s.orderIndex,
          })),
        );
      } else {
        setWorkflowStages([]);
      }

      setStep(1);
      setMemberSearch('');
      setDragIndex(null);
    }
  }, [job, globalStages]);

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
    // Can't move above a locked stage at the top
    const target = index - 1;
    if (workflowStages[target]?.isLocked && target === 0) return false;
    return true;
  };

  const canMoveDown = (index: number) => {
    if (index >= workflowStages.length - 1) return false;
    if (workflowStages[index]?.isLocked) return false;
    // Can't move below a locked stage at the bottom
    const target = index + 1;
    if (
      workflowStages[target]?.isLocked &&
      target === workflowStages.length - 1
    )
      return false;
    return true;
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleClose = (value: boolean) => {
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

  const handleSave = async () => {
    if (!isStep1Valid || !job) return;
    setSaving(true);
    try {
      await apiPatch(`/jobs/${job.id}`, {
        title,
        department: department as JobDepartment,
        employmentType: employmentType as EmploymentType,
        description: description || undefined,
        quantity: parseInt(quantity, 10) || 1,
        expectedClosingDate: expectedClosingDate || undefined,
        location: location || undefined,
        tagIds: selectedTagIds,
        hiringStages: workflowStages.map((s) => ({
          hiringStageId: s.hiringStageId,
          orderIndex: s.orderIndex,
        })),
      });
      toast.success('Job updated successfully');
      handleClose(false);
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/jobs'),
        undefined,
        { revalidate: true },
      );
    } catch {
      toast.error('Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Edit Job</DialogTitle>
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
              <Label htmlFor="edit-job-title">
                Job Title<span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-job-title"
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
                <Label htmlFor="edit-quantity">
                  Quantity<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-closing-date">Expected Closing Date</Label>
                <Input
                  id="edit-closing-date"
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
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
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

            {/* Hiring Workflow — reorderable per job */}
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
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
