'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  CalendarOff,
  Clock,
  DollarSign,
  TrendingUp,
  UserPlus,
  HelpCircle,
  Settings,
  LogOut,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useAuth, useUser } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useState, useEffect, useCallback } from 'react';

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  disabled?: boolean;
  children?: Omit<NavItem, 'children'>[];
}

// Navigation items for ORG_ADMIN and EMPLOYEE roles
const orgNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Employees',
    url: '/employees',
    icon: Users,
  },
  {
    title: 'Checklist',
    url: '/checklist',
    icon: CheckSquare,
    children: [
      {
        title: 'To-Dos',
        url: '/checklist/todos',
        icon: CheckSquare,
      },
      {
        title: 'Onboarding',
        url: '/checklist/onboarding',
        icon: CheckSquare,
      },
      {
        title: 'Offboarding',
        url: '/checklist/offboarding',
        icon: CheckSquare,
      },
      {
        title: 'Setting',
        url: '/checklist/settings',
        icon: CheckSquare,
      },
    ],
  },
  {
    title: 'Time Off',
    url: '/time-off',
    icon: CalendarOff,
  },
  {
    title: 'Attendance',
    url: '/attendance',
    icon: Clock,
  },
  {
    title: 'Payroll',
    url: '/payroll',
    icon: DollarSign,
  },
  {
    title: 'Performance',
    url: '/performance',
    icon: TrendingUp,
  },
  {
    title: 'Recruitment',
    url: '/recruitment',
    icon: UserPlus,
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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const mainNavItems = isSuperAdmin ? superAdminNavItems : orgNavItems;
  const secondaryNavItems = isSuperAdmin
    ? superAdminSecondaryNavItems
    : orgSecondaryNavItems;

  const isActive = useCallback(
    (url: string) => {
      if (url === '/dashboard') {
        return pathname === '/dashboard';
      }
      return pathname.startsWith(url);
    },
    [pathname],
  );

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const isExpanded = (title: string) => expandedItems.has(title);
  useEffect(() => {
    mainNavItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) =>
          isActive(child.url),
        );
        if (hasActiveChild === true) {
          setExpandedItems((prev) => new Set(prev).add(item.title));
        }
      }
    });
  }, [isActive, mainNavItems, pathname]);

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="px-5 py-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-base">
            <span className="text-lg font-bold text-white">✦</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">Humanline</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            {isSuperAdmin ? 'Administration' : 'Main'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <div key={item.title}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild={!item.disabled && !item.children}
                      isActive={isActive(item.url)}
                      disabled={item.disabled}
                      onClick={
                        item.children
                          ? () => toggleExpanded(item.title)
                          : undefined
                      }
                      className={cn(
                        'h-11 gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                        item.disabled && 'cursor-not-allowed opacity-50',
                        isActive(item.url)
                          ? 'bg-primary-100 text-gray-900 hover:bg-primary-200'
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
                      ) : item.children ? (
                        <div className="flex w-full items-center gap-3">
                          <item.icon className="h-5 w-5 text-gray-500" />
                          <span className="flex-1">{item.title}</span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 text-gray-500 transition-transform',
                              isExpanded(item.title) && 'rotate-180',
                            )}
                          />
                        </div>
                      ) : (
                        <Link href={item.url}>
                          <item.icon className="h-5 w-5 text-gray-500" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Sub-items */}
                  {item.children && isExpanded(item.title) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <SidebarMenuItem key={child.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(child.url)}
                            className={cn(
                              'h-9 gap-3 rounded-lg px-3 text-sm font-normal transition-colors',
                              isActive(child.url)
                                ? 'bg-primary-50 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                            )}
                          >
                            <Link href={child.url}>
                              <span>{child.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={cn(
                      'h-11 gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                      isActive(item.url)
                        ? 'bg-primary-100 text-gray-900 hover:bg-primary-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5 text-gray-500" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              className="h-11 gap-3 rounded-lg px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
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
