'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/utils/api';
import { Bug, Lightbulb, RefreshCw, Trash2 } from 'lucide-react';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

interface SupportTicket {
  id: string;
  type: 'BUG' | 'FEATURE';
  message: string;
  status: TicketStatus;
  createdAt: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string | null;
  } | null;
}

const STATUS_TABS: { key: TicketStatus | 'ALL'; label: string }[] = [
  { key: 'OPEN', label: 'Open' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
];

export default function DeveloperPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TicketStatus | 'ALL'>('OPEN');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get<SupportTicket[]>('/support');
      setTickets(res.data || []);
    } catch (err) {
      console.error('Failed to load support tickets', err);
      alert('Failed to load support tickets. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    if (activeTab === 'ALL') return tickets;
    return tickets.filter((t) => t.status === activeTab);
  }, [tickets, activeTab]);

  const handleStatusChange = async (ticket: SupportTicket, newStatus: TicketStatus) => {
    if (ticket.status === newStatus) return;
    try {
      setUpdatingId(ticket.id);
      await api.patch(`/support/${ticket.id}`, { status: newStatus });
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: newStatus } : t)),
      );
    } catch (err) {
      console.error('Failed to update ticket status', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Delete this ticket? This cannot be undone.')) return;
    try {
      setUpdatingId(ticketId);
      await api.delete(`/support/${ticketId}`);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    } catch (err) {
      console.error('Failed to delete ticket', err);
      alert('Failed to delete ticket. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const getUserInitials = (ticket: SupportTicket) => {
    const u = ticket.user;
    if (!u) return '?';
    const first = u.firstName?.[0] ?? '';
    const last = u.lastName?.[0] ?? '';
    const initials = (first + last).toUpperCase();
    if (initials) return initials;
    return u.email?.[0]?.toUpperCase() ?? '?';
  };

  const getUserName = (ticket: SupportTicket) => {
    const u = ticket.user;
    if (!u) return 'Unknown User';
    if (u.firstName || u.lastName) {
      return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    }
    return u.email ?? 'Unknown User';
  };

  const getTypeStyles = (type: SupportTicket['type']) => {
    if (type === 'BUG') {
      return {
        pill: 'bg-red-100 text-red-700',
        icon: <Bug className="w-4 h-4 text-red-600" />,
      };
    }
    return {
      pill: 'bg-blue-100 text-blue-700',
      icon: <Lightbulb className="w-4 h-4 text-blue-600" />,
    };
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developer Requests</h1>
          <p className="text-gray-500 mt-1">
            Review support tickets submitted from the mobile app.
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {loading && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
            Loading tickets...
          </div>
        )}

        {!loading && filteredTickets.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
            No tickets in this view.
          </div>
        )}

        {!loading &&
          filteredTickets.map((ticket) => {
            const typeStyles = getTypeStyles(ticket.type);
            return (
              <div
                key={ticket.id}
                className="rounded-xl border border-gray-200 bg-white p-4 flex gap-4"
              >
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {getUserInitials(ticket)}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getUserName(ticket)}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${typeStyles.pill}`}
                      >
                        {typeStyles.icon}
                        {ticket.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700 whitespace-pre-line mb-3">
                    {ticket.message}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-500">
                        Status:
                      </label>
                      <select
                        value={ticket.status}
                        disabled={updatingId === ticket.id}
                        onChange={(e) =>
                          handleStatusChange(
                            ticket,
                            e.target.value as TicketStatus,
                          )
                        }
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleDelete(ticket.id)}
                      disabled={updatingId === ticket.id}
                      className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Sidebar note */}
      <p className="mt-8 text-xs text-gray-400">
        Note: Add a link to this page in the main dashboard sidebar for quick access
        (e.g., &quot;Developer&quot; under Settings).
      </p>
    </div>
  );
}
