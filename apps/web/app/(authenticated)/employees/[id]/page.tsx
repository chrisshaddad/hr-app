'use client';

import { useParams } from 'next/navigation';

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Employee ID</p>
        <p className="mt-1 font-mono text-gray-900">{id}</p>
      </div>
    </div>
  );
}
