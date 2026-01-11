'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { API_URL } from '@/utils/api';
import { Search, MoreVertical, Edit, Download, Loader2, X, Tag, Plus, MessageSquare } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface UserTag {
  tag: Tag;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'LEADER' | 'MEMBER' | 'GUEST';
  avatarUrl?: string;
  createdAt: string;
  tags: UserTag[];
}

export default function PeoplePage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [syncingTagId, setSyncingTagId] = useState<string | null>(null);
  const [failedAvatars, setFailedAvatars] = useState<Set<string>>(new Set()); // Track which avatars failed to load

  // Modal states
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [showEditTagsModal, setShowEditTagsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userTags, setUserTags] = useState<Set<string>>(new Set()); // Track which tags user has

  // Create tag form state
  const [tagFormData, setTagFormData] = useState({
    name: '',
    color: '#6B7280', // Default gray color
  });
  const [submittingTag, setSubmittingTag] = useState(false);
  const [togglingTags, setTogglingTags] = useState<Set<string>>(new Set()); // Track tags being toggled

  useEffect(() => {
    fetchUsers();
    fetchTags();
    // Get current user from localStorage
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser({ id: user.id });
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  // Update userTags when editingUser changes
  useEffect(() => {
    if (editingUser) {
      const tagIds = new Set(editingUser.tags.map((ut) => ut.tag.id));
      setUserTags(tagIds);
    }
  }, [editingUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      alert('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/tags');
      setAllTags(response.data);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
      // Don't show alert, tags might not be critical for initial load
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTag(true);

    try {
      await api.post('/tags', {
        name: tagFormData.name,
        color: tagFormData.color,
      });

      // Reset form and close modal
      setTagFormData({
        name: '',
        color: '#6B7280',
      });
      setShowCreateTagModal(false);

      // Refresh tags list
      fetchTags();
    } catch (error: any) {
      console.error('Error creating tag:', error);
      alert(error.response?.data?.message || 'Failed to create tag. Please try again.');
    } finally {
      setSubmittingTag(false);
    }
  };

  const handleEditTags = (user: User) => {
    setEditingUser(user);
    setShowEditTagsModal(true);
    setSelectedUser(null); // Close the dropdown menu
  };

  const handleToggleTag = async (tagId: string, checked: boolean) => {
    if (!editingUser) return;

    // Optimistic UI update
    const newUserTags = new Set(userTags);
    if (checked) {
      newUserTags.add(tagId);
    } else {
      newUserTags.delete(tagId);
    }
    setUserTags(newUserTags);
    setTogglingTags((prev) => new Set(prev).add(tagId));

    try {
      if (checked) {
        // Assign user to tag
        await api.post(`/tags/${tagId}/users`, {
          userId: editingUser.id,
        });
      } else {
        // Remove user from tag
        await api.delete(`/tags/${tagId}/users/${editingUser.id}`);
      }

      // Refresh users to get updated tag data
      await fetchUsers();

      // Update editingUser if modal is still open
      if (editingUser) {
        const updatedUser = users.find((u) => u.id === editingUser.id);
        if (updatedUser) {
          setEditingUser(updatedUser);
        }
      }
    } catch (error: any) {
      console.error('Error toggling tag:', error);
      // Revert optimistic update on error
      setUserTags(new Set(editingUser.tags.map((ut) => ut.tag.id)));
      alert(error.response?.data?.message || 'Failed to update tag. Please try again.');
    } finally {
      setTogglingTags((prev) => {
        const next = new Set(prev);
        next.delete(tagId);
        return next;
      });
    }
  };

  const handleMessageTag = async (tag: Tag) => {
    if (!currentUser) {
      alert('User not found. Please log in again.');
      return;
    }

    setSyncingTagId(tag.id);
    try {
      const response = await api.post('/chat/tag-group', {
        tagId: tag.id,
        adminId: currentUser.id,
      });

      // Redirect to chat page with the conversation ID
      const conversationId = response.data.id;
      router.push(`/dashboard/chat?groupId=${conversationId}`);
    } catch (error: any) {
      console.error('Error creating tag group:', error);
      alert(error.response?.data?.message || 'Failed to open tag group chat. Please try again.');
    } finally {
      setSyncingTagId(null);
    }
  };

  const getInitials = (user: User) => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
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

  const handleImageError = (userId: string) => {
    setFailedAvatars(prev => new Set(prev).add(userId));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'LEADER':
        return 'bg-purple-100 text-purple-800';
      case 'MEMBER':
        return 'bg-gray-100 text-gray-800';
      case 'GUEST':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Tags', 'Joined Date'];
    const rows = users.map((user) => [
      `${user.firstName} ${user.lastName}`,
      user.email,
      user.role,
      user.tags.map((ut) => ut.tag.name).join(', '),
      formatDate(user.createdAt),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `people-directory-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading people directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">People Directory</h1>
          <p className="text-gray-600">Manage members, roles, and tags</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search Bar and Manage Tags Button */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowCreateTagModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <Tag className="w-4 h-4" />
          Manage Tags
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    {/* Avatar/Name Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getAvatarUrl(user.avatarUrl) && !failedAvatars.has(user.id) ? (
                          <img
                            src={getAvatarUrl(user.avatarUrl)!}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                            onError={() => handleImageError(user.id)}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {getInitials(user)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Tags Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.tags.length === 0 ? (
                          <span className="text-sm text-gray-400">No tags</span>
                        ) : (
                          user.tags.map((userTag) => (
                            <span
                              key={userTag.tag.id}
                              className="px-2 py-1 text-xs font-medium rounded-full text-white"
                              style={{
                                backgroundColor: userTag.tag.color || '#6B7280',
                              }}
                            >
                              {userTag.tag.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Joined Date Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                          className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                          aria-label="More actions"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {selectedUser === user.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setSelectedUser(null)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                              <button
                                onClick={() => {
                                  handleEditTags(user);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Tags
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with count */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} {users.length === 1 ? 'person' : 'people'}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      </div>

      {/* Create Tag Modal */}
      {showCreateTagModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => !submittingTag && setShowCreateTagModal(false)}
          ></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Create New Tag</h2>
                <button
                  onClick={() => !submittingTag && setShowCreateTagModal(false)}
                  disabled={submittingTag}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateTag} className="p-6 space-y-4">
                <div>
                  <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-1">
                    Tag Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="tagName"
                    required
                    value={tagFormData.name}
                    onChange={(e) => setTagFormData({ ...tagFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Worship Team"
                  />
                </div>
                <div>
                  <label htmlFor="tagColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Color <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="tagColor"
                      required
                      value={tagFormData.color}
                      onChange={(e) => setTagFormData({ ...tagFormData, color: e.target.value })}
                      className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <input
                      type="text"
                      value={tagFormData.color}
                      onChange={(e) => setTagFormData({ ...tagFormData, color: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="#6B7280"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Hex color code (e.g., #FF5733)</p>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateTagModal(false)}
                    disabled={submittingTag}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submittingTag && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Tag
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Tags Modal */}
      {showEditTagsModal && editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowEditTagsModal(false)}
          ></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Tags</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingUser.firstName} {editingUser.lastName}
                  </p>
                </div>
                <button
                  onClick={() => setShowEditTagsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                {allTags.length === 0 ? (
                  <div className="text-center py-8">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tags available. Create a tag first.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allTags.map((tag) => {
                      const isChecked = userTags.has(tag.id);
                      const isToggling = togglingTags.has(tag.id);
                      const isSyncing = syncingTagId === tag.id;

                      return (
                        <div
                          key={tag.id}
                          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <label className="flex items-center flex-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleToggleTag(tag.id, e.target.checked)}
                              disabled={isToggling}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                            <div className="ml-3 flex-1 flex items-center gap-3">
                              <span
                                className="px-3 py-1 text-xs font-medium rounded-full text-white"
                                style={{ backgroundColor: tag.color || '#6B7280' }}
                              >
                                {tag.name}
                              </span>
                              {isToggling && (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              )}
                            </div>
                          </label>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMessageTag(tag);
                            }}
                            disabled={isSyncing}
                            className="ml-3 p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Open Tag Group Chat"
                          >
                            {isSyncing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MessageSquare className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
