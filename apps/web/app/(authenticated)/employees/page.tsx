'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useEmployees } from '@/hooks/use-employees';
import { useRouter } from 'next/navigation';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from '@/components/ui/table';
import { useMemo, useState } from 'react';
export default function EmployeesPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { employees, total, isLoading, error } = useEmployees(page, limit);

  const totalPages = useMemo(() => {
    if (!total) return 1;
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  const from = total ? (page - 1) * limit + 1 : 0;
  const to = total ? Math.min(page * limit, total) : 0;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your employees</p>
      </div>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5 text-gray-500" />
            Employee Directory
          </CardTitle>

          {/* Pagination controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => canPrev && setPage((p) => p - 1)}
              disabled={!canPrev}
              className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm text-gray-600">
              Page <span className="font-medium text-gray-900">{page}</span> of{' '}
              <span className="font-medium text-gray-900">{totalPages}</span>
            </span>

            <button
              type="button"
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
              className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </CardHeader>

        <CardContent className="min-h-75">
          {/* Showing X-Y of total */}
          <div className="mb-3 text-sm text-gray-600">
            {total ? (
              <>
                Showing{' '}
                <span className="font-medium text-gray-900">{from}</span>–
                <span className="font-medium text-gray-900">{to}</span> of{' '}
                <span className="font-medium text-gray-900">{total}</span>
              </>
            ) : (
              '—'
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="text-gray-500">
                  Loading
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-10 text-center text-red-500">
              Failed to load employees
            </div>
          ) : !employees?.length ? (
            <div className="py-10 text-center text-gray-500">
              No employees found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Confirmed</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {employees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/employees/${employee.id}`)}
                  >
                    <TableCell
                      className="max-w-[140px] truncate"
                      title={employee.id}
                    >
                      {employee.id.slice(0, 8)}...
                    </TableCell>

                    <TableCell className="font-medium text-gray-900">
                      {employee.name}
                    </TableCell>

                    <TableCell className="text-gray-600">
                      {employee.email}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          employee.isConfirmed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {employee.isConfirmed ? 'Yes' : 'No'}
                      </span>
                    </TableCell>

                    <TableCell>{employee.role}</TableCell>

                    <TableCell>{employee.department?.name || '—'}</TableCell>

                    <TableCell>
                      {employee.createdAt
                        ? new Date(employee.createdAt)
                            .toISOString()
                            .slice(0, 10)
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
