'use client';

import { useEffect, useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { TopNavbar } from '@/components/top-navbar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  // ===== EDIT START: hydration gate =====
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) {
    // Keep markup stable on first paint; no Radix components yet.
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-16 border-b border-gray-200 bg-white" />
        <main className="p-6">{children}</main>
      </div>
    );
  }
  // ===== EDIT END: hydration gate =====

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNavbar />
        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
