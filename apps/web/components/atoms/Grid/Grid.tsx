'use client';

import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { GridProps } from './Grid.types';

const Grid = <T extends Record<string, any>>({
  data,
  columns,
  className,
  pageSize = 10,
  rowHeight = '64px',
}: GridProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  return (
    <div
      className={cn(
        'bg-Others-White rounded-[16px] overflow-hidden h-full flex flex-col',
        className,
      )}
    >
      <div className="overflow-x-auto flex-1 flex flex-col min-h-0">
        <div className="shrink-0">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-GreyScale-100 h-14 border-GreyScale-300"
                >
                  {headerGroup.headers.map((header, index) => {
                    const isFirst = index === 0;
                    const isLast = index === headerGroup.headers.length - 1;
                    return (
                      <th
                        key={header.id}
                        className={cn(
                          'p-4 text-left text-xs font-bold text-GreyScale-600',
                          isFirst && 'rounded-tl-[16px]',
                          isLast && 'rounded-tr-[16px]',
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
          </table>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full">
            <colgroup>
              {table.getHeaderGroups()[0]?.headers.map((header) => (
                <col key={header.id} style={{ width: header.getSize() }} />
              ))}
            </colgroup>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-GreyScale-300 hover:bg-GreyScale-50"
                  style={{ height: rowHeight }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-5">
                      {flexRender(
                        cell.column.columnDef.cell ||
                          ((info) => (
                            <span className="text-GreyScale-900 text-xs font-medium">
                              {info.getValue() as string}
                            </span>
                          )),
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-4 border-t border-GreyScale-300">
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-md border border-GreyScale-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-GreyScale-100"
          >
            <ChevronUp className="h-4 w-4 -rotate-90" />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => table.setPageIndex(page - 1)}
                  className={cn(
                    'px-3 py-1 rounded-md text-sm font-medium',
                    table.getState().pagination.pageIndex + 1 === page
                      ? 'bg-GreyScale-900 text-Others-White'
                      : 'text-GreyScale-600 hover:bg-GreyScale-100',
                  )}
                >
                  {page}
                </button>
              ),
            )}
          </div>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-md border border-GreyScale-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-GreyScale-100"
          >
            <ChevronUp className="h-4 w-4 rotate-90" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-GreyScale-600">Show</span>
          <button className="px-3 py-1 rounded-md border border-GreyScale-300 text-sm text-GreyScale-900 hover:bg-GreyScale-100">
            {pageSize}
            <ChevronDown className="h-4 w-4 inline-block ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export { Grid };
