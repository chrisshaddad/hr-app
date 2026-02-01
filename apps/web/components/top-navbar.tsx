'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  FileText,
  Newspaper,
  Receipt,
  BarChart3,
  Mail,
  MessageSquare,
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
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';

// Menu items only shown to non-super-admin users
const orgMenuItems = [
  { title: 'Documents', icon: FileText, url: '/dashboard/documents' },
  { title: 'News', icon: Newspaper, url: '/dashboard/news' },
  { title: 'Payslip', icon: Receipt, url: '/dashboard/payslip' },
  { title: 'Report', icon: BarChart3, url: '/dashboard/report' },
];

export function TopNavbar() {
  const { user } = useUser({ redirectOnUnauthenticated: false });
  const { logout } = useAuth();
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

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Left Section - Sidebar Toggle & Search */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1 h-9 w-9 text-gray-500 hover:bg-gray-100 hover:text-gray-900" />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder={isSuperAdmin ? 'Search organizations...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-64 rounded-lg border-gray-200 bg-gray-50 pl-10 text-sm placeholder:text-gray-400 focus-visible:border-primary-base focus-visible:ring-primary-base/20"
          />
        </div>
      </div>

      {/* Center Section - Menu Items (hidden for super admins) */}
      {!isSuperAdmin && (
        <nav className="hidden items-center gap-1 md:flex">
          {orgMenuItems.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      )}

      {/* Right Section - Notifications & User */}
      <div className="flex items-center gap-3">
        {/* Mail Notification (hidden for super admins) */}
        {!isSuperAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <Mail className="h-5 w-5" />
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-base opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-base" />
            </span>
          </Button>
        )}

        {/* Message Notification (hidden for super admins) */}
        {!isSuperAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          </Button>
        )}

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-10 items-center gap-2 rounded-lg px-2 hover:bg-gray-100"
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
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
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
