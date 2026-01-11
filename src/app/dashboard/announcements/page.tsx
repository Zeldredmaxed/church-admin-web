'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Plus, Trash2, X, Loader2, Megaphone, Pin } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  author: string;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<string | null>(null);
  const [pinningAnnouncementId, setPinningAnnouncementId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: 'Admin',
    isPinned: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Auto-open create modal if action=create
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setShowCreateModal(true);
      // Remove query param from URL after opening
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('action');
        router.replace(url.pathname + url.search, { scroll: false });
      }
    }
  }, [searchParams, router]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/announcements');
      // Backend already sorts by isPinned: desc, but we'll ensure pinned items are at top
      const sorted = response.data.sort((a: Announcement, b: Announcement) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setAnnouncements(sorted);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      alert('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/announcements', {
        title: formData.title,
        content: formData.content,
        author: formData.author || 'Admin',
        isPinned: formData.isPinned,
      });

      // Reset form and close modal
      setFormData({
        title: '',
        content: '',
        author: 'Admin',
        isPinned: false,
      });
      setShowCreateModal(false);

      // Refresh announcements list
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      alert(error.response?.data?.message || 'Failed to create announcement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinToggle = async (announcementId: string) => {
    setPinningAnnouncementId(announcementId);
    try {
      await api.patch(`/announcements/${announcementId}/pin`);
      // Refresh list to reflect pin changes
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      alert(error.response?.data?.message || 'Failed to toggle pin. Please try again.');
    } finally {
      setPinningAnnouncementId(null);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string, announcementTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${announcementTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingAnnouncementId(announcementId);
    try {
      await api.delete(`/announcements/${announcementId}`);
      fetchAnnouncements(); // Refresh list
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      alert(error.response?.data?.message || 'Failed to delete announcement. Please try again.');
    } finally {
      setDeletingAnnouncementId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements</h1>
          <p className="text-gray-600">Create and manage church announcements</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first announcement.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const isDeleting = deletingAnnouncementId === announcement.id;
            const isPinning = pinningAnnouncementId === announcement.id;

            return (
              <div
                key={announcement.id}
                className={`bg-white rounded-lg shadow-md border-2 p-6 hover:shadow-lg transition-shadow ${
                  announcement.isPinned
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200'
                }`}
              >
                {/* Header with Pin Badge and Actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{announcement.title}</h3>
                      {announcement.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded-full">
                          📌 PINNED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By {announcement.author}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(announcement.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {/* Pin Toggle Button */}
                    <button
                      onClick={() => handlePinToggle(announcement.id)}
                      disabled={isPinning}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 ${
                        announcement.isPinned
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={announcement.isPinned ? 'Unpin from top' : 'Pin to top'}
                    >
                      {isPinning ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Pin className={`w-4 h-4 ${announcement.isPinned ? 'fill-current' : ''}`} />
                      )}
                      {announcement.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id, announcement.title)}
                      disabled={isDeleting}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Delete announcement"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {announcement.content}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Posted {formatDate(announcement.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => !submitting && setShowCreateModal(false)}
          ></div>

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Create New Announcement</h2>
                <button
                  onClick={() => !submitting && setShowCreateModal(false)}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Volunteer Appreciation Dinner"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    rows={6}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="Enter announcement content..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Supports multiple lines and formatting
                  </p>
                </div>

                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Admin"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPinned" className="ml-2 text-sm font-medium text-gray-700">
                    Pin immediately?
                  </label>
                  <p className="ml-2 text-xs text-gray-500">
                    (Will unpin any currently pinned announcement)
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={submitting}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
