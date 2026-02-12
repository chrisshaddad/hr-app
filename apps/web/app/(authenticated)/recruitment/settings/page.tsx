'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GitBranch,
  Tag as TagIcon,
  Mail,
  Plus,
  GripVertical,
  Lock,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTags } from '@/hooks/use-tags';
import { useHiringStages } from '@/hooks/use-hiring-stages';
import { cn } from '@/lib/utils';
import type { HiringStageItem } from '@repo/contracts';

type SettingsTab = 'workflow' | 'tags' | 'email';

const SETTINGS_TABS = [
  { id: 'workflow' as const, label: 'Hiring Workflow', icon: GitBranch },
  { id: 'tags' as const, label: 'Tags', icon: TagIcon },
  { id: 'email' as const, label: 'Email Template', icon: Mail },
];

/* ─── Sortable Stage Row ─── */
function SortableStageRow({
  stage,
  onDelete,
}: {
  stage: HiringStageItem;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id, disabled: stage.isLocked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3.5"
    >
      <div className="flex items-center gap-3">
        {stage.isLocked ? (
          <Lock className="h-4 w-4 shrink-0 text-gray-300" />
        ) : (
          <button
            className="cursor-grab touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />
          </button>
        )}
        <span className="text-sm font-medium text-gray-700">{stage.name}</span>
      </div>
      {!stage.isLocked && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(stage.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/* ─── Hiring Workflow Tab (DB-backed + DnD) ─── */
function HiringWorkflowTab() {
  const { stages, isLoading, createStage, reorderStages, deleteStage } =
    useHiringStages();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [creating, setCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAddStage = async () => {
    if (!newStageName.trim()) {
      toast.error('Stage name is required');
      return;
    }
    setCreating(true);
    try {
      // Insert before the first locked stage after the unlocked ones (i.e. before "Offered")
      const lockedTailStart =
        stages?.findIndex((s) => s.isLocked && s.orderIndex > 0) ?? -1;
      const insertIndex =
        lockedTailStart !== -1 && stages?.[lockedTailStart]
          ? stages[lockedTailStart].orderIndex
          : (stages?.length ?? 0);

      await createStage({
        name: newStageName,
        orderIndex: insertIndex,
      });
      toast.success('Stage added');
      setNewStageName('');
      setShowAddDialog(false);
    } catch {
      toast.error('Failed to add stage');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStage = async (id: string) => {
    try {
      await deleteStage(id);
      toast.success('Stage removed');
    } catch {
      toast.error('Failed to remove stage');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !stages) return;

    const oldIndex = stages.findIndex((s) => s.id === active.id);
    const newIndex = stages.findIndex((s) => s.id === over.id);

    // Don't allow dragging onto locked positions
    if (stages[newIndex]?.isLocked) return;

    const reordered = arrayMove(stages, oldIndex, newIndex);

    try {
      await reorderStages({
        stages: reordered.map((s, i) => ({ id: s.id, orderIndex: i })),
      });
    } catch {
      toast.error('Failed to reorder stages');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Hiring Workflow</h2>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2 bg-gray-900 text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Stage</span>
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stages?.map((s) => s.id) ?? []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {stages?.map((stage) => (
              <SortableStageRow
                key={stage.id}
                stage={stage}
                onDelete={handleDeleteStage}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Stage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="stage-name">Stage Name</Label>
              <Input
                id="stage-name"
                placeholder="e.g. Technical Assessment"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddStage}
              disabled={creating}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              {creating ? 'Adding...' : 'Add Stage'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Tags Tab ─── */
function TagResourceTab() {
  const { tags, isLoading, createTag, deleteTag } = useTags();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }
    setCreating(true);
    try {
      await createTag({ name: newTagName });
      toast.success('Tag created');
      setNewTagName('');
      setShowAddDialog(false);
    } catch {
      toast.error('Failed to create tag');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await deleteTag(id);
      toast.success('Tag deleted');
    } catch {
      toast.error('Failed to delete tag');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="cursor-pointer gap-2 bg-gray-900 text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Tag</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : !tags?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TagIcon className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">
            No tags yet. Create your first tag to organize candidates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {tag.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {tag._count.candidates} Candidate
                  {tag._count.candidates !== 1 ? 's' : ''}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={() => handleDeleteTag(tag.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                placeholder="e.g. Senior, Remote, Urgent"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={creating}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              {creating ? 'Creating...' : 'Create Tag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Email Template Tab ─── */
function EmailTemplateTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Mail className="mb-3 h-8 w-8 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
      <p className="mt-1 text-sm text-gray-500">
        Email template management is being developed.
      </p>
    </div>
  );
}

/* ─── Main Settings Page ─── */
export default function RecruitmentSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('workflow');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Recruitment Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {activeTab === 'workflow' && 'Manage your hiring workflow stages'}
          {activeTab === 'tags' && 'Organize candidates with tags'}
          {activeTab === 'email' && 'Manage email templates'}
        </p>
      </div>

      {/* Mobile tab selector */}
      <div className="flex gap-2 overflow-x-auto md:hidden">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200',
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left Sidebar — hidden on mobile, shown on md+ */}
        <div className="hidden w-64 shrink-0 space-y-1 rounded-xl border border-gray-200 bg-white p-3 md:block">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          {activeTab === 'workflow' && <HiringWorkflowTab />}
          {activeTab === 'tags' && <TagResourceTab />}
          {activeTab === 'email' && <EmailTemplateTab />}
        </div>
      </div>
    </div>
  );
}
