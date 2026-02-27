'use client';
import { useState, useEffect } from 'react';
import { Play, Plus, Trash2, Edit2, X, BookOpen } from 'lucide-react';
import api from '@/utils/api';

interface Media {
  id: string;
  title: string;
  speaker: string;
  type: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', speaker: '', type: 'SERMON', videoUrl: '', thumbnailUrl: '' });

  useEffect(() => {
    api.get('/media').then(r => { setMedia(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await api.post('/media', form);
      setMedia(prev => [r.data, ...prev]);
      setShowForm(false);
      setForm({ title: '', speaker: '', type: 'SERMON', videoUrl: '', thumbnailUrl: '' });
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media item?')) return;
    try { await api.delete(`/media/${id}`); setMedia(prev => prev.filter(m => m.id !== id)); } catch {}
  };

  const typeColors: Record<string, string> = {
    SERMON: 'bg-accent/20 text-accent',
    LIVESTREAM: 'bg-blue-500/20 text-blue-400',
    WORSHIP: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-primary-theme mb-1">Media Library</h1>
          <p className="text-muted-theme text-sm">Manage sermons, livestreams, and video content</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans">
          <Plus className="w-4 h-4" /> Add Media
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card-theme p-6 mb-8 rounded-xl border border-accent/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-primary-theme">Add New Media</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-theme hover:text-primary-theme"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Title *</label>
              <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" placeholder="Sermon title..." />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Speaker *</label>
              <input required value={form.speaker} onChange={e => setForm(p => ({...p, speaker: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" placeholder="Pastor Jeffrey Richards" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm">
                <option value="SERMON">Sermon</option>
                <option value="LIVESTREAM">Livestream</option>
                <option value="WORSHIP">Worship</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Video URL</label>
              <input value={form.videoUrl} onChange={e => setForm(p => ({...p, videoUrl: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" placeholder="https://youtube.com/..." />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Thumbnail URL</label>
              <input value={form.thumbnailUrl} onChange={e => setForm(p => ({...p, thumbnailUrl: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" placeholder="https://..." />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-theme hover:text-primary-theme transition-colors">Cancel</button>
              <button type="submit" className="btn-gold px-6 py-2 rounded-lg text-sm font-sans">Add Media</button>
            </div>
          </form>
        </div>
      )}

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-theme">Loading media...</div>
      ) : media.length === 0 ? (
        <div className="card-theme rounded-xl p-12 text-center">
          <Play className="w-12 h-12 text-muted-theme mx-auto mb-3" />
          <p className="text-muted-theme">No media uploaded yet. Add your first sermon above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {media.map(item => (
            <div key={item.id} className="card-theme rounded-xl border border-border-theme overflow-hidden group">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-surface-theme overflow-hidden">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-10 h-10 text-muted-theme" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {item.videoUrl && (
                    <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <Play className="w-5 h-5 text-black ml-0.5" />
                    </a>
                  )}
                </div>
                <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-sans font-medium ${typeColors[item.type] || 'bg-white/10 text-white'}`}>{item.type}</span>
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="font-serif text-base text-primary-theme mb-1 line-clamp-2">{item.title}</h3>
                <p className="text-muted-theme text-xs mb-3">Speaker: {item.speaker}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-theme">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-muted-theme hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
