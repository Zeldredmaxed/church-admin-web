'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, Users, Trash2, ShieldAlert } from 'lucide-react';
import api from '@/utils/api';

interface Group {
  id: string;
  name: string;
  type: string;
  _count?: { members: number; messages: number };
  lastMessage?: { content: string; createdAt: string; sender?: { firstName: string; lastName: string } };
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender?: { firstName: string; lastName: string; profileImageUrl?: string };
  isFlagged?: boolean;
}

export default function ChatPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);

  useEffect(() => {
    api.get('/chat/groups').then(r => { setGroups(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const loadMessages = async (group: Group) => {
    setSelectedGroup(group);
    setMsgLoading(true);
    try {
      const r = await api.get(`/chat/groups/${group.id}/messages`);
      setMessages(r.data);
    } catch { setMessages([]); }
    setMsgLoading(false);
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/chat/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch {}
  };

  const typeColors: Record<string, string> = {
    OFFICIAL: 'bg-accent/20 text-accent',
    PRIVATE: 'bg-blue-500/20 text-blue-400',
    GROUP: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-primary-theme mb-1">Chat Moderation</h1>
        <p className="text-muted-theme text-sm">Monitor and moderate group conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Group List */}
        <div className="lg:col-span-1">
          <div className="card-theme rounded-xl border border-border-theme overflow-hidden">
            <div className="p-4 border-b border-border-theme">
              <h2 className="font-serif text-lg text-primary-theme">Group Chats ({groups.length})</h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-32 text-muted-theme text-sm">Loading...</div>
            ) : groups.length === 0 ? (
              <div className="p-8 text-center text-muted-theme text-sm">No groups found.</div>
            ) : (
              <div className="divide-y divide-border-theme">
                {groups.map(g => (
                  <button key={g.id} onClick={() => loadMessages(g)} className={`w-full text-left p-4 hover:bg-surface-theme transition-colors ${selectedGroup?.id === g.id ? 'bg-surface-theme border-l-2 border-accent' : ''}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-primary-theme line-clamp-1">{g.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeColors[g.type] || 'bg-white/10 text-white'}`}>{g.type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-theme">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{g._count?.members ?? 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{g._count?.messages ?? 0}</span>
                    </div>
                    {g.lastMessage && (
                      <p className="text-xs text-muted-theme mt-1 line-clamp-1">{g.lastMessage.content}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Panel */}
        <div className="lg:col-span-2">
          {!selectedGroup ? (
            <div className="card-theme rounded-xl border border-border-theme h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-theme mb-3" />
              <p className="font-serif text-lg text-primary-theme mb-1">Select a group to moderate</p>
              <p className="text-sm text-muted-theme">Choose a group from the list to view and moderate messages</p>
            </div>
          ) : (
            <div className="card-theme rounded-xl border border-border-theme overflow-hidden flex flex-col" style={{ minHeight: 400 }}>
              {/* Panel Header */}
              <div className="p-4 border-b border-border-theme flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg text-primary-theme">{selectedGroup.name}</h2>
                  <span className="text-xs text-muted-theme">{messages.length} messages</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[selectedGroup.type] || 'bg-white/10 text-white'}`}>{selectedGroup.type}</span>
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px]">
                {msgLoading ? (
                  <div className="flex items-center justify-center h-32 text-muted-theme text-sm">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-theme text-sm">No messages in this group.</div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-3 group p-3 rounded-lg hover:bg-surface-theme transition-colors ${msg.isFlagged ? 'border border-red-500/30 bg-red-500/5' : ''}`}>
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden">
                        {msg.sender?.profileImageUrl ? (
                          <img src={msg.sender.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-accent text-xs font-semibold">{msg.sender?.firstName?.[0] ?? '?'}</span>
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-primary-theme">{msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown'}</span>
                          <span className="text-xs text-muted-theme">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.isFlagged && <span className="flex items-center gap-1 text-xs text-red-400"><ShieldAlert className="w-3 h-3" />Flagged</span>}
                        </div>
                        <p className="text-sm text-muted-theme">{msg.content}</p>
                      </div>
                      {/* Delete */}
                      <button onClick={() => handleDeleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-theme hover:text-red-400 transition-all flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
