'use client';
import { useState, useEffect } from 'react';
import { Megaphone, Pin, PinOff, Trash2, Plus, X } from 'lucide-react';
import api from '@/utils/api';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  author?: { firstName: string; lastName: string };
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  useEffect(() => {
    api.get('/announcements').then(r => { setAnnouncements(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await api.post('/announcements', form);
      setAnnouncements(prev => [r.data, ...prev]);
      setShowForm(false);
      setForm({ title: '', content: '' });
    } catch {}
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      await api.patch(`/announcements/${id}`, { isPinned: !isPinned });
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isPinned: !isPinned } : a));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try { await api.delete(`/announcements/${id}`); setAnnouncements(prev => prev.filter(a => a.id !== id)); } catch {}
  };

  const pinned = announcements.filter(a => a.isPinned);
  const regular = announcements.filter(a => !a.isPinned);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-primary-theme mb-1">Announcements</h1>
          <p className="text-muted-theme text-sm">Create and manage church announcements</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card-theme p-6 mb-8 rounded-xl border border-accent/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-primary-theme">New Announcement</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-theme hover:text-primary-theme"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Title *</label>
              <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" placeholder="Announcement title..." />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Message *</label>
              <textarea required value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm resize-none" rows={4} placeholder="Write your announcement..." />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-theme hover:text-primary-theme transition-colors">Cancel</button>
              <button type="submit" className="btn-gold px-6 py-2 rounded-lg text-sm font-sans">Post Announcement</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-theme">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="card-theme rounded-xl p-12 text-center">
          <Megaphone className="w-12 h-12 text-muted-theme mx-auto mb-3" />
          <p className="text-muted-theme">No announcements yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pinned */}
          {pinned.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Pin className="w-4 h-4 text-accent" />
                <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Pinned</span>
                <div className="flex-1 h-px bg-border-theme" />
              </div>
              <div className="space-y-3">
                {pinned.map(a => <AnnouncementCard key={a.id} a={a} onPin={handlePin} onDelete={handleDelete} />)}
              </div>
            </div>
          )}
          {/* Regular */}
          {regular.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-theme font-semibold">All Announcements</span>
                  <div className="flex-1 h-px bg-border-theme" />
                </div>
              )}
              <div className="space-y-3">
                {regular.map(a => <AnnouncementCard key={a.id} a={a} onPin={handlePin} onDelete={handleDelete} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnnouncementCard({ a, onPin, onDelete }: { a: any; onPin: (id: string, pinned: boolean) => void; onDelete: (id: string) => void }) {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <div className={`card-theme rounded-xl border overflow-hidden ${a.isPinned ? 'border-accent/30' : 'border-border-theme'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-lg text-primary-theme">{a.title}</h3>
            {a.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => onPin(a.id, a.isPinned)} className={`p-2 transition-colors ${a.isPinned ? 'text-accent hover:text-muted-theme' : 'text-muted-theme hover:text-accent'}`} title={a.isPinned ? 'Unpin' : 'Pin'}>
              {a.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
            <button onClick={() => onDelete(a.id)} className="p-2 text-muted-theme hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-theme leading-relaxed mb-3">{a.content}</p>
        <div className="flex items-center gap-2 text-xs text-muted-theme">
          <span>By {a.author ? `${a.author.firstName} ${a.author.lastName}` : 'Admin'}</span>
          <span>•</span>
          <span>{timeAgo(a.createdAt)}</span>
          <span>•</span>
          <span>{new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}
