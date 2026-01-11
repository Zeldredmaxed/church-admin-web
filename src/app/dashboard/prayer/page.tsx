'use client';

import { useEffect, useState } from 'react';
import api, { API_URL } from '@/utils/api';
import { Trash2, Loader2, User as UserIcon, HandHeart, Heart } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

interface PrayerRequest {
  id: string;
  content: string;
  isAnonymous: boolean;
  shareToWall: boolean;
  userId?: string | null;
  prayCount?: number;
  createdAt: string;
  user?: User | null;
}

export default function PrayerPage() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  const fetchPrayerRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prayer-requests');
      setPrayerRequests(response.data);
    } catch (error: any) {
      console.error('Error fetching prayer requests:', error);
      alert('Failed to load prayer requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prayer request? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/prayer-requests/${id}`);
      // Refresh the list after deleting
      fetchPrayerRequests();
    } catch (error: any) {
      console.error('Error deleting prayer request:', error);
      alert(error.response?.data?.message || 'Failed to delete prayer request. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (firstName: string, lastName?: string) => {
    const first = firstName ? firstName[0].toUpperCase() : '';
    const last = lastName ? lastName[0].toUpperCase() : '';
    return first + last || 'U';
  };

  const getAvatarUrl = (avatarUrl?: string): string | null => {
    if (!avatarUrl) return null;
    // If it already starts with http, use it as is
    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    // If it starts with /, prepend the base URL
    if (avatarUrl.startsWith('/')) {
      return `${API_URL}${avatarUrl}`;
    }
    // Fallback: return as is (shouldn't happen, but just in case)
    return avatarUrl;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getDisplayName = (request: PrayerRequest): string => {
    if (request.isAnonymous) {
      return 'Anonymous';
    }
    if (request.user) {
      return `${request.user.firstName} ${request.user.lastName || ''}`.trim();
    }
    return 'Unknown User';
  };

  const getAvatarContent = (request: PrayerRequest) => {
    if (request.isAnonymous) {
      return (
        <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-white" />
        </div>
      );
    }
    
    const avatarUrl = request.user ? getAvatarUrl(request.user.avatarUrl) : null;
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={getDisplayName(request)}
          className="w-12 h-12 rounded-full object-cover"
        />
      );
    }
    
    const initials = request.user 
      ? getInitials(request.user.firstName, request.user.lastName)
      : 'U';
    
    return (
      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
        {initials}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading prayer requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Prayer Wall</h1>
        <p className="text-gray-600">Requests from the community</p>
      </div>

      {/* Prayer Requests Grid */}
      {prayerRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <HandHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No prayer requests yet</h3>
          <p className="text-gray-600">Prayer requests from the community will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {prayerRequests.map((request) => {
            const isDeleting = deletingId === request.id;
            
            return (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getAvatarContent(request)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getDisplayName(request)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(request.id)}
                    disabled={isDeleting}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete prayer request"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Prayer Content */}
                <div className="mb-4">
                  <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                    {request.content}
                  </p>
                </div>

                {/* Footer with Badges and Prayer Count */}
                <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {request.shareToWall ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Shared to Wall
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Private
                      </span>
                    )}
                  </div>
                  {/* Prayer Count Badge */}
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <HandHeart className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      {request.prayCount || 0} praying
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
