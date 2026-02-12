'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  CalendarClock,
  Plus,
  Briefcase,
  Users,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth, useUser } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

// Quick navigation links for the Talent Pool module
const quickNavItems = [
  { title: 'Jobs', icon: Briefcase, url: '/recruitment/jobs' },
  { title: 'Candidates', icon: Users, url: '/recruitment/candidates' },
  { title: 'Interviews', icon: CalendarClock, url: '/recruitment/candidates' },
];

export function TopNavbar() {
  const { user } = useUser({ redirectOnUnauthenticated: false });
  const { logout } = useAuth();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      const parts = name.split(' ').filter(Boolean);
      if (parts.length >= 2 && parts[0] && parts[1]) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    return email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const isNavActive = (url: string) => pathname.startsWith(url);

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Left Section - Sidebar Toggle & Search */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 h-9 w-9 cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-900" />

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder={
              isSuperAdmin
                ? 'Search organizations...'
                : 'Search jobs, candidates...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-52 rounded-lg border-gray-200 bg-gray-50 pl-9 text-sm placeholder:text-gray-400 focus-visible:border-primary-base focus-visible:ring-primary-base/20 lg:w-64"
          />
        </div>
      </div>

      {/* Center Section - Quick Nav (Talent Pool shortcuts) */}
      {!isSuperAdmin && (
        <nav className="hidden items-center gap-1 md:flex">
          {quickNavItems.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isNavActive(item.url)
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      )}

      {/* Right Section - Actions & User */}
      <div className="flex items-center gap-2">
        {/* Quick Add (hidden for super admins) */}
        {!isSuperAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs font-medium text-gray-400">
                Quick Create
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href="/recruitment/jobs"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>New Job</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/recruitment/candidates"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Add Candidate</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Notifications */}
        {!isSuperAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-base opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-base" />
            </span>
          </Button>
        )}

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-9 cursor-pointer items-center gap-2 rounded-lg px-2 hover:bg-gray-100"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={undefined} />
                <AvatarFallback className="bg-primary-base text-sm font-medium text-white">
                  {getInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-gray-900">
                  {getDisplayName()}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="pb-0">
              <p className="text-sm font-medium text-gray-900">
                {getDisplayName()}
              </p>
              <p className="text-xs font-normal text-gray-500">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="flex cursor-pointer items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="flex cursor-pointer items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
