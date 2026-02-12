import { ChevronDown, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TemplateTask } from '@repo/contracts';
import { getTaskTypeConfig } from '@/lib/task-type-utils';

interface TaskItemProps {
  task: TemplateTask;
  onEdit: (task: TemplateTask) => void;
  onDelete: (taskId: string) => void;
  isDeleting: boolean;
}

export function TaskItem({
  task,
  onEdit,
  onDelete,
  isDeleting,
}: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const badgeConfig = getTaskTypeConfig(task.taskType);

  return (
    <div
      style={style}
      ref={setNodeRef}
      className="rounded-lg border bg-card transition-colors hover:bg-muted/30"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
          <span className="flex-1 text-sm font-medium text-foreground">
            {task.name}
          </span>
        </button>

        <Badge variant={badgeConfig.badgeVariant} className="shrink-0">
          {badgeConfig.label}
        </Badge>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:text-white"
            onClick={() => onEdit(task)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 disabled:text-white"
            onClick={() => onDelete(task.id)}
            disabled={isDeleting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 border-t bg-muted/20 px-4 py-3">
          <div className="grid gap-3 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">
                Task Name
              </span>
              <p className="mt-1 text-foreground">{task.name}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Assign</span>
              <p className="mt-1 text-foreground">
                {task.taskType === 'EMPLOYEE_INFORMATION'
                  ? 'Employee'
                  : 'Line Manager'}
              </p>
            </div>
            {task.dueInDays && (
              <div>
                <span className="font-medium text-muted-foreground">
                  Due Date
                </span>
                <p className="mt-1 text-foreground">
                  {task.dueInDays} day{task.dueInDays > 1 ? 's' : ''} before
                  join date
                </p>
              </div>
            )}
            {task.description && (
              <div>
                <span className="font-medium text-muted-foreground">
                  Description
                </span>
                <p className="mt-1 whitespace-pre-wrap text-foreground">
                  {task.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
