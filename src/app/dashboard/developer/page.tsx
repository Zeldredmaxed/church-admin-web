'use client';
import { useState, useEffect } from 'react';
import { Code2, Bug, Lightbulb, CheckCircle, Clock, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/utils/api';

interface Ticket {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

export default function DeveloperPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/developer/tickets').then(r => { setTickets(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/developer/tickets/${id}`, { status });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ticket?')) return;
    try { await api.delete(`/developer/tickets/${id}`); setTickets(prev => prev.filter(t => t.id !== id)); } catch {}
  };

  const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);
  const counts = {
    ALL: tickets.length,
    OPEN: tickets.filter(t => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
  };

  const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    BUG: { label: 'Bug', icon: <Bug className="w-3.5 h-3.5" />, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    FEATURE: { label: 'Feature', icon: <Lightbulb className="w-3.5 h-3.5" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    OTHER: { label: 'Other', icon: <Code2 className="w-3.5 h-3.5" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  };

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    OPEN: { label: 'Open', icon: <Clock className="w-3 h-3" />, color: 'bg-yellow-500/20 text-yellow-400' },
    IN_PROGRESS: { label: 'In Progress', icon: <Loader2 className="w-3 h-3" />, color: 'bg-blue-500/20 text-blue-400' },
    RESOLVED: { label: 'Resolved', icon: <CheckCircle className="w-3 h-3" />, color: 'bg-green-500/20 text-green-400' },
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-primary-theme mb-1">Developer Requests</h1>
        <p className="text-muted-theme text-sm">Review support tickets submitted from the mobile app</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: counts.ALL, color: 'text-primary-theme' },
          { label: 'Open', value: counts.OPEN, color: 'text-yellow-400' },
          { label: 'In Progress', value: counts.IN_PROGRESS, color: 'text-blue-400' },
          { label: 'Resolved', value: counts.RESOLVED, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="card-theme rounded-xl p-4 border border-border-theme text-center">
            <div className={`font-serif text-3xl ${s.color} mb-1`}>{s.value}</div>
            <div className="text-xs text-muted-theme uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-sans transition-colors ${filter === f ? 'bg-accent text-black' : 'bg-card-theme text-muted-theme hover:text-primary-theme border border-border-theme'}`}>
            {f === 'ALL' ? 'All' : f === 'IN_PROGRESS' ? 'In Progress' : f.charAt(0) + f.slice(1).toLowerCase()} ({counts[f] ?? tickets.length})
          </button>
        ))}
      </div>

      {/* Tickets */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-theme">Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div className="card-theme rounded-xl p-12 text-center">
          <Code2 className="w-12 h-12 text-muted-theme mx-auto mb-3" />
          <p className="text-muted-theme">No tickets found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => {
            const tc = typeConfig[ticket.type] || typeConfig.OTHER;
            const sc = statusConfig[ticket.status] || statusConfig.OPEN;
            const isExpanded = expandedId === ticket.id;
            const initials = `${ticket.user?.firstName?.[0] ?? ''}${ticket.user?.lastName?.[0] ?? ''}`.toUpperCase();
            return (
              <div key={ticket.id} className="card-theme rounded-xl border border-border-theme overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <span className="text-accent text-sm font-semibold">{initials || '?'}</span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-primary-theme">
                        {ticket.user ? `${ticket.user.firstName} ${ticket.user.lastName}` : 'Unknown User'}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${tc.color}`}>{tc.icon}{tc.label}</span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${sc.color}`}>{sc.icon}{sc.label}</span>
                    </div>
                    <p className={`text-sm text-muted-theme ${isExpanded ? '' : 'line-clamp-2'}`}>{ticket.description}</p>
                    <span className="text-xs text-muted-theme mt-1 block">{new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setExpandedId(isExpanded ? null : ticket.id)} className="p-2 text-muted-theme hover:text-primary-theme transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(ticket.id)} className="p-2 text-muted-theme hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-border-theme px-5 py-3 bg-surface-theme">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-theme uppercase tracking-widest mr-2">Update Status:</span>
                      {(['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map(s => (
                        <button key={s} onClick={() => handleStatus(ticket.id, s)} className={`px-3 py-1 rounded-lg text-xs transition-colors border ${ticket.status === s ? statusConfig[s].color + ' border-current' : 'text-muted-theme border-border-theme hover:border-accent hover:text-accent'}`}>
                          {s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
