'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Users, DollarSign, Calendar, Heart, Radio, Loader2, ArrowUp, ArrowDown, Pin } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

interface Donation {
  id: string;
  amount: number; // In cents
  status: string;
  userId?: string;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  startTime: string;
}

interface Media {
  id: string;
  type: string;
  title: string;
  url: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  author: string;
  createdAt: string;
}

interface PrayerRequest {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

interface RecentActivity {
  id: string;
  name: string;
  action: string;
  date: Date;
  status: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    weeklyTithe: 0,
    activeEvents: 0,
    prayerNeeds: 0,
  });
  const [liveStreamEnabled, setLiveStreamEnabled] = useState(false);
  const [liveStreamId, setLiveStreamId] = useState<string | null>(null);
  const [liveStreamLoading, setLiveStreamLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState<Announcement | null>(null);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [usersRes, donationsRes, eventsRes, mediaRes, announcementsRes, prayerRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/donations').catch(() => ({ data: [] })),
        api.get('/events').catch(() => ({ data: [] })),
        api.get('/media').catch(() => ({ data: [] })),
        api.get('/announcements').catch(() => ({ data: [] })),
        api.get('/prayer-requests').catch(() => ({ data: [] })),
      ]);

      // Calculate stats
      const users = usersRes.data || [];
      const donations = donationsRes.data || [];
      const events = eventsRes.data || [];
      const media = mediaRes.data || [];
      const announcements = announcementsRes.data || [];
      const prayerRequests = prayerRes.data || [];

      const totalMembers = users.length;
      
      // Sum donations (amount is in cents, convert to dollars)
      // Filter for this week's donations (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyTitheCents = donations.reduce(
        (sum: number, donation: Donation) => {
          const donationDate = new Date(donation.createdAt);
          if (donation.status === 'succeeded' && donationDate >= oneWeekAgo) {
            return sum + (donation.amount || 0);
          }
          return sum;
        },
        0
      );
      const weeklyTithe = weeklyTitheCents / 100; // Convert cents to dollars

      const activeEvents = events.length;
      const prayerNeeds = prayerRequests.length;

      // Find next event
      const now = new Date();
      const upcomingEvents = events
        .filter((event: Event) => new Date(event.startTime) > now)
        .sort((a: Event, b: Event) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      setNextEvent(upcomingEvents[0] || null);

      // Check for live stream
      const liveStream = media.find((item: Media) => item.type === 'LIVESTREAM');
      setLiveStreamEnabled(!!liveStream);
      setLiveStreamId(liveStream?.id || null);

      // Get pinned announcement (first one should be pinned if any)
      const pinned = announcements.find((a: Announcement) => a.isPinned);
      setPinnedAnnouncement(pinned || null);

      // Create unified Recent Activity list
      const activityList: RecentActivity[] = [];

      // Map users to activities
      users.forEach((user: User) => {
        activityList.push({
          id: `user-${user.id}`,
          name: `${user.firstName} ${user.lastName}`,
          action: 'Joined',
          date: new Date(user.createdAt),
          status: 'Complete',
        });
      });

      // Map donations to activities
      donations.forEach((donation: Donation) => {
        const user = users.find((u: User) => u.id === donation.userId);
        activityList.push({
          id: `donation-${donation.id}`,
          name: user ? `${user.firstName} ${user.lastName}` : 'Donor',
          action: 'Gave',
          date: new Date(donation.createdAt),
          status: donation.status === 'succeeded' ? 'Success' : 'Pending',
        });
      });

      // Map events to activities (created events)
      events.forEach((event: Event) => {
        activityList.push({
          id: `event-${event.id}`,
          name: 'Admin',
          action: 'Created Event',
          date: new Date(event.startTime),
          status: 'Active',
        });
      });

      // Sort by date (newest first) and take top 5
      const sortedActivity = activityList
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);
      setRecentActivity(sortedActivity);

      setStats({
        totalMembers,
        weeklyTithe,
        activeEvents,
        prayerNeeds,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLiveStreamToggle = async (enabled: boolean) => {
    setLiveStreamLoading(true);
    try {
      if (enabled) {
        // Create live stream
        const response = await api.post('/media', {
          title: 'Sunday Service',
          type: 'LIVESTREAM',
          url: '', // Can be set later
          speaker: 'Pastor',
        });
        setLiveStreamId(response.data.id);
        setLiveStreamEnabled(true);
      } else {
        // Delete live stream
        if (liveStreamId) {
          await api.delete(`/media/${liveStreamId}`);
          setLiveStreamId(null);
          setLiveStreamEnabled(false);
        }
      }
    } catch (error: any) {
      console.error('Error toggling live stream:', error);
      alert(error.response?.data?.message || 'Failed to toggle live stream');
      setLiveStreamEnabled(!enabled);
    } finally {
      setLiveStreamLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatCurrencyShort = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      const hours = Math.floor(date.getHours() % 12 || 12);
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      return `Today, ${hours}:${minutes} ${ampm}`;
    } else if (diffDays === 0) {
      const hours = Math.floor(date.getHours() % 12 || 12);
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      return `Today, ${hours}:${minutes} ${ampm}`;
    } else if (diffDays === 1) {
      const hours = Math.floor(date.getHours() % 12 || 12);
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      return `Yesterday, ${hours}:${minutes} ${ampm}`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return '1d ago';
    } else {
      return `${diffDays}d ago`;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Complete':
      case 'Processed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      case 'Unread':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Members Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">TOTAL MEMBERS</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalMembers.toLocaleString()}</p>
          <div className="flex items-center text-green-600 text-sm">
            <ArrowUp className="w-4 h-4 mr-1" />
            <span>12% from last month</span>
          </div>
        </div>

        {/* Weekly Tithe Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">WEEKLY TITHE</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(stats.weeklyTithe)}</p>
          <div className="flex items-center text-green-600 text-sm">
            <ArrowUp className="w-4 h-4 mr-1" />
            <span>4.5% increase</span>
          </div>
        </div>

        {/* Active Events Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">ACTIVE EVENTS</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">{stats.activeEvents}</p>
          {nextEvent && (
            <p className="text-sm text-gray-600">
              Next: {nextEvent.title} ({new Date(nextEvent.startTime).toLocaleDateString('en-US', { weekday: 'short' })})
            </p>
          )}
        </div>

        {/* Prayer Needs Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">PRAYER NEEDS</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">{stats.prayerNeeds}</p>
          <div className="flex items-center text-gray-600 text-sm">
            <span>Active requests</span>
          </div>
        </div>
      </div>

      {/* Middle Section - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Recent Activity Table (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No recent activity
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {getInitials(activity.name)}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{activity.action}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{formatDate(activity.date.toISOString())}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Widgets (1/3 width) */}
        <div className="space-y-6">
          {/* Live Stream Widget */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">LIVE STREAM</h3>
              {liveStreamEnabled && (
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-1">Current Status</p>
              <p className={`text-2xl font-bold ${liveStreamEnabled ? 'text-red-600' : 'text-gray-900'}`}>
                {liveStreamEnabled ? '🔴 LIVE' : 'OFFLINE'}
              </p>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Off</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={liveStreamEnabled}
                  onChange={(e) => handleLiveStreamToggle(e.target.checked)}
                  disabled={liveStreamLoading}
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className="text-sm text-gray-600">Live</span>
            </div>
            {nextEvent && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Next: Sunday Service</p>
                <p className="text-sm font-medium text-gray-900">09:00 AM</p>
              </div>
            )}
            {liveStreamLoading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </div>
            )}
          </div>

          {/* Pinned Announcement Widget */}
          {pinnedAnnouncement && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">PINNED</h3>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{pinnedAnnouncement.title}</h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{pinnedAnnouncement.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Staff Only</span>
                <span>Posted {formatRelativeTime(pinnedAnnouncement.createdAt)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
