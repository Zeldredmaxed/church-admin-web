'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, X } from 'lucide-react';
import api from '@/utils/api';

interface Highlight {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  note?: string;
  createdAt: string;
}

const BOOKS = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];

export default function BiblePage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ book: 'John', chapter: '1', verse: '1', note: '' });

  useEffect(() => {
    api.get('/bible/highlights').then(r => { setHighlights(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await api.post('/bible/highlights', { book: form.book, chapter: parseInt(form.chapter), verse: parseInt(form.verse), note: form.note || undefined });
      setHighlights(prev => [r.data, ...prev]);
      setShowForm(false);
      setForm({ book: 'John', chapter: '1', verse: '1', note: '' });
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this highlight?')) return;
    try { await api.delete(`/bible/highlights/${id}`); setHighlights(prev => prev.filter(h => h.id !== id)); } catch {}
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-primary-theme mb-1">Pastor's Bible Highlights</h1>
          <p className="text-muted-theme text-sm">Manage and organize key scriptures for upcoming sermons</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans">
          <Plus className="w-4 h-4" /> Highlight Verse
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card-theme p-6 mb-8 rounded-xl border border-accent/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-primary-theme">Add Scripture Highlight</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-theme hover:text-primary-theme"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Book *</label>
              <select required value={form.book} onChange={e => setForm(p => ({...p, book: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm">
                {BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Chapter *</label>
              <input required type="number" min="1" value={form.chapter} onChange={e => setForm(p => ({...p, chapter: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Verse *</label>
              <input required type="number" min="1" value={form.verse} onChange={e => setForm(p => ({...p, verse: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Note (Optional)</label>
              <input value={form.note} onChange={e => setForm(p => ({...p, note: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" placeholder="E.g. Theme of redemption..." />
            </div>
            <div className="md:col-span-3 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-theme hover:text-primary-theme transition-colors">Cancel</button>
              <button type="submit" className="btn-gold px-6 py-2 rounded-lg text-sm font-sans">Save Highlight</button>
            </div>
          </form>
        </div>
      )}

      {/* Highlights Table */}
      <div className="card-theme rounded-xl border border-border-theme overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border-theme">
          <h2 className="font-serif text-xl text-primary-theme">Saved Highlights</h2>
          <span className="text-xs text-muted-theme">{highlights.length} saved</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40 text-muted-theme">Loading highlights...</div>
        ) : highlights.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-theme mx-auto mb-3" />
            <p className="text-muted-theme">No highlights saved yet. Add your first scripture above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-theme">
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-muted-theme font-medium">Reference</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-muted-theme font-medium">Note</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-muted-theme font-medium">Date Added</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-muted-theme font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {highlights.map((h, i) => (
                  <tr key={h.id} className={`border-b border-border-theme/50 hover:bg-surface-theme transition-colors ${i % 2 === 0 ? '' : 'bg-surface-theme/30'}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-sm font-medium text-primary-theme">{h.book} {h.chapter}:{h.verse}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-theme">{h.note || <span className="italic opacity-50">No note added</span>}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-theme">{new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => handleDelete(h.id)} className="p-1.5 text-muted-theme hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
