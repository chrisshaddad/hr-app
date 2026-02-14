'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Users,
  HelpCircle,
  Settings,
  LogOut,
  Building2,
  MessageSquare,
  LayoutDashboard,
  Briefcase,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarMenu,
  SidebarGroup,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/atoms/Sidebar/Sidebar';
import { useAuth, useUser } from '@/hooks/use-auth';

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  disabled?: boolean;
}

// Navigation items for ORG_ADMIN and EMPLOYEE roles
const orgNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Jobs',
    url: '/jobs',
    icon: Briefcase,
  },
  {
    title: 'Candidates',
    url: '/candidates',
    icon: Users,
  },
  {
    icon: MessageSquare,
    title: 'Messaging',
    url: '/messaging',
  },
];

// Navigation items for SUPER_ADMIN role
const superAdminNavItems: NavItem[] = [
  {
    title: 'Organizations',
    url: '/organizations',
    icon: Building2,
  },
  {
    title: 'Users',
    url: '/users',
    icon: Users,
    disabled: true, // Placeholder for future implementation
  },
];

const orgSecondaryNavItems: NavItem[] = [
  {
    title: 'Help Center',
    url: '/help',
    icon: HelpCircle,
  },
  {
    title: 'Setting',
    url: '/settings',
    icon: Settings,
  },
];

const superAdminSecondaryNavItems: NavItem[] = [
  {
    title: 'Setting',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { user } = useUser({ redirectOnUnauthenticated: false });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const mainNavItems = isSuperAdmin ? superAdminNavItems : orgNavItems;
  const secondaryNavItems = isSuperAdmin
    ? superAdminSecondaryNavItems
    : orgSecondaryNavItems;

  const isActive = (url: string) => {
    if (url === '/jobs') {
      return pathname === '/jobs' || pathname.startsWith('/jobs/');
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="px-5 py-6 bg-white">
        {/* Logo */}
        <Link href="/jobs" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-base">
            <span className="text-lg font-bold text-white">✦</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">Humanline</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-w-full bg-white">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            {isSuperAdmin ? 'Administration' : 'Main'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild={!item.disabled}
                    disabled={item.disabled}
                    isActive={isActive(item.url)}
                    className={cn(
                      'h-11 gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                      item.disabled && 'cursor-not-allowed opacity-50',
                      isActive(item.url)
                        ? 'bg-alerts-success-base! text-white! hover:bg-alerts-success-dark! data-[active=true]:bg-alerts-success-base! data-[active=true]:text-white!'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    )}
                  >
                    {item.disabled ? (
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-gray-400" />
                        <span>{item.title}</span>
                        <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      </div>
                    ) : (
                      <Link href={item.url}>
                        <item.icon
                          className={cn(
                            'h-5 w-5',
                            isActive(item.url)
                              ? 'text-white!'
                              : 'text-gray-500',
                          )}
                        />
                        <span
                          className={cn(
                            isActive(item.url) ? 'text-white!' : '',
                          )}
                        >
                          {item.title}
                        </span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              className="h-11 gap-3 rounded-lg cursor-pointer px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-5 w-5 text-gray-500" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
