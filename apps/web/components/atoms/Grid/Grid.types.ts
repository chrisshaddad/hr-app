import { type ColumnDef } from '@tanstack/react-table';

export type GridProps<T extends Record<string, any>> = {
  data: T[];
  pageSize?: number;
  className?: string;
  rowHeight?: string;
  columns: ColumnDef<T>[];
};
