'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import {
  Users, Calendar, Film, HandHeart, TrendingUp,
  Radio, Pin, Loader2, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function statusBadgeClass(status: string) {
  const s = status?.toLowerCase();
  if (s === 'active' || s === 'completed') return 'nb-badge nb-badge-green';
  if (s === 'pending') return 'nb-badge nb-badge-yellow';
  if (s === 'inactive') return 'nb-badge nb-badge-red';
  return 'nb-badge nb-badge-gold';
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats]                     = useState({ members: 0, events: 0, sermons: 0, prayers: 0 });
  const [recentActivity, setRecentActivity]   = useState<any[]>([]);
  const [pinnedAnnouncement, setPinned]        = useState<any>(null);
  const [nextEvent, setNextEvent]             = useState<any>(null);
  const [liveStreamEnabled, setLiveStream]    = useState(false);
  const [liveStreamLoading, setLiveLoading]   = useState(false);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [usersRes, eventsRes, mediaRes, prayerRes, announcementsRes, settingsRes] =
        await Promise.allSettled([
          api.get('/users'),
          api.get('/events'),
          api.get('/media'),
          api.get('/prayer-requests'),
          api.get('/announcements'),
          api.get('/system-settings'),
        ]);

      const users        = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
      const events       = eventsRes.status === 'fulfilled' ? eventsRes.value.data : [];
      const media        = mediaRes.status === 'fulfilled' ? mediaRes.value.data : [];
      const prayers      = prayerRes.status === 'fulfilled' ? prayerRes.value.data : [];
      const announcements= announcementsRes.status === 'fulfilled' ? announcementsRes.value.data : [];
      const settings     = settingsRes.status === 'fulfilled' ? settingsRes.value.data : [];

      setStats({
        members: Array.isArray(users) ? users.length : 0,
        events:  Array.isArray(events) ? events.length : 0,
        sermons: Array.isArray(media) ? media.length : 0,
        prayers: Array.isArray(prayers) ? prayers.length : 0,
      });

      // Recent activity from users
      if (Array.isArray(users)) {
        setRecentActivity(
          users.slice(0, 8).map((u: any) => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            action: 'Joined the church',
            date: new Date(u.createdAt),
            status: u.role === 'ADMIN' ? 'Admin' : 'Active',
          }))
        );
      }

      // Pinned announcement
      if (Array.isArray(announcements)) {
        const pinned = announcements.find((a: any) => a.isPinned);
        if (pinned) setPinned(pinned);
      }

      // Next upcoming event
      if (Array.isArray(events)) {
        const upcoming = events
          .filter((e: any) => new Date(e.startTime) > new Date())
          .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        if (upcoming[0]) setNextEvent(upcoming[0]);
      }

      // Live stream setting
      if (Array.isArray(settings)) {
        const ls = settings.find((s: any) => s.key === 'liveStreamEnabled');
        if (ls) setLiveStream(ls.value === 'true' || ls.value === true);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLiveStreamToggle(val: boolean) {
    setLiveLoading(true);
    try {
      await api.patch('/system-settings/liveStreamEnabled', { value: String(val) });
      setLiveStream(val);
    } catch {}
    setLiveLoading(false);
  }

  const statCards = [
    { label: 'Total Members',    value: stats.members, icon: Users,     href: '/dashboard/people',        sub: 'registered accounts' },
    { label: 'Upcoming Events',  value: stats.events,  icon: Calendar,  href: '/dashboard/events',        sub: 'scheduled events' },
    { label: 'Sermon Library',   value: stats.sermons, icon: Film,      href: '/dashboard/media',         sub: 'media items' },
    { label: 'Prayer Requests',  value: stats.prayers, icon: HandHeart, href: '/dashboard/prayer',        sub: 'open requests' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div className="nb-spinner" style={{ width: 32, height: 32 }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Welcome banner */}
      <div className="nb-card" style={{
        background: 'linear-gradient(135deg, rgba(201,169,110,0.12) 0%, rgba(201,169,110,0.04) 100%)',
        borderColor: 'rgba(201,169,110,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            Good morning, Pastor
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Here is what is happening at New Birth today.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`nb-badge ${liveStreamEnabled ? 'nb-badge-red' : 'nb-badge-gold'}`} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>
            {liveStreamEnabled ? '🔴 LIVE NOW' : 'OFFLINE'}
          </span>
          <label className="nb-toggle">
            <input
              type="checkbox"
              checked={liveStreamEnabled}
              onChange={e => handleLiveStreamToggle(e.target.checked)}
              disabled={liveStreamLoading}
            />
            <span className="nb-toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {statCards.map(({ label, value, icon: Icon, href, sub }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div className="nb-stat-card" style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <p className="nb-stat-label">{label}</p>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} style={{ color: 'var(--color-gold)' }} />
                </div>
              </div>
              <p className="nb-stat-value">{value.toLocaleString()}</p>
              <p className="nb-stat-sub">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main grid: Activity table + Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Recent Activity */}
        <div className="nb-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} style={{ color: 'var(--color-gold)' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-text)' }}>Recent Members</h3>
            </div>
            <Link href="/dashboard/people" className="btn-ghost" style={{ padding: '0.25rem 0.75rem', fontSize: '0.7rem' }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="nb-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Action</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-dim)', padding: '2rem' }}>
                      No recent activity
                    </td>
                  </tr>
                ) : (
                  recentActivity.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div className="nb-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                            {a.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span style={{ fontWeight: 500 }}>{a.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{a.action}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{formatDate(a.date.toISOString())}</td>
                      <td><span className={statusBadgeClass(a.status)}>{a.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Next Event */}
          {nextEvent && (
            <div className="nb-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Calendar size={15} style={{ color: 'var(--color-gold)' }} />
                <h3 style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Next Event
                </h3>
              </div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                {nextEvent.title}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-gold)' }}>
                {formatDate(nextEvent.startTime)}
              </p>
              {nextEvent.location && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '0.25rem' }}>
                  {nextEvent.location}
                </p>
              )}
            </div>
          )}

          {/* Pinned Announcement */}
          {pinnedAnnouncement && (
            <div className="nb-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Pin size={15} style={{ color: 'var(--color-gold)' }} />
                <h3 style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Pinned
                </h3>
              </div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9375rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                {pinnedAnnouncement.title}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {pinnedAnnouncement.content}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginTop: '0.75rem' }}>
                {formatRelativeTime(pinnedAnnouncement.createdAt)}
              </p>
            </div>
          )}

          {/* Quick Links */}
          <div className="nb-card">
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.875rem' }}>
              Quick Actions
            </h3>
            {[
              { label: 'Add Member',        href: '/dashboard/people' },
              { label: 'Create Event',      href: '/dashboard/events' },
              { label: 'Upload Sermon',     href: '/dashboard/media' },
              { label: 'New Announcement',  href: '/dashboard/announcements' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)',
                  textDecoration: 'none', color: 'var(--color-text-muted)', fontSize: '0.8125rem',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                <span>{label}</span>
                <ArrowRight size={13} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
