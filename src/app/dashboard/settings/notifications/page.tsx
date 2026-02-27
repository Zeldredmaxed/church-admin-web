'use client';
import { useState, useEffect } from 'react';
import { Bell, Save, CheckCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';

interface NotifSettings {
  forceAnnouncements: boolean;
  forceSermons: boolean;
  forceChat: boolean;
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotifSettings>({ forceAnnouncements: false, forceSermons: false, forceChat: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings/notifications').then(r => { setSettings(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/settings/notifications', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const rules = [
    { key: 'forceAnnouncements' as const, label: 'Force Announcement Alerts', desc: 'All members will receive announcement notifications regardless of their preferences' },
    { key: 'forceSermons' as const, label: 'Force Sermon Alerts', desc: 'All members will receive sermon notifications regardless of their preferences' },
    { key: 'forceChat' as const, label: 'Force Chat Alerts', desc: 'All members will receive chat notifications regardless of their preferences' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Back Link */}
      <Link href="/dashboard/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-theme hover:text-primary-theme transition-colors mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Settings
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-primary-theme mb-1">Notification Rules</h1>
          <p className="text-muted-theme text-sm">Toggle ON to force notifications for all members. Toggle OFF to let them decide.</p>
        </div>
        <Bell className="w-8 h-8 text-accent opacity-60" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-theme">Loading settings...</div>
      ) : (
        <div className="card-theme rounded-xl border border-border-theme overflow-hidden">
          <div className="divide-y divide-border-theme">
            {rules.map(rule => (
              <div key={rule.key} className="flex items-center justify-between p-5 hover:bg-surface-theme transition-colors">
                <div className="flex-1 pr-6">
                  <h3 className="text-sm font-medium text-primary-theme mb-0.5">{rule.label}</h3>
                  <p className="text-xs text-muted-theme">{rule.desc}</p>
                </div>
                {/* Toggle Switch */}
                <button
                  onClick={() => setSettings(p => ({ ...p, [rule.key]: !p[rule.key] }))}
                  className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${settings[rule.key] ? 'bg-accent' : 'bg-surface-theme border border-border-theme'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${settings[rule.key] ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>

          {/* Save Footer */}
          <div className="p-5 border-t border-border-theme bg-surface-theme flex items-center justify-between">
            {saved ? (
              <span className="flex items-center gap-1.5 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" /> Settings saved successfully
              </span>
            ) : (
              <span className="text-xs text-muted-theme">Changes are applied to all members immediately.</span>
            )}
            <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-sans">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
