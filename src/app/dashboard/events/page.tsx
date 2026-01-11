'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Plus, Calendar, MapPin, Clock, Users, Trash2, X, Loader2 } from 'lucide-react';

interface Registration {
  id: string;
  userId: string;
  answer?: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
  imageUrl?: string;
  registrationQuestion?: string;
  registrations: Registration[];
}

export default function EventsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    imageUrl: '',
    registrationQuestion: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      alert('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description || undefined,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        location: formData.location,
        imageUrl: formData.imageUrl || undefined,
      };

      // Add registration question if provided
      if (formData.registrationQuestion.trim()) {
        payload.registrationQuestion = formData.registrationQuestion.trim();
      }

      await api.post('/events', payload);
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        imageUrl: '',
        registrationQuestion: '',
      });
      setShowCreateModal(false);
      
      // Refresh events list
      fetchEvents();
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingEventId(eventId);
    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents(); // Refresh list
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert(error.response?.data?.message || 'Failed to delete event. Please try again.');
    } finally {
      setDeletingEventId(null);
    }
  };

  const formatDateBox = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Get current datetime for default form values
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getNextHourDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Events Calendar</h1>
          <p className="text-gray-600">Create and manage church events</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle - Placeholder for future Calendar View */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden">
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium">
              List View
            </button>
            <button className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-50" disabled>
              Calendar View
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first event.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const dateBox = formatDateBox(event.startTime);
            const isDeleting = deletingEventId === event.id;

            return (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex items-start gap-6 hover:shadow-lg transition-shadow"
              >
                {/* Left: Big Date Box */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-blue-600 text-white rounded-lg flex flex-col items-center justify-center">
                    <div className="text-xs font-semibold uppercase">{dateBox.month}</div>
                    <div className="text-3xl font-bold">{dateBox.day}</div>
                  </div>
                </div>

                {/* Middle: Event Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  {event.registrationQuestion && (
                    <div className="mt-2 text-sm text-blue-600">
                      <span className="font-medium">Registration Question:</span> {event.registrationQuestion}
                    </div>
                  )}
                </div>

                {/* Right: RSVP Count and Actions */}
                <div className="flex-shrink-0 flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{event.registrations.length}</div>
                    <div className="text-xs text-gray-500">RSVPs</div>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id, event.title)}
                    disabled={isDeleting}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete event"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
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
                <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
                <button
                  onClick={() => !submitting && setShowCreateModal(false)}
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
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
                    placeholder="e.g., Sunday Service"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Event description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="startTime"
                      required
                      value={formData.startTime || getCurrentDateTime()}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="endTime"
                      required
                      value={formData.endTime || getNextHourDateTime()}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Main Sanctuary"
                  />
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label htmlFor="registrationQuestion" className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Question <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="registrationQuestion"
                    value={formData.registrationQuestion}
                    onChange={(e) => setFormData({ ...formData, registrationQuestion: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., How many guests are you bringing?"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This question will be asked when members RSVP to this event.
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
                    Create Event
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
