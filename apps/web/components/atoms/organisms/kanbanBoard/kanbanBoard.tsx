'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CandidateCard,
  CandidateCardData,
} from '@/components/atoms/molecules/candidateCard/candidateCard';

export type Stage = {
  id: string;
  name: string;
};

type KanbanBoardProps = {
  stages: Stage[];
  candidates: CandidateCardData[];
  onMoveCandidate?: (candidateId: string, newStageId: string) => void;
};

const KanbanColumn = ({
  stage,
  candidates,
  isOver,
}: {
  stage: Stage;
  candidates: CandidateCardData[];
  isOver?: boolean;
}) => {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: stage.id,
    data: {
      type: 'stage',
      stageId: stage.id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      data-stage-id={stage.id}
      className={`flex-1 min-w-[300px] bg-GreyScale-50 rounded-[16px] p-5 h-full flex flex-col border-2 ${
        isOver || isDroppableOver ? 'border-Primary-Base' : 'border-transparent'
      }`}
    >
      <div className="flex items-center gap-[10px] pb-6 shrink-0">
        <h3 className="text-GreyScale-900 font-bold text-sm">{stage.name}</h3>
        <div className="border h-5 w-5 border-Primary-Base text-Primary-Base rounded-[6px] flex items-center justify-center text-xs font-bold">
          {candidates.length}
        </div>
      </div>
      <SortableContext
        items={candidates.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-[100px]">
          {candidates.map((candidate) => (
            <SortableCandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const SortableCandidateCard = ({
  candidate,
}: {
  candidate: CandidateCardData;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing touch-none"
    >
      <CandidateCard candidate={candidate} />
    </div>
  );
};

const KanbanBoard = ({
  stages,
  candidates: initialCandidates,
  onMoveCandidate,
}: KanbanBoardProps) => {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    if (!over || !active) {
      setOverId(null);
      return;
    }

    // Check if dropped on a stage directly
    const isStage = stages.some((stage) => stage.id === over.id);
    if (isStage) {
      setOverId(over.id as string);
      return;
    }

    // If dropped on a candidate, find which stage it belongs to
    const targetCandidate = candidates.find((c) => c.id === over.id);
    if (targetCandidate) {
      setOverId(targetCandidate.status);
    } else {
      // Try to find the stage by checking the data attribute or parent element
      const overData = over.data.current;
      if (overData?.type === 'stage' || overData?.stageId) {
        setOverId(overData.stageId || (over.id as string));
      } else {
        setOverId(null);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const candidateId = active.id as string;
    let newStageId: string;

    // Check if dropped on a stage directly
    const isStage = stages.some((stage) => stage.id === over.id);

    if (isStage) {
      newStageId = over.id as string;
    } else {
      // Dropped on another candidate or empty space in a column - get the stage of that candidate
      const targetCandidate = candidates.find((c) => c.id === over.id);
      if (!targetCandidate) {
        // If we can't find the candidate, try to find the stage by checking which column the over element belongs to
        // This handles cases where we drop on empty space in a column
        const stageId = stages.find((stage) => {
          const stageCandidates = candidates.filter(
            (c) => c.status === stage.id,
          );
          // If the over id matches any candidate in this stage, or if we're in the column area
          return stageCandidates.some((c) => c.id === over.id);
        })?.id;

        if (stageId) {
          newStageId = stageId;
        } else {
          return; // Can't determine the target stage
        }
      } else {
        newStageId = targetCandidate.status;
      }
    }

    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate || candidate.status === newStageId) return;

    // Update local state
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, status: newStageId } : c,
      ),
    );

    // Call API (console.log for now)
    console.log('Moving candidate:', {
      candidateId,
      candidateName: candidate.name,
      fromStage: candidate.status,
      toStage: newStageId,
    });

    // Call the callback if provided
    onMoveCandidate?.(candidateId, newStageId);
  };

  const getCandidatesByStage = (stageId: string) => {
    return candidates.filter((candidate) => candidate.status === stageId);
  };

  const activeCandidate = activeId
    ? candidates.find((c) => c.id === activeId)
    : null;

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={(args) => {
          // First check if pointer is within any droppable (cursor-based)
          const pointerCollisions = pointerWithin(args);
          if (pointerCollisions.length > 0) {
            return pointerCollisions;
          }
          // Fallback to rect intersection
          return rectIntersection(args);
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        autoScroll={{ threshold: { x: 0.2, y: 0.2 } }}
      >
        <div className="flex gap-4 overflow-x-auto h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] items-stretch">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              isOver={overId === stage.id}
              candidates={getCandidatesByStage(stage.id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCandidate ? (
            <div className="opacity-90">
              <CandidateCard candidate={activeCandidate} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export { KanbanBoard };
