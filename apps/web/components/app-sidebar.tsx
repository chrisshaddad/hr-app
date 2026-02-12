'use client';

import { useState } from 'react';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';

interface NavItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  disabled?: boolean;
  children?: NavItem[];
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
    url: '',
    icon: Users,
    children: [
      {
        title: 'Manage Employees',
        url: '/employees',
        icon: Users,
      },
      {
        title: 'Directory',
        url: '/employees/directory',
        icon: Users,
      },
      {
        title: 'ORG Chart',
        url: '/employees/org-chart',
        icon: Users,
      },
    ],
  },
  {
    title: 'Checklist',
    url: '/checklist',
    icon: CheckSquare,
  },
  {
    title: 'Time Off',
    url: '',
    icon: CalendarOff,
    children: [
      {
        title: 'My Time Off',
        url: '/time-off',
        icon: CalendarOff,
      },
      {
        title: 'Team Time Off',
        url: '/time-off/team',
        icon: CalendarOff,
      },
      {
        title: 'Employee Time Off',
        url: '/time-off/employee',
        icon: CalendarOff,
      },
    ],
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
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const mainNavItems = isSuperAdmin ? superAdminNavItems : orgNavItems;
  const secondaryNavItems = isSuperAdmin
    ? superAdminSecondaryNavItems
    : orgSecondaryNavItems;

  const isActive = (url?: string) => {
    if (!url) return false;
    if (url === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(url);
  };

  const toggleOpen = (itemTitle: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemTitle)) {
      newOpenItems.delete(itemTitle);
    } else {
      newOpenItems.add(itemTitle);
    }
    setOpenItems(newOpenItems);
  };

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
              {mainNavItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const itemIsActive = isActive(item.url);
                const childIsActive = hasChildren
                  ? item.children?.some((child) => isActive(child.url))
                  : false;
                const isItemActive = itemIsActive || childIsActive;
                const isOpen = openItems.has(item.title);

                return hasChildren ? (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => toggleOpen(item.title)}
                      isActive={isItemActive}
                      disabled={item.disabled}
                      className={cn(
                        'h-11 gap-3 rounded-lg px-3 text-sm font-medium transition-colors cursor-pointer',
                        item.disabled && 'cursor-not-allowed opacity-50',
                        isItemActive
                          ? 'bg-primary-100 text-gray-900 hover:bg-primary-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                      )}
                    >
                      <item.icon className="h-5 w-5 text-gray-500" />
                      <span>{item.title}</span>
                      <ChevronRight
                        className={cn(
                          'ml-auto h-4 w-4 transition-transform',
                          isOpen && 'rotate-90',
                        )}
                      />
                    </SidebarMenuButton>
                    {isOpen && (
                      <SidebarMenuSub>
                        {item.children?.map((child) => (
                          <SidebarMenuSubItem key={child.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive(child.url)}
                              className={cn(
                                'h-10 gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                                isActive(child.url)
                                  ? 'bg-primary-100 text-gray-900 hover:bg-primary-200'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                              )}
                            >
                              <Link href={child.url || '#'}>{child.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild={!item.disabled}
                      isActive={isItemActive}
                      disabled={item.disabled}
                      className={cn(
                        'h-11 gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                        item.disabled && 'cursor-not-allowed opacity-50',
                        isItemActive
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
                      ) : (
                        <Link href={item.url!}>
                          <item.icon className="h-5 w-5 text-gray-500" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
