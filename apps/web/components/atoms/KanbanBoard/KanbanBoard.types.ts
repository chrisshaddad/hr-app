// Legacy types (kept for backwards compatibility if needed)
export type KanbanCard = {
  id: string;
  columnId: string;
  name: string;
  email: string;
  phone?: string | null;
  appliedAt: string;
};

export type KanbanColumnLegacy = {
  id: string;
  title: string;
};

export type KanbanBoardPropsLegacy<T extends KanbanCard> = {
  columns: KanbanColumnLegacy[];
  cards: T[];
  onCardMove?: (cardId: string, newColumnId: string) => void;
  className?: string;
};

// New types for the updated KanbanBoard
export type Stage = {
  id: string;
  name: string;
};

export type KanbanBoardProps = {
  stages: Stage[];
  candidates: import('@/components/molecules/CandidateCard/CandidateCard.types').CandidateCardData[];
  onMoveCandidate?: (candidateId: string, newStageId: string) => void;
};

export type KanbanColumnProps = {
  stage: Stage;
  candidates: import('@/components/molecules/CandidateCard/CandidateCard.types').CandidateCardData[];
  isOver?: boolean;
};
