'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SettingsHeader() {
  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-6 md:px-8">
        {/* Left side - Title and description */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your dashboard here
          </p>
        </div>

        {/* Right side - Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search what you need"
            className="pl-9 pr-4"
          />
        </div>
      </div>
    </div>
  );
}
