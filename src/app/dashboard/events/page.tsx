'use client';
import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/utils/api';

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  registrationQuestion?: string;
  _count?: { rsvps: number };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', startTime: '', endTime: '', location: '', registrationQuestion: '' });

  useEffect(() => {
    api.get('/events').then(r => { setEvents(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await api.post('/events', form);
      setEvents(prev => [r.data, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', startTime: '', endTime: '', location: '', registrationQuestion: '' });
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try { await api.delete(`/events/${id}`); setEvents(prev => prev.filter(e => e.id !== id)); } catch {}
  };

  const grouped = events.reduce((acc, ev) => {
    const d = new Date(ev.startTime);
    const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {} as Record<string, Event[]>);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-primary-theme mb-1">Events & RSVPs</h1>
          <p className="text-muted-theme text-sm">Create and manage church events</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-card-theme border border-border-theme rounded-lg overflow-hidden">
            <button onClick={() => setView('list')} className={`px-4 py-2 text-sm font-sans transition-colors ${view === 'list' ? 'bg-accent text-black' : 'text-muted-theme hover:text-primary-theme'}`}>List View</button>
            <button onClick={() => setView('calendar')} className={`px-4 py-2 text-sm font-sans transition-colors ${view === 'calendar' ? 'bg-accent text-black' : 'text-muted-theme hover:text-primary-theme'}`}>Calendar View</button>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card-theme p-6 mb-8 rounded-xl border border-accent/30">
          <h2 className="font-serif text-xl text-primary-theme mb-4">New Event</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Event Title *</label>
              <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" placeholder="Sunday Service" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm resize-none" rows={2} placeholder="Event details..." />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Start Time *</label>
              <input required type="datetime-local" value={form.startTime} onChange={e => setForm(p => ({...p, startTime: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">End Time *</label>
              <input required type="datetime-local" value={form.endTime} onChange={e => setForm(p => ({...p, endTime: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Location</label>
              <input value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" placeholder="Main Sanctuary" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Registration Question</label>
              <input value={form.registrationQuestion} onChange={e => setForm(p => ({...p, registrationQuestion: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" placeholder="Optional RSVP question..." />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-theme hover:text-primary-theme transition-colors">Cancel</button>
              <button type="submit" className="btn-gold px-6 py-2 rounded-lg text-sm font-sans">Create Event</button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-theme">Loading events...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card-theme rounded-xl p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-theme mx-auto mb-3" />
          <p className="text-muted-theme">No events scheduled. Create your first event above.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, evs]) => (
            <div key={month}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">{month}</span>
                <div className="flex-1 h-px bg-border-theme" />
              </div>
              <div className="space-y-3">
                {evs.map(ev => {
                  const start = new Date(ev.startTime);
                  const end = new Date(ev.endTime);
                  const isExpanded = expandedId === ev.id;
                  return (
                    <div key={ev.id} className="card-theme rounded-xl border border-border-theme overflow-hidden">
                      <div className="flex items-start gap-4 p-5">
                        {/* Date Block */}
                        <div className="flex-shrink-0 w-14 h-14 bg-accent/10 border border-accent/20 rounded-lg flex flex-col items-center justify-center">
                          <span className="text-accent text-xs uppercase font-semibold">{start.toLocaleString('en-US', { month: 'short' })}</span>
                          <span className="text-primary-theme text-xl font-serif leading-none">{start.getDate()}</span>
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg text-primary-theme mb-1">{ev.title}</h3>
                          {ev.description && <p className="text-muted-theme text-sm mb-2 line-clamp-1">{ev.description}</p>}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-theme">
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{start.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} – {end.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                            {ev.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{ev.location}</span>}
                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{ev._count?.rsvps ?? 0} RSVPs</span>
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => setExpandedId(isExpanded ? null : ev.id)} className="p-2 text-muted-theme hover:text-primary-theme transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDelete(ev.id)} className="p-2 text-muted-theme hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {isExpanded && ev.registrationQuestion && (
                        <div className="border-t border-border-theme px-5 py-3 bg-surface-theme">
                          <span className="text-xs uppercase tracking-widest text-muted-theme">Registration Question: </span>
                          <span className="text-sm text-primary-theme">{ev.registrationQuestion}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
