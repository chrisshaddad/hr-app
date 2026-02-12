'use client';

import { useState } from 'react';
import { useUser } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  User as UserIcon,
  Bell,
  Shield,
  Mail,
  BellRing,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'account';

const TABS = [
  { id: 'profile' as const, label: 'Profile', icon: UserIcon },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  { id: 'account' as const, label: 'Account', icon: Shield },
];

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
          checked ? 'bg-primary-base' : 'bg-gray-200',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}

function ProfileTab() {
  const { user } = useUser({ redirectOnUnauthenticated: false });

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

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary-base text-lg font-semibold text-white">
            {getInitials(user.name, user.email)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {user.name || user.email?.split('@')[0]}
          </p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="mt-0.5 text-xs capitalize text-gray-400">
            {user.role.toLowerCase().replace('_', ' ')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Full Name</Label>
          <Input
            value={user.name || ''}
            disabled
            className="bg-gray-50 text-gray-600"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Email</Label>
          <Input
            value={user.email}
            disabled
            className="bg-gray-50 text-gray-600"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Role</Label>
          <Input
            value={user.role.toLowerCase().replace('_', ' ')}
            disabled
            className="bg-gray-50 capitalize text-gray-600"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Organization
          </Label>
          <Input
            value={user.organizationId ? 'Connected' : 'Not assigned'}
            disabled
            className="bg-gray-50 text-gray-600"
          />
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-xs text-blue-700">
          Profile editing will be available soon. Contact your admin to update
          your information.
        </p>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [candidateUpdates, setCandidateUpdates] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900">
          Email Notifications
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Choose which email notifications you want to receive.
        </p>
      </div>

      <div className="space-y-2">
        <ToggleSwitch
          checked={emailNotifs}
          onChange={setEmailNotifs}
          label="Email Notifications"
          description="Receive notifications via email"
        />
        <ToggleSwitch
          checked={jobAlerts}
          onChange={setJobAlerts}
          label="Job Status Alerts"
          description="Get notified when a job status changes"
        />
        <ToggleSwitch
          checked={candidateUpdates}
          onChange={setCandidateUpdates}
          label="Candidate Updates"
          description="Notifications when candidates apply or move stages"
        />
        <ToggleSwitch
          checked={interviewReminders}
          onChange={setInterviewReminders}
          label="Interview Reminders"
          description="Reminders before scheduled interviews"
        />
        <ToggleSwitch
          checked={weeklyDigest}
          onChange={setWeeklyDigest}
          label="Weekly Digest"
          description="Receive a weekly summary of recruitment activity"
        />
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
        <p className="text-xs text-green-700">
          Notification delivery is powered by BullMQ background jobs for
          reliable, async processing.
        </p>
      </div>
    </div>
  );
}

function AccountTab() {
  const { user } = useUser({ redirectOnUnauthenticated: false });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900">
          Account Security
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account security settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Magic Link Login
              </p>
              <p className="text-xs text-gray-500">
                Sign in via email magic link
              </p>
            </div>
          </div>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Active
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <BellRing className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Login Notifications
              </p>
              <p className="text-xs text-gray-500">
                Get notified of new sign-ins
              </p>
            </div>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            Coming Soon
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <MessageSquare className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Active Sessions
              </p>
              <p className="text-xs text-gray-500">
                Manage your active sessions
              </p>
            </div>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            Coming Soon
          </span>
        </div>
      </div>

      {user && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
          <p className="text-xs text-gray-500">
            Signed in as{' '}
            <span className="font-medium text-gray-700">{user.email}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { isLoading } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account and preferences
        </p>
      </div>

      {/* Mobile tab selector */}
      <div className="flex gap-2 overflow-x-auto md:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-gray-900 text-white'
                : 'border border-gray-200 bg-white text-gray-600',
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left Sidebar — hidden on mobile */}
        <div className="hidden w-56 shrink-0 space-y-1 rounded-xl border border-gray-200 bg-white p-3 md:block">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'account' && <AccountTab />}
        </div>
      </div>
    </div>
  );
}
