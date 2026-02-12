'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEmployees } from '@/hooks/use-employees';
import { useBranchesAndJobTitles } from '@/hooks/use-branches-and-job-titles';
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
  Plus,
  X,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { EmployeeStatus, EmployeeListItem } from '@repo/contracts';

const statusColors: Record<EmployeeStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  ON_BOARDING: 'bg-blue-100 text-blue-800',
  OFF_BOARDING: 'bg-orange-100 text-orange-800',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800',
  PROBATION: 'bg-purple-100 text-purple-800',
};

const statusLabels: Record<EmployeeStatus, string> = {
  ACTIVE: 'Active',
  ON_BOARDING: 'Onboarding',
  OFF_BOARDING: 'Offboarding',
  ON_LEAVE: 'On Leave',
  PROBATION: 'Probation',
};

const allStatuses: EmployeeStatus[] = [
  'ACTIVE',
  'ON_BOARDING',
  'OFF_BOARDING',
  'ON_LEAVE',
  'PROBATION',
];

type ActiveFilter =
  | { key: 'search'; label: string }
  | { key: 'office'; label: string; value: string }
  | { key: 'jobTitle'; label: string; value: string }
  | { key: 'status'; label: string; value: EmployeeStatus };

function EmployeeRow(props: {
  employee: EmployeeListItem;
  isSelected: boolean;
  onSelect: (employeeId: string) => void;
}) {
  const { employee, isSelected, onSelect } = props;
  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(employee.id)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-purple-100 shrink-0">
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {employee.personalInfo?.firstName?.[0]}
              {employee.personalInfo?.lastName?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">
              {employee.personalInfo?.firstName}{' '}
              {employee.personalInfo?.lastName}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {employee.personalInfo?.email}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-gray-900 text-xs sm:text-sm hidden sm:table-cell">
        {employee.jobTitle}
      </TableCell>
      <TableCell className="text-gray-900 text-xs sm:text-sm hidden md:table-cell">
        {employee.lineManager?.personalInfo ? (
          <span className="text-gray-700">
            @{employee.lineManager.personalInfo.firstName}
            {employee.lineManager.personalInfo.lastName}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </TableCell>
      <TableCell className="text-gray-900 text-xs sm:text-sm hidden lg:table-cell">
        {employee.department?.name ?? <span className="text-gray-400">—</span>}
      </TableCell>
      <TableCell className="text-gray-900 text-xs sm:text-sm hidden lg:table-cell">
        {employee.branch?.name ?? <span className="text-gray-400">—</span>}
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={`${statusColors[employee.status]} text-xs`}
        >
          {statusLabels[employee.status]}
        </Badge>
      </TableCell>
      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
        <span className={employee.userId ? 'text-gray-900' : 'text-gray-400'}>
          {employee.userId ? 'Activated' : 'Not Activated'}
        </span>
      </TableCell>
    </TableRow>
  );
}

function PaginationSection(props: {
  currentPage: number;
  pageSize: number;
  total: number | undefined;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const {
    currentPage,
    pageSize,
    total,
    totalPages,
    onPageChange,
    onPageSizeChange,
  } = props;
  return (
    <div className="mt-6 flex flex-col gap-3 sm:gap-4">
      <div className="text-xs sm:text-sm text-gray-500">
        Showing {(currentPage - 1) * pageSize + 1} to{' '}
        {Math.min(currentPage * pageSize, total || 0)} of {total} entries
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600">Show</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-16 sm:w-20 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {Array.from(
            { length: Math.min(totalPages <= 5 ? totalPages : 3, totalPages) },
            (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(i + 1)}
                className="shrink-0 text-xs sm:text-sm"
              >
                {i + 1}
              </Button>
            ),
          )}
          {totalPages > 5 && (
            <>
              <span className="text-gray-500 mx-1">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className="shrink-0 text-xs sm:text-sm"
              >
                {totalPages}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="shrink-0"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-75 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  );
}

function ErrorState(props: { error: Error | undefined; onRetry: () => void }) {
  const { error, onRetry } = props;
  return (
    <div className="flex min-h-75 flex-col items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          Failed to load employees
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {error?.message || 'An error occurred while fetching employees'}
        </p>
        <Button onClick={onRetry} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    </div>
  );
}

function EmptyState(props: { searchQuery: string }) {
  const { searchQuery } = props;
  return (
    <div className="flex min-h-75 flex-col items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          No employees found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery
            ? 'Try adjusting your search criteria'
            : 'Get started by inviting your first employee'}
        </p>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<EmployeeStatus[]>(
    [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const { employees, total, isLoading, isValidating, error, mutate } =
    useEmployees({
      search: searchQuery,
      statuses: selectedStatuses.length ? selectedStatuses : undefined,
      branchIds: selectedOffices.length ? selectedOffices : undefined,
      jobTitles: selectedJobTitles.length ? selectedJobTitles : undefined,
      page: currentPage,
      limit: pageSize,
    });

  const { branches, jobTitles } = useBranchesAndJobTitles();

  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  useEffect(() => {
    const debounceMs = 400;
    const timer = setTimeout(() => {
      setSearchQuery(search.trim());
      setCurrentPage(1);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSelectAll = (checked: boolean) => {
    if (checked && employees) {
      setSelectedRows(new Set(employees.map((emp) => emp.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (employeeId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedRows(newSelected);
  };

  const handleToggleStatus = (status: EmployeeStatus) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((item) => item !== status);
      }
      return [...prev, status];
    });
    setCurrentPage(1);
  };

  const handleSelectAllStatuses = () => {
    setSelectedStatuses([]);
    setCurrentPage(1);
  };

  const handleToggleOffice = (officeId: string) => {
    setSelectedOffices((prev) => {
      if (prev.includes(officeId)) {
        return prev.filter((item) => item !== officeId);
      }
      return [...prev, officeId];
    });
    setCurrentPage(1);
  };

  const handleSelectAllOffices = () => {
    setSelectedOffices([]);
    setCurrentPage(1);
  };

  const handleToggleJobTitle = (title: string) => {
    setSelectedJobTitles((prev) => {
      if (prev.includes(title)) {
        return prev.filter((item) => item !== title);
      }
      return [...prev, title];
    });
    setCurrentPage(1);
  };

  const handleSelectAllJobTitles = () => {
    setSelectedJobTitles([]);
    setCurrentPage(1);
  };

  const statusTriggerLabel =
    selectedStatuses.length === 0 ||
    selectedStatuses.length === allStatuses.length
      ? 'All Status'
      : selectedStatuses.length <= 2
        ? selectedStatuses.map((status) => statusLabels[status]).join(', ')
        : `${selectedStatuses.length} Statuses`;

  const officeTriggerLabel =
    selectedOffices.length === 0 ||
    selectedOffices.length === (branches?.length || 0)
      ? 'All Offices'
      : selectedOffices.length <= 2
        ? selectedOffices
            .map((id) => branches?.find((b) => b.id === id)?.name || id)
            .join(', ')
        : `${selectedOffices.length} Offices`;

  const jobTitleTriggerLabel =
    selectedJobTitles.length === 0 ||
    selectedJobTitles.length === (jobTitles?.length || 0)
      ? 'All Job Titles'
      : selectedJobTitles.length <= 2
        ? selectedJobTitles.join(', ')
        : `${selectedJobTitles.length} Job Titles`;

  const handleRemoveFilter = (filter: ActiveFilter) => {
    if (filter.key === 'search') {
      setSearch('');
      setSearchQuery('');
      return;
    }

    if (filter.key === 'office') {
      setSelectedOffices((prev) =>
        prev.filter((item) => item !== filter.value),
      );
      return;
    }

    if (filter.key === 'jobTitle') {
      setSelectedJobTitles((prev) =>
        prev.filter((item) => item !== filter.value),
      );
      return;
    }

    if (filter.key === 'status') {
      setSelectedStatuses((prev) =>
        prev.filter((item) => item !== filter.value),
      );
    }
  };

  const activeFilters: ActiveFilter[] = [];

  if (searchQuery.trim().length > 0) {
    activeFilters.push({
      key: 'search',
      label: `Search: ${searchQuery.trim()}`,
    });
  }

  if (selectedOffices.length > 0) {
    selectedOffices.forEach((officeId) => {
      const branchName =
        branches?.find((b) => b.id === officeId)?.name || officeId;
      activeFilters.push({
        key: 'office',
        label: `Office: ${branchName}`,
        value: officeId,
      });
    });
  }

  if (selectedJobTitles.length > 0) {
    selectedJobTitles.forEach((title) => {
      activeFilters.push({
        key: 'jobTitle',
        label: `Job Title: ${title}`,
        value: title,
      });
    });
  }

  if (selectedStatuses.length > 0) {
    selectedStatuses.forEach((status) => {
      activeFilters.push({
        key: 'status',
        label: `Status: ${statusLabels[status]}`,
        value: status,
      });
    });
  }

  const isRefreshing = isValidating && isLoading === false;

  return (
    <Card className="relative border-gray-200 bg-white shadow-sm">
      {isRefreshing && (
        <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden rounded-t-lg bg-blue-50">
          <div className="loading-bar h-full bg-primary" />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Employees
            </h1>
            <p className="mt-1 text-sm text-gray-500">Manage your Employees</p>
          </div>
          <div className="w-full sm:w-auto">
            <Button
              variant="default"
              size="default"
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </div>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search employee"
                className="pl-10 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* offices */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-40 justify-between text-sm"
                >
                  <span className="truncate">{officeTriggerLabel}</span>
                  <span className="ml-2 text-gray-400 shrink-0">
                    <ChevronDown className="h-3 w-3" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuCheckboxItem
                  checked={selectedOffices.length === 0}
                  onCheckedChange={handleSelectAllOffices}
                >
                  All Offices
                </DropdownMenuCheckboxItem>
                {branches?.map((branch) => (
                  <DropdownMenuCheckboxItem
                    key={branch.id}
                    checked={selectedOffices.includes(branch.id)}
                    onCheckedChange={() => handleToggleOffice(branch.id)}
                  >
                    {branch.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* job titles */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-40 justify-between text-sm"
                >
                  <span className="truncate">{jobTitleTriggerLabel}</span>
                  <span className="ml-2 text-gray-400 shrink-0">
                    <ChevronDown className="h-3 w-3" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuCheckboxItem
                  checked={selectedJobTitles.length === 0}
                  onCheckedChange={handleSelectAllJobTitles}
                >
                  All Job Titles
                </DropdownMenuCheckboxItem>
                {jobTitles?.map((title) => (
                  <DropdownMenuCheckboxItem
                    key={title}
                    checked={selectedJobTitles.includes(title)}
                    onCheckedChange={() => handleToggleJobTitle(title)}
                  >
                    {title}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-40 justify-between text-sm"
                >
                  <span className="truncate">{statusTriggerLabel}</span>
                  <span className="ml-2 text-gray-400 shrink-0">
                    <ChevronDown className="h-3 w-3" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuCheckboxItem
                  checked={selectedStatuses.length === 0}
                  onCheckedChange={handleSelectAllStatuses}
                >
                  All Status
                </DropdownMenuCheckboxItem>
                {allStatuses.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => handleToggleStatus(status)}
                  >
                    {statusLabels[status]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div
          className={`flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500`}
        >
          <span className="font-medium text-gray-700">Active filters:</span>
          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <span
                  key={`${filter.key}-${filter.label}`}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 sm:px-3 text-xs text-gray-700"
                >
                  <span className="truncate max-w-30 sm:max-w-none">
                    {filter.label}
                  </span>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-700 shrink-0"
                    onClick={() => handleRemoveFilter(filter)}
                    aria-label={`Remove ${filter.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">None</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={() => mutate()} />
        ) : employees && employees.length > 0 ? (
          <>
            <div className="rounded-lg border border-gray-200 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          employees.length > 0 &&
                          selectedRows.size === employees.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs sm:text-sm">
                      Employee Name
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs sm:text-sm hidden sm:table-cell">
                      Job Title
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs sm:text-sm hidden md:table-cell">
                      Line Manager
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs sm:text-sm hidden lg:table-cell">
                      Department
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs sm:text-sm hidden lg:table-cell">
                      Office
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs sm:text-sm">
                      Status
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs sm:text-sm hidden sm:table-cell">
                      Account
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <EmployeeRow
                      key={employee.id}
                      employee={employee}
                      isSelected={selectedRows.has(employee.id)}
                      onSelect={handleSelectRow}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            <PaginationSection
              currentPage={currentPage}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        ) : (
          <EmptyState searchQuery={searchQuery} />
        )}
      </CardContent>
    </Card>
  );
}
