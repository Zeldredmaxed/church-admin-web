'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Plus, Trash2, X, Loader2, Film, Pencil } from 'lucide-react';

interface Media {
  id: string;
  title: string;
  type: string; // 'SERMON' or 'LIVESTREAM'
  url: string;
  speaker: string;
  summary?: string;
  publishedAt: string;
}

export default function MediaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    url: '',
    type: 'SERMON',
    summary: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMedia();
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

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await api.get('/media');
      setMediaItems(response.data);
    } catch (error: any) {
      console.error('Error fetching media:', error);
      alert('Failed to load media. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;

    // Handle various YouTube URL formats:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    // https://m.youtube.com/watch?v=VIDEO_ID

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (url: string): string => {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    // Fallback placeholder if URL is invalid or not YouTube
    return 'https://via.placeholder.com/320x180?text=No+Thumbnail';
  };

  const handleEditMedia = (media: Media) => {
    setEditingId(media.id);
    setFormData({
      title: media.title,
      speaker: media.speaker,
      url: media.url,
      type: media.type,
      summary: media.summary || '',
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setShowCreateModal(false);
      setEditingId(null);
      setFormData({
        title: '',
        speaker: '',
        url: '',
        type: 'SERMON',
        summary: '',
      });
    }
  };

  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate YouTube URL
      const videoId = extractYouTubeId(formData.url);
      if (!videoId) {
        alert('Please enter a valid YouTube URL.');
        setSubmitting(false);
        return;
      }

      const payload = {
        title: formData.title,
        speaker: formData.speaker,
        url: formData.url,
        type: formData.type,
        summary: formData.summary || undefined,
      };

      if (editingId) {
        // Update existing media
        await api.patch(`/media/${editingId}`, payload);
      } else {
        // Create new media
        await api.post('/media', payload);
      }

      // Reset form and close modal
      handleCloseModal();

      // Refresh media list
      fetchMedia();
    } catch (error: any) {
      console.error('Error saving media:', error);
      alert(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} media. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string, mediaTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${mediaTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingMediaId(mediaId);
    try {
      await api.delete(`/media/${mediaId}`);
      fetchMedia(); // Refresh list
    } catch (error: any) {
      console.error('Error deleting media:', error);
      alert(error.response?.data?.message || 'Failed to delete media. Please try again.');
    } finally {
      setDeletingMediaId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading media library...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Media Library</h1>
          <p className="text-gray-600">Manage sermons, livestreams, and video content</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Media
        </button>
      </div>

      {/* Media Grid */}
      {mediaItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No media yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first video.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Media
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mediaItems.map((media) => {
            const isDeleting = deletingMediaId === media.id;
            const thumbnailUrl = getYouTubeThumbnail(media.url);

            return (
              <div
                key={media.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow relative group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt={media.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if thumbnail fails to load
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
                    }}
                  />
                  {/* Badge Overlay */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        media.type === 'LIVESTREAM'
                          ? 'bg-red-600 text-white'
                          : media.type === 'SERMON'
                          ? 'bg-gray-700 text-white'
                          : media.type === 'WORSHIP'
                          ? 'bg-indigo-600 text-white'
                          : media.type === 'BIBLE_STUDY'
                          ? 'bg-blue-600 text-white'
                          : media.type === 'SUNDAY_SCHOOL'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      {media.type === 'LIVESTREAM'
                        ? 'Livestream'
                        : media.type === 'SERMON'
                        ? 'Sermon'
                        : media.type === 'WORSHIP'
                        ? 'Worship'
                        : media.type === 'BIBLE_STUDY'
                        ? 'Bible Study'
                        : media.type === 'SUNDAY_SCHOOL'
                        ? 'Sunday School'
                        : media.type}
                    </span>
                  </div>
                  {/* Action Buttons Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={() => handleEditMedia(media)}
                      disabled={isDeleting}
                      className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Edit media"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(media.id, media.title)}
                      disabled={isDeleting}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Delete media"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[3rem]">
                    {media.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Speaker:</span> {media.speaker}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(media.publishedAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Media Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseModal}
          ></div>

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Media' : 'Add New Media'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveMedia} className="p-6 space-y-4">
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
                    className="bg-white text-gray-900 border border-gray-300 w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Sunday Morning Service"
                  />
                </div>

                <div>
                  <label htmlFor="speaker" className="block text-sm font-medium text-gray-700 mb-1">
                    Speaker <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="speaker"
                    required
                    value={formData.speaker}
                    onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                    className="bg-white text-gray-900 border border-gray-300 w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Pastor John"
                  />
                </div>

                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="bg-white text-gray-900 border border-gray-300 w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Supports youtube.com/watch?v= and youtu.be/ formats
                  </p>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="bg-white text-gray-900 border border-gray-300 w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="SERMON">Sermon</option>
                    <option value="LIVESTREAM">Livestream</option>
                    <option value="WORSHIP">Worship</option>
                    <option value="BIBLE_STUDY">Bible Study</option>
                    <option value="SUNDAY_SCHOOL">Sunday School</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                    Sermon Summary / Key Points
                  </label>
                  <textarea
                    id="summary"
                    rows={4}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="bg-white text-gray-900 border border-gray-300 w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[100px]"
                    placeholder="Paste the sermon notes here. This allows the AI Assistant to answer questions about this sermon."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Paste the sermon notes here. This allows the AI Assistant to answer questions about this sermon.
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
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
                    {editingId ? 'Update Media' : 'Add Media'}
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
