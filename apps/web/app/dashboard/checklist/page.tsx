import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

export default function ChecklistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Checklist</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track onboarding and offboarding tasks
        </p>
      </div>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <CheckSquare className="h-5 w-5 text-gray-500" />
            Task Management
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-75 flex-col items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <CheckSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
            <p className="mt-1 text-sm text-gray-500">
              Checklist features are being developed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
