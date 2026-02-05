'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutGrid,
  Users,
  Calendar,
  Film,
  Radio,
  Megaphone,
  Heart,
  MessageSquare,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronDown,
  HandHeart,
  BookOpen,
  Code,
} from 'lucide-react';
import FloatingAICommandBar from '@/components/FloatingAICommandBar';

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  useEffect(() => {
    // Protection check: If no token in localStorage, redirect back to /
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token) {
        router.push('/');
        return;
      }

      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      setLoading(false);
    }
  }, [router]);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/dashboard/bible', label: 'Bible Highlights', icon: BookOpen },
    { href: '/dashboard/people', label: 'People & Tags', icon: Users },
    { href: '/dashboard/events', label: 'Events & RSVPs', icon: Calendar },
    { href: '/dashboard/media', label: 'Media Library', icon: Film },
    { href: '/dashboard/prayer', label: 'Prayer Requests', icon: HandHeart },
    { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/dashboard/finances', label: 'Giving / Finances', icon: Heart },
    { href: '/dashboard/chat', label: 'Chat Moderation', icon: MessageSquare },
    { href: '/dashboard/developer', label: 'Developer', icon: Code },
  ];

  const displayName = user?.firstName && user?.lastName
    ? `Rev. ${user.firstName} ${user.lastName}`
    : user?.firstName
    ? `Rev. ${user.firstName}`
    : 'Rev. Thomas';

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return 'RT'; // Default for Rev. Thomas
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Dark Navy/Black */}
      <aside className="w-[260px] bg-[#0f172a] text-white flex flex-col fixed h-screen">
        {/* User Profile Section - Top */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {getInitials()}
              </div>
            )}
          </div>
          <h3 className="font-semibold text-white text-sm">{displayName}</h3>
          <p className="text-xs text-slate-400 mt-1">Lead Administrator</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/dashboard');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-slate-800/50 text-blue-400 border-l-4 border-blue-400'
                    : 'text-slate-300 hover:bg-slate-800/30 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-400' : ''}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer - Settings */}
        <div className="p-4 border-t border-slate-700/50">
          <Link
            href="/dashboard/settings"
            className="flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800/30 hover:text-white transition-colors rounded-md"
          >
            <Settings className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">SETTINGS</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[260px] flex flex-col">
        {/* Top Header - White Background */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          {/* Left: Search Bar */}
          <div className="flex-1 max-w-2xl mr-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members, transactions, or events..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right: Notifications & Create New Button */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <Link
              href="/dashboard/notifications"
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>

            {/* Create New Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <Plus className="w-5 h-5" />
                <span>Create New</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {showCreateMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCreateMenu(false)}
                  />
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <button
                      onClick={() => {
                        router.push('/dashboard/announcements?action=create');
                        setShowCreateMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors">
                      New Announcement
                    </button>
                    <button
                      onClick={() => {
                        router.push('/dashboard/events?action=create');
                        setShowCreateMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-200">
                      New Event
                    </button>
                    <button
                      onClick={() => {
                        router.push('/dashboard/media?action=create');
                        setShowCreateMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors border-t border-gray-200">
                      New Sermon
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content - Light Gray Background with Padding */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">
            {children}
          </div>
          {/* Floating AI Command Bar */}
          <FloatingAICommandBar />
        </div>
      </main>
    </div>
  );
}
