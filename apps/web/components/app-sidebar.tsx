'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Briefcase,
  Contact,
  Settings as SettingsIcon,
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

interface SubNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  disabled?: boolean;
  children?: SubNavItem[];
}

// Navigation items for ORG_ADMIN and EMPLOYEE roles
const orgNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Recruitment',
    url: '/recruitment',
    icon: UserPlus,
    children: [
      { title: 'Jobs', url: '/recruitment/jobs', icon: Briefcase },
      { title: 'Candidates', url: '/recruitment/candidates', icon: Contact },
      { title: 'Settings', url: '/recruitment/settings', icon: SettingsIcon },
    ],
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
    disabled: true,
  },
];

const orgSecondaryNavItems: NavItem[] = [
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

const superAdminSecondaryNavItems: NavItem[] = [
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { user } = useUser({ redirectOnUnauthenticated: false });
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    () => {
      // Auto-expand if current path matches a child
      const initial: Record<string, boolean> = {};
      if (pathname.startsWith('/recruitment')) initial['Recruitment'] = true;
      return initial;
    },
  );

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const mainNavItems = isSuperAdmin ? superAdminNavItems : orgNavItems;
  const secondaryNavItems = isSuperAdmin
    ? superAdminSecondaryNavItems
    : orgSecondaryNavItems;

  const isActive = (url: string) => {
    if (url === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(url);
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
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.children ? (
                    <>
                      <SidebarMenuButton
                        isActive={isActive(item.url)}
                        onClick={() => toggleExpand(item.title)}
                        className={cn(
                          'h-11 cursor-pointer gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                          isActive(item.url)
                            ? 'bg-primary-100 text-gray-900 hover:bg-primary-200'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                        )}
                      >
                        <item.icon className="h-5 w-5 text-gray-500" />
                        <span>{item.title}</span>
                        <ChevronDown
                          className={cn(
                            'ml-auto h-4 w-4 text-gray-400 transition-transform',
                            expandedItems[item.title] && 'rotate-180',
                          )}
                        />
                      </SidebarMenuButton>
                      {expandedItems[item.title] && (
                        <SidebarMenu className="ml-4 mt-1 border-l border-gray-200 pl-3">
                          {item.children.map((child) => (
                            <SidebarMenuItem key={child.title}>
                              <SidebarMenuButton
                                asChild
                                isActive={
                                  pathname === child.url ||
                                  pathname.startsWith(child.url + '/')
                                }
                                className={cn(
                                  'h-9 cursor-pointer gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors',
                                  pathname === child.url ||
                                    pathname.startsWith(child.url + '/')
                                    ? 'bg-primary-100 text-gray-900 hover:bg-primary-200'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                )}
                              >
                                <Link href={child.url}>
                                  <child.icon className="h-4 w-4 text-gray-500" />
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton
                      asChild={!item.disabled}
                      isActive={isActive(item.url)}
                      disabled={item.disabled}
                      className={cn(
                        'h-11 gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                        item.disabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer',
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
                      ) : (
                        <Link href={item.url}>
                          <item.icon className="h-5 w-5 text-gray-500" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
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
                      'h-11 cursor-pointer gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
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
              className="h-11 cursor-pointer gap-3 rounded-lg px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
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
