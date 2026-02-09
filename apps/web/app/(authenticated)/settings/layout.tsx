import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { SettingsSidebar } from './_components/settings-sidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col gap-6 p-6 md:p-10">
        {/* 1. The Header Section (Matches Figma Top Bar) */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your dashboard here</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search what you need"
              className="w-full bg-background pl-8 shadow-sm"
            />
          </div>
        </div>

        {/* 2. The Main Layout (Sidebar Left + Content Right) */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Settings Sidebar (Fixed width on desktop) */}
          <aside className="lg:w-64 shrink-0">
            <SettingsSidebar />
          </aside>

          {/* Main Content Area (White Card) */}
          <main className="flex-1">
            {/* We wrap children in a card-like style if you want the white box effect */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="p-6">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
