'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api, { API_URL } from '@/utils/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

interface NotificationRules {
  announcements: boolean;
  sermons: boolean;
  chat: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingRules, setSavingRules] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  
  const [notificationRules, setNotificationRules] = useState<NotificationRules>({
    announcements: true,
    sermons: false,
    chat: false,
  });
  
  const [appConfig, setAppConfig] = useState({
    churchName: 'New Birth Praise and Worship Center',
    websiteUrl: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get user ID from localStorage
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            setUserId(userObj.id);
            
            // Fetch user profile
            const userResponse = await api.get(`/users/${userObj.id}`);
            const userData: User = userResponse.data;
            setUser(userData);
            setProfileData({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
            });
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
      }

      // Fetch notification rules
      try {
        const rulesResponse = await api.get('/system-settings/notification_rules');
        if (rulesResponse.data && rulesResponse.data.value) {
          setNotificationRules(rulesResponse.data.value);
        }
      } catch (error: any) {
        console.error('Error fetching notification rules:', error);
        // Default values if 404
        if (error.response?.status === 404) {
          setNotificationRules({
            announcements: true,
            sermons: false,
            chat: false,
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      setSavingProfile(true);
      
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await api.post('/users/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const avatarUrl = `${API_URL}${uploadResponse.data.url}`;

      // Update user with new avatar URL
      await api.patch(`/users/${userId}`, { avatarUrl });

      // Update local state
      if (user) {
        const updatedUser = { ...user, avatarUrl };
        setUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }

      showToast('Avatar updated successfully');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      showToast('Failed to update avatar', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    try {
      setSavingProfile(true);
      await api.patch(`/users/${userId}`, profileData);
      
      // Update local state
      if (user) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }

      showToast('Profile saved successfully');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      showToast('Failed to save profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleRule = async (key: keyof NotificationRules) => {
    const newRules = {
      ...notificationRules,
      [key]: !notificationRules[key],
    };

    // Optimistic update
    setNotificationRules(newRules);
    setSavingRules(true);

    try {
      await api.patch('/system-settings/notification_rules', {
        value: newRules,
      });

      showToast('Notification rules updated successfully');
    } catch (error: any) {
      console.error('Error updating notification rules:', error);
      // Revert on error
      setNotificationRules(notificationRules);
      showToast('Failed to update notification rules', 'error');
    } finally {
      setSavingRules(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      // For now, just save to localStorage (visual only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('appConfig', JSON.stringify(appConfig));
      }
      showToast('Configuration saved successfully');
    } catch (error: any) {
      console.error('Error saving config:', error);
      showToast('Failed to save configuration', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Simple toast implementation
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

  const getInitials = () => {
    if (profileData.firstName && profileData.lastName) {
      return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
    }
    if (profileData.firstName) {
      return profileData.firstName[0].toUpperCase();
    }
    return 'A';
  };

  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${API_URL}${avatarUrl}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section A: My Profile */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">My Profile</h2>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleAvatarClick}
              disabled={savingProfile}
              className="relative group cursor-pointer">
              {getAvatarUrl(user?.avatarUrl) ? (
                <img
                  src={getAvatarUrl(user?.avatarUrl)!}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 group-hover:border-blue-500 transition-colors"
                  onError={(e) => {
                    // Fallback to initials on error
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-semibold border-4 border-gray-200 group-hover:border-blue-500 transition-colors">
                  {getInitials()}
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full flex items-center justify-center transition-opacity">
                <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Change
                </span>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) =>
                  setProfileData({ ...profileData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) =>
                  setProfileData({ ...profileData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium">
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Section B: Notification Rules */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Notification Rules
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Control which notifications are mandatory for all members.
          </p>

          <div className="space-y-4">
            {/* Force Announcement Alerts */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">
                  Force Announcement Alerts
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationRules.announcements}
                  onChange={() => handleToggleRule('announcements')}
                  disabled={savingRules}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>

            {/* Force Sermon Alerts */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">
                  Force Sermon Alerts
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationRules.sermons}
                  onChange={() => handleToggleRule('sermons')}
                  disabled={savingRules}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>

            {/* Force Chat Alerts */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">
                  Force Chat Alerts
                </label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationRules.chat}
                  onChange={() => handleToggleRule('chat')}
                  disabled={savingRules}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>

            {savingRules && (
              <div className="text-center text-sm text-gray-500">
                Saving...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section C: App Configuration */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          App Configuration
        </h2>

        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Church Name
            </label>
            <input
              type="text"
              value={appConfig.churchName}
              onChange={(e) =>
                setAppConfig({ ...appConfig, churchName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              value={appConfig.websiteUrl}
              onChange={(e) =>
                setAppConfig({ ...appConfig, websiteUrl: e.target.value })
              }
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={savingConfig}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium">
            {savingConfig ? 'Saving...' : 'Save Config'}
          </button>
        </div>
      </div>
    </div>
  );
}
