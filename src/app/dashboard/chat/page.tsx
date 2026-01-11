'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api, { API_URL } from '@/utils/api';
import { Trash2, Loader2, Users, MessageSquare, Send } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

interface Participant {
  id: string;
  userId: string;
  user: User;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: User;
}

interface Conversation {
  id: string;
  name: string | null;
  isGroup: boolean;
  createdAt: string;
  participants: Participant[];
  messages: Message[];
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [groups, setGroups] = useState<Conversation[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; firstName?: string; lastName?: string } | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [failedAvatars, setFailedAvatars] = useState<Set<string>>(new Set()); // Track which avatars failed to load

  useEffect(() => {
    fetchGroups();
    
    // Get current user from localStorage
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser({ id: user.id, firstName: user.firstName, lastName: user.lastName });
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
    
    // Check for groupId in query params and set it immediately
    const groupIdFromQuery = searchParams.get('groupId');
    if (groupIdFromQuery) {
      setSelectedGroupId(groupIdFromQuery);
    }
  }, []);

  // Auto-select group from query parameter when groups are loaded
  useEffect(() => {
    const groupIdFromQuery = searchParams.get('groupId');
    if (groupIdFromQuery && groups.length > 0 && !selectedGroupId) {
      // Find if the group exists in the list
      const groupExists = groups.some(g => g.id === groupIdFromQuery);
      if (groupExists) {
        setSelectedGroupId(groupIdFromQuery);
      }
    }
  }, [searchParams, groups, selectedGroupId]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchMessages(selectedGroupId);
    } else {
      setMessages([]);
    }
  }, [selectedGroupId]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/admin/groups');
      setGroups(response.data);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      alert('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const response = await api.get(`/chat/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      alert('Failed to load messages. Please try again.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    setDeletingMessageId(messageId);
    try {
      await api.delete(`/chat/messages/${messageId}`);
      // Remove from UI immediately
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    } catch (error: any) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGroupId || !inputText.trim() || !currentUser) {
      return;
    }

    setSendingMessage(true);
    const messageContent = inputText.trim();
    setInputText(''); // Clear input immediately for better UX

    // Optimistically add message to UI
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUser.id,
        firstName: currentUser.firstName || 'Admin',
        lastName: currentUser.lastName || '',
        email: '',
      },
    };

    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
      const response = await api.post(`/chat/${selectedGroupId}/messages`, {
        userId: currentUser.id,
        content: messageContent,
      });

      // Replace optimistic message with real one from server
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === optimisticMessage.id ? response.data : msg
        )
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== optimisticMessage.id)
      );
      setInputText(messageContent); // Restore input text
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Date(date).toLocaleString('en-US', {
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
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
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

  const handleImageError = (messageId: string) => {
    setFailedAvatars(prev => new Set(prev).add(messageId));
  };

  const getGroupName = (group: Conversation): string => {
    return group.name || `Group Chat ${group.id.slice(0, 8)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading chat groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Moderation</h1>
        <p className="text-gray-600">Monitor and moderate group conversations</p>
      </div>

      {/* Split View */}
      <div className="flex gap-6 h-[calc(100vh-250px)]">
        {/* Left Column: Group List (30%) */}
        <div className="w-[30%] bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Group Chats ({groups.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {groups.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No group chats found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {groups.map((group) => {
                  const isSelected = selectedGroupId === group.id;
                  const memberCount = group.participants?.length || 0;
                  const lastMessage = group.messages?.[0];

                  return (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {getGroupName(group)}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                          </p>
                          {lastMessage && (
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {lastMessage.content.substring(0, 50)}
                              {lastMessage.content.length > 50 ? '...' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Message Inspector (70%) */}
        <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col">
          {!selectedGroupId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Select a group to moderate</p>
                <p className="text-sm mt-2">Choose a group from the list to view and moderate messages</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Messages ({messages.length})
                </h2>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 pb-24">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No messages in this group</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {getAvatarUrl(message.sender?.avatarUrl) && !failedAvatars.has(message.id) ? (
                            <img
                              src={getAvatarUrl(message.sender?.avatarUrl)!}
                              alt={`${message.sender.firstName} ${message.sender.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={() => handleImageError(message.id)}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                              {getInitials(message.sender?.firstName || '', message.sender?.lastName)}
                            </div>
                          )}
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {message.sender?.firstName} {message.sender?.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            disabled={deletingMessageId === message.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Delete message"
                          >
                            {deletingMessageId === message.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input Footer */}
              <div className="border-t border-gray-200 bg-white p-4">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message to the group..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sendingMessage || !currentUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
