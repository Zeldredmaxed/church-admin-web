'use client';
import { useState, useEffect } from 'react';
import { User, Lock, Camera, Save, CheckCircle } from 'lucide-react';
import api from '@/utils/api';

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  profileImageUrl?: string;
  role?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({ firstName: '', lastName: '', email: '', phone: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'profile' | 'security'>('profile');
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(r => { setProfile(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/users/me', { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone, bio: profile.bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (passwords.newPass !== passwords.confirm) { setPwError('New passwords do not match.'); return; }
    if (passwords.newPass.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    try {
      await api.patch('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      setPwSaved(true);
      setPasswords({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setPwSaved(false), 3000);
    } catch { setPwError('Current password is incorrect.'); }
  };

  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-primary-theme mb-1">Settings</h1>
        <p className="text-muted-theme text-sm">Manage your admin profile and account security</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button onClick={() => setTab('profile')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans transition-colors ${tab === 'profile' ? 'bg-accent text-black' : 'bg-card-theme text-muted-theme hover:text-primary-theme border border-border-theme'}`}>
          <User className="w-4 h-4" /> My Profile
        </button>
        <button onClick={() => setTab('security')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans transition-colors ${tab === 'security' ? 'bg-accent text-black' : 'bg-card-theme text-muted-theme hover:text-primary-theme border border-border-theme'}`}>
          <Lock className="w-4 h-4" /> Security
        </button>
      </div>

      {tab === 'profile' ? (
        <div className="card-theme rounded-xl border border-border-theme overflow-hidden">
          {/* Avatar Section */}
          <div className="p-6 border-b border-border-theme bg-surface-theme">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center overflow-hidden">
                  {profile.profileImageUrl ? (
                    <img src={profile.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-serif text-2xl text-accent">{initials || '?'}</span>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg">
                  <Camera className="w-3.5 h-3.5 text-black" />
                </button>
              </div>
              <div>
                <h2 className="font-serif text-xl text-primary-theme">{profile.firstName} {profile.lastName}</h2>
                <p className="text-muted-theme text-sm">{profile.email}</p>
                {profile.role && <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">{profile.role}</span>}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">First Name</label>
                <input value={profile.firstName} onChange={e => setProfile(p => ({...p, firstName: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Last Name</label>
                <input value={profile.lastName} onChange={e => setProfile(p => ({...p, lastName: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Email Address</label>
              <input value={profile.email} disabled className="input-theme w-full rounded-lg px-4 py-2.5 text-sm opacity-50 cursor-not-allowed" />
              <p className="text-xs text-muted-theme mt-1">Email cannot be changed here. Contact support if needed.</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Phone Number</label>
              <input value={profile.phone ?? ''} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" placeholder="(317) 000-0000" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Bio</label>
              <textarea value={profile.bio ?? ''} onChange={e => setProfile(p => ({...p, bio: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm resize-none" rows={3} placeholder="A short bio..." />
            </div>
            <div className="flex items-center justify-between pt-2">
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-400">
                  <CheckCircle className="w-4 h-4" /> Profile saved successfully
                </span>
              )}
              <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-sans ml-auto">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card-theme rounded-xl border border-border-theme p-6">
          <h2 className="font-serif text-xl text-primary-theme mb-1">Change Password</h2>
          <p className="text-muted-theme text-sm mb-6">Choose a strong password of at least 8 characters.</p>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Current Password</label>
              <input type="password" required value={passwords.current} onChange={e => setPasswords(p => ({...p, current: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">New Password</label>
              <input type="password" required value={passwords.newPass} onChange={e => setPasswords(p => ({...p, newPass: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-theme mb-1">Confirm New Password</label>
              <input type="password" required value={passwords.confirm} onChange={e => setPasswords(p => ({...p, confirm: e.target.value}))} className="input-theme w-full rounded-lg px-4 py-2.5 text-sm" />
            </div>
            {pwError && <p className="text-sm text-red-400">{pwError}</p>}
            {pwSaved && <p className="flex items-center gap-1.5 text-sm text-green-400"><CheckCircle className="w-4 h-4" /> Password updated successfully</p>}
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-gold flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-sans">
                <Lock className="w-4 h-4" /> Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
