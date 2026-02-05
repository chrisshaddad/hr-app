'use client';

import { TopNavbar } from '@/components/atoms/TopNavbar/TopNavbar';
import { AppSidebar } from '@/components/atoms/Sidebar/AppSidebar';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/atoms/Sidebar/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-screen flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
