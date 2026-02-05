'use client';

import {
  Mail,
  LogOut,
  Receipt,
  Settings,
  FileText,
  Newspaper,
  BarChart3,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/atoms/DropdownMenu/DropdownMenu';
import { Cta } from '@/components/atoms/Cta/Cta';
import { useAuth, useUser } from '@/hooks/use-auth';
import { SidebarTrigger } from '@/components/atoms/Sidebar/Sidebar';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/atoms/Avatar/Avatar';

// Menu items only shown to non-super-admin users
const orgMenuItems = [
  { title: 'Documents', icon: FileText, url: '/documents' },
  { title: 'News', icon: Newspaper, url: '/news' },
  { title: 'Payslip', icon: Receipt, url: '/payslip' },
  { title: 'Report', icon: BarChart3, url: '/report' },
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
          <Cta
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <Mail className="h-5 w-5" />
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-base opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-base" />
            </span>
          </Cta>
        )}

        {/* Message Notification (hidden for super admins) */}
        {!isSuperAdmin && (
          <Cta
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          </Cta>
        )}

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Cta
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
            </Cta>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
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
