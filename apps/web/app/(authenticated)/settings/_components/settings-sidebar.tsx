'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Briefcase,
  Calendar,
  CreditCard,
  FileText,
  Lock,
  Bell,
  ShieldCheck,
  Users,
  Workflow,
  Menu,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const menuItems = [
  { title: 'Company Info', url: '/settings/company-info', icon: Building2 },
  { title: 'Offices', url: '/settings/offices', icon: Briefcase },
  { title: 'Department', url: '/settings/department', icon: Users },
  { title: 'Job Titles', url: '/settings/job-titles', icon: FileText },
  { title: 'Work Schedule', url: '/settings/work-schedule', icon: Calendar },
  { title: 'Permission', url: '/settings/permission', icon: ShieldCheck },
  { title: 'Integration', url: '/settings/integration', icon: Workflow },
  { title: 'Subscription', url: '/settings/subscription', icon: CreditCard },
  { title: 'Password', url: '/settings/password', icon: Lock },
  { title: 'Notification', url: '/settings/notification', icon: Bell },
];

export function SettingsSidebar({ mobileOnly }: { mobileOnly?: boolean }) {
  const pathname = usePathname();

  const NavContent = () => (
    <nav className="flex flex-col gap-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.url;
        return (
          <Link
            key={item.title}
            href={item.url}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
                : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
            )}
          >
            <item.icon
              className={cn(
                'h-4 w-4',
                isActive ? 'text-sidebar-primary' : 'text-muted-foreground',
              )}
            />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );

  // Mobile-only mode: just return the trigger button
  if (mobileOnly) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px]">
          <SheetHeader className="pb-4 text-left">
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <NavContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop mode: just return the nav content
  return <NavContent />;
}
