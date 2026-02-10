import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SettingsSidebar } from './_components/settings-sidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organization settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search what you need"
              className="w-full bg-background pl-8 shadow-sm"
            />
          </div>
          {/* Mobile menu button in header */}
          <div className="lg:hidden">
            <SettingsSidebar mobileOnly />
          </div>
        </div>
      </div>

      {/* Main Layout (Sidebar + Content) */}
      <div className="flex gap-6">
        {/* Settings Sidebar - Desktop only */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <SettingsSidebar />
        </aside>

        {/* Main Content Area */}
        <main className="w-full lg:flex-1">
          <Card>{children}</Card>
        </main>
      </div>
    </div>
  );
}
