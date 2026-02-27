'use client';
import { useState, useEffect } from 'react';
import { Heart, CheckCircle, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/utils/api';

interface PrayerRequest {
  id: string;
  request: string;
  isAnonymous: boolean;
  status: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string; profileImageUrl?: string };
}

export default function PrayerPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/prayer').then(r => { setRequests(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/prayer/${id}`, { status });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prayer request?')) return;
    try { await api.delete(`/prayer/${id}`); setRequests(prev => prev.filter(r => r.id !== id)); } catch {}
  };

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter);
  const counts = { ALL: requests.length, PENDING: requests.filter(r => r.status === 'PENDING').length, PRAYED: requests.filter(r => r.status === 'PRAYED').length };

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <Clock className="w-3 h-3" /> },
    PRAYED: { label: 'Prayed', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle className="w-3 h-3" /> },
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-primary-theme mb-1">Prayer Wall</h1>
        <p className="text-muted-theme text-sm">Requests from the community</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Requests', value: counts.ALL, color: 'text-accent' },
          { label: 'Awaiting Prayer', value: counts.PENDING, color: 'text-yellow-400' },
          { label: 'Prayed Over', value: counts.PRAYED, color: 'text-green-400' },
        ].map(stat => (
          <div key={stat.label} className="card-theme rounded-xl p-4 border border-border-theme text-center">
            <div className={`font-serif text-3xl ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-xs text-muted-theme uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['ALL', 'PENDING', 'PRAYED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-sans transition-colors ${filter === f ? 'bg-accent text-black' : 'bg-card-theme text-muted-theme hover:text-primary-theme border border-border-theme'}`}>
            {f === 'ALL' ? 'All' : f === 'PENDING' ? 'Pending' : 'Prayed'} ({counts[f] ?? requests.length})
          </button>
        ))}
      </div>

      {/* Requests */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-theme">Loading prayer requests...</div>
      ) : filtered.length === 0 ? (
        <div className="card-theme rounded-xl p-12 text-center">
          <Heart className="w-12 h-12 text-muted-theme mx-auto mb-3" />
          <p className="text-muted-theme">No prayer requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const sc = statusConfig[req.status] || statusConfig.PENDING;
            const isExpanded = expandedId === req.id;
            const initials = req.isAnonymous ? '?' : `${req.user?.firstName?.[0] ?? ''}${req.user?.lastName?.[0] ?? ''}`;
            return (
              <div key={req.id} className="card-theme rounded-xl border border-border-theme overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                    {!req.isAnonymous && req.user?.profileImageUrl ? (
                      <img src={req.user.profileImageUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-accent text-sm font-semibold">{initials}</span>
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-primary-theme">
                        {req.isAnonymous ? 'Anonymous' : `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim() || 'Member'}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${sc.color}`}>
                        {sc.icon}{sc.label}
                      </span>
                    </div>
                    <p className={`text-sm text-muted-theme ${isExpanded ? '' : 'line-clamp-2'}`}>{req.request}</p>
                    <span className="text-xs text-muted-theme mt-1 block">{new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setExpandedId(isExpanded ? null : req.id)} className="p-2 text-muted-theme hover:text-primary-theme transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(req.id)} className="p-2 text-muted-theme hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-border-theme px-5 py-3 bg-surface-theme flex items-center gap-3">
                    <span className="text-xs text-muted-theme uppercase tracking-widest">Mark as:</span>
                    <button onClick={() => handleStatus(req.id, 'PENDING')} className={`px-3 py-1 rounded-lg text-xs transition-colors ${req.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'text-muted-theme hover:text-yellow-400'}`}>Pending</button>
                    <button onClick={() => handleStatus(req.id, 'PRAYED')} className={`px-3 py-1 rounded-lg text-xs transition-colors ${req.status === 'PRAYED' ? 'bg-green-500/20 text-green-400' : 'text-muted-theme hover:text-green-400'}`}>Prayed</button>
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
