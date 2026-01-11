'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Users, DollarSign, Heart, Loader2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'member' | 'donation' | 'prayer';
  title: string;
  subtitle: string;
  date: Date;
  route: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [usersRes, donationsRes, prayerRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/donations').catch(() => ({ data: [] })),
        api.get('/prayer-requests').catch(() => ({ data: [] })),
      ]);

      const users = usersRes.data || [];
      const donations = donationsRes.data || [];
      const prayerRequests = prayerRes.data || [];

      // Create unified timeline
      const notificationList: NotificationItem[] = [];

      // Map users to notifications
      users.forEach((user: any) => {
        notificationList.push({
          id: `member-${user.id}`,
          type: 'member',
          title: 'New Member Joined',
          subtitle: `${user.firstName} ${user.lastName}`,
          date: new Date(user.createdAt),
          route: '/dashboard/people',
        });
      });

      // Map donations to notifications
      donations.forEach((donation: any) => {
        const amount = donation.amount ? (donation.amount / 100).toFixed(2) : '0.00';
        notificationList.push({
          id: `donation-${donation.id}`,
          type: 'donation',
          title: 'New Donation',
          subtitle: `$${amount}`,
          date: new Date(donation.createdAt),
          route: '/dashboard/finances',
        });
      });

      // Map prayer requests to notifications
      prayerRequests.forEach((prayer: any) => {
        const contentSnippet = prayer.content
          ? prayer.content.substring(0, 50) + (prayer.content.length > 50 ? '...' : '')
          : 'New prayer request';
        notificationList.push({
          id: `prayer-${prayer.id}`,
          type: 'prayer',
          title: 'New Prayer Request',
          subtitle: contentSnippet,
          date: new Date(prayer.createdAt),
          route: '/dashboard/prayer',
        });
      });

      // Sort by date (newest first)
      const sortedNotifications = notificationList.sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      setNotifications(sortedNotifications);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'member':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'donation':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'prayer':
        return <Heart className="w-5 h-5 text-pink-600" />;
      default:
        return null;
    }
  };

  const handleNotificationClick = (route: string) => {
    router.push(route);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600 text-lg">All caught up!</p>
          <p className="text-gray-500 text-sm mt-2">No new notifications</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification.route)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {renderIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 truncate">
                    {notification.subtitle}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(notification.date)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
