'use client';

import { useUsers } from '@/hooks/use-users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, Shield, CheckCircle2, Circle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmployeesPage() {
  const { users, isLoading, error } = useUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your organization&apos;s workforce
        </p>
      </div>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5 text-gray-500" />
            Employee Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              Failed to load employees. Please try again.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-900">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Role
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Joined
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-gray-200">
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-40" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : users?.users && users.users.length > 0 ? (
                    users.users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        <TableCell className="font-medium text-gray-900">
                          {user.name}
                        </TableCell>
                        <TableCell className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.role === 'ORG_ADMIN' && (
                              <Shield className="h-4 w-4 text-blue-600" />
                            )}
                            <span className="text-sm text-gray-700">
                              {user.role === 'ORG_ADMIN'
                                ? 'Admin'
                                : user.role === 'SUPER_ADMIN'
                                  ? 'Super Admin'
                                  : 'Employee'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.isConfirmed ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-700">
                                  Active
                                </span>
                              </>
                            ) : (
                              <>
                                <Circle className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm text-yellow-700">
                                  Pending
                                </span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">No employees found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {users && (
            <div className="mt-4 text-sm text-gray-500">
              Showing {users.users.length} of {users.total} employees
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
