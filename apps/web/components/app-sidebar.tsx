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
  AlertCircle,
  ChevronRight,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/ui/button';

interface SubNavItem {
  title: string;
  url: string;
}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  disabled?: boolean;
  items?: SubNavItem[];
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
    items: [
      { title: 'Manage employees', url: '/employees/manage-employees' },
      { title: 'Directory', url: '/employees/directory' },
      { title: 'Org Chart', url: '/employees/org-chart' },
    ],
  },
  {
    title: 'Checklist',
    url: '/checklist',
    icon: CheckSquare,
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

// Navigation items for ORG_ADMIN with PENDING organization
const pendingOrgNavItems: NavItem[] = [
  {
    title: 'Pending Approval',
    url: '/pending-approval',
    icon: AlertCircle,
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

  //will look into this later as im a professional zod hater and i dont want to deal with it for now
  const isPendingOrg = false;
  // user?.role === 'ORG_ADMIN' && user?.organization?.status === 'PENDING';

  const mainNavItems = isSuperAdmin
    ? superAdminNavItems
    : isPendingOrg
      ? pendingOrgNavItems
      : orgNavItems;
  const secondaryNavItems = isSuperAdmin
    ? superAdminSecondaryNavItems
    : orgSecondaryNavItems;

  const isActive = (url: string) => {
    if (url === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(url);
  };

  const isParentActive = (item: NavItem) => {
    if (item.items) {
      return item.items.some((subItem) => isActive(subItem.url));
    }
    return isActive(item.url);
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-5 py-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">✦</span>
          </div>
          <span className="text-xl font-semibold text-foreground">
            Humanline
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isSuperAdmin ? 'Administration' : 'Main'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const hasSubItems = item.items && item.items.length > 0;
                const active = isParentActive(item);

                // Simple nav item (no sub-items)
                if (!hasSubItems) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild={!item.disabled}
                        isActive={active}
                        disabled={item.disabled}
                        className={cn(
                          'h-11 gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                          item.disabled && 'cursor-not-allowed opacity-50',
                        )}
                      >
                        {item.disabled ? (
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                            <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                              Soon
                            </span>
                          </div>
                        ) : (
                          <Link href={item.url}>
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // Collapsible nav item with sub-items
                return (
                  <Collapsible key={item.title} asChild defaultOpen={active}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="h-11 gap-3 rounded-lg px-3 text-sm font-medium transition-colors [&[data-state=open]>svg:last-child]:rotate-90">
                          <item.icon
                            className={cn(
                              'h-5 w-5 transition-colors',
                              active && 'text-primary',
                            )}
                          />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(subItem.url)}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-11 gap-3 rounded-lg px-3 text-sm font-medium transition-colors"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
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
            <Button
              onClick={() => logout()}
              variant={'destructive'}
              className={cn('w-full')}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
