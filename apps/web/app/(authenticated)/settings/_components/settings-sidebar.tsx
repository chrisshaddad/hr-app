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
import { useIsMobile } from '@/hooks/use-mobile';

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

export function SettingsSidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

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
                ? 'bg-white text-green-600 shadow-sm dark:bg-popover dark:text-green-400'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            <item.icon
              className={cn(
                'h-4 w-4',
                isActive ? 'text-green-600' : 'text-muted-foreground',
              )}
            />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between md:hidden"
          >
            <span className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              Settings Menu
            </span>
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

  return <NavContent />;
}
