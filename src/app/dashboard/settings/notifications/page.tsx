'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

interface NotificationRules {
  announcements: boolean;
  sermons: boolean;
  chat: boolean;
}

export default function NotificationRulesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<NotificationRules>({
    announcements: false,
    sermons: false,
    chat: false,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/system-settings/notification_rules');
      
      if (response.data && response.data.value) {
        setRules(response.data.value);
      } else {
        // Default values if no rules exist
        setRules({
          announcements: false,
          sermons: false,
          chat: false,
        });
      }
    } catch (error: any) {
      console.error('Error fetching notification rules:', error);
      // If setting doesn't exist yet, use defaults
      if (error.response?.status === 404) {
        setRules({
          announcements: false,
          sermons: false,
          chat: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationRules) => {
    const newRules = {
      ...rules,
      [key]: !rules[key],
    };

    // Optimistic update
    setRules(newRules);
    setSaving(true);

    try {
      await api.patch('/system-settings/notification_rules', {
        value: newRules,
      });

      // Show success toast
      showToast('Notification rules updated successfully');
    } catch (error: any) {
      console.error('Error updating notification rules:', error);
      // Revert on error
      setRules(rules);
      showToast('Failed to update notification rules', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Simple toast implementation - you can replace with a toast library
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Notification Rules</h1>
        </div>

        {/* Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Toggle ON to force notifications for all members (Gray out their switch). Toggle OFF to let them decide.
          </p>
        </div>

        {/* Rules List */}
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {/* Force Announcement Alerts */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Force Announcement Alerts</h3>
                <p className="text-sm text-gray-500 mt-1">
                  All members will receive announcement notifications regardless of their preferences
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={rules.announcements}
                  onChange={() => handleToggle('announcements')}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Force Sermon Alerts */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Force Sermon Alerts</h3>
                <p className="text-sm text-gray-500 mt-1">
                  All members will receive sermon notifications regardless of their preferences
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={rules.sermons}
                  onChange={() => handleToggle('sermons')}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Force Chat Alerts */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Force Chat Alerts</h3>
                <p className="text-sm text-gray-500 mt-1">
                  All members will receive chat notifications regardless of their preferences
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={rules.chat}
                  onChange={() => handleToggle('chat')}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Saving indicator */}
        {saving && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Saving changes...
          </div>
        )}
      </div>
    </div>
  );
}
