'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutGrid, Users, Calendar, Film, Megaphone, Heart,
  MessageSquare, Settings, Bell, HandHeart, BookOpen,
  Code, ChevronRight, LogOut, Menu, Church,
} from 'lucide-react';

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
}

const menuItems = [
  { href: '/dashboard',                        label: 'Dashboard',         icon: LayoutGrid },
  { href: '/dashboard/people',                 label: 'People & Tags',     icon: Users },
  { href: '/dashboard/events',                 label: 'Events & RSVPs',    icon: Calendar },
  { href: '/dashboard/media',                  label: 'Media Library',     icon: Film },
  { href: '/dashboard/prayer',                 label: 'Prayer Requests',   icon: HandHeart },
  { href: '/dashboard/announcements',          label: 'Announcements',     icon: Megaphone },
  { href: '/dashboard/finances',               label: 'Giving / Finances', icon: Heart },
  { href: '/dashboard/chat',                   label: 'Chat Moderation',   icon: MessageSquare },
  { href: '/dashboard/bible',                  label: 'Bible Highlights',  icon: BookOpen },
  { href: '/dashboard/developer',              label: 'Developer',         icon: Code },
];

const bottomItems = [
  { href: '/dashboard/settings',               label: 'Settings',          icon: Settings },
  { href: '/dashboard/settings/notifications', label: 'Notifications',     icon: Bell },
];

function getInitials(user: User | null) {
  if (!user) return 'NB';
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'NB';
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]               = useState<User | null>(null);
  const [loading, setLoading]         = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token   = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token) { router.push('/'); return; }
      if (userStr) { try { setUser(JSON.parse(userStr)); } catch {} }
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const currentLabel =
    menuItems.find(m => isActive(m.href))?.label ??
    bottomItems.find(m => isActive(m.href))?.label ??
    'Dashboard';

  if (loading) {
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="nb-spinner" style={{ width: 32, height: 32 }}></div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`nb-sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="nb-sidebar-logo">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '1px solid var(--color-border)',
              background: 'rgba(201,169,110,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Church size={17} style={{ color: 'var(--color-gold)' }} />
            </div>
            <div>
              <p className="font-serif" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>
                New Birth
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', letterSpacing: '0.05em' }}>
                Admin Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="nb-sidebar-nav">
          <p style={{ padding: '0 0.75rem', marginBottom: '0.5rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-dim)' }}>
            Management
          </p>
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nb-nav-item${isActive(href) ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} />
              <span>{label}</span>
              {isActive(href) && <ChevronRight size={13} style={{ marginLeft: 'auto', color: 'var(--color-gold)' }} />}
            </Link>
          ))}

          <hr className="nb-divider" style={{ margin: '0.875rem 0.5rem' }} />

          <p style={{ padding: '0 0.75rem', marginBottom: '0.5rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-dim)' }}>
            System
          </p>
          {bottomItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nb-nav-item${isActive(href) ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="nb-avatar">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" /> : getInitials(user)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{ padding: '0.375rem', borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="nb-main">
        {/* Top bar */}
        <header className="nb-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="md:hidden"
              style={{ padding: '0.5rem', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="font-serif" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text)' }}>
              {currentLabel}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              href="/dashboard/settings/notifications"
              style={{ padding: '0.5rem', borderRadius: 8, color: 'var(--color-text-muted)', display: 'flex' }}
            >
              <Bell size={18} />
            </Link>
            <div className="nb-avatar" style={{ width: 34, height: 34, fontSize: '0.7rem' }}>
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" /> : getInitials(user)}
            </div>
          </div>
        </header>

        <main style={{ padding: '1.5rem' }} className="animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}
