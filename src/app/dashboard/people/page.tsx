'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
  Search, Plus, Filter, MessageSquare, Tag as TagIcon,
  X, Edit2, User, ChevronDown, ChevronUp, Trash2, Check,
} from 'lucide-react';

const PERMISSIONS = [
  { key: 'SUPER_ADMIN',          label: 'Full Access (Pastor)' },
  { key: 'MANAGE_PEOPLE',        label: 'Manage People & Tags' },
  { key: 'MANAGE_EVENTS',        label: 'Events & Calendar' },
  { key: 'MANAGE_MEDIA',         label: 'Media & Sermons' },
  { key: 'MANAGE_PRAYER',        label: 'Prayer Wall' },
  { key: 'MANAGE_ANNOUNCEMENTS', label: 'Announcements' },
  { key: 'MANAGE_FINANCE',       label: 'Giving & Finances' },
  { key: 'MANAGE_CHAT',          label: 'Chat Moderation' },
  { key: 'MANAGE_SUPPORT',       label: 'Support & Bugs' },
];

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

export default function PeoplePage() {
  const [users, setUsers]   = useState<any[]>([]);
  const [tags, setTags]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter]     = useState('All');
  const [membershipFilter, setMembershipFilter] = useState('All');

  // Edit modal
  const [editUser, setEditUser]     = useState<any | null>(null);
  const [editRole, setEditRole]     = useState('');
  const [editPerms, setEditPerms]   = useState<string[]>([]);
  const [editGender, setEditGender] = useState('');
  const [editMarital, setEditMarital] = useState('');
  const [editMembership, setEditMembership] = useState('');
  const [editBaptized, setEditBaptized] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tag modal
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName]     = useState('');
  const [newTagColor, setNewTagColor]   = useState('#c9a96e');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [usersRes, tagsRes] = await Promise.all([
        api.get('/users'),
        api.get('/tags'),
      ]);
      setUsers(usersRes.data);
      setTags(tagsRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openEdit(user: any) {
    setEditUser(user);
    setEditRole(user.role ?? 'MEMBER');
    setEditPerms(user.adminPermissions ?? []);
    setEditGender(user.gender ?? '');
    setEditMarital(user.maritalStatus ?? '');
    setEditMembership(user.membershipStatus ?? '');
    setEditBaptized(user.isBaptized ?? false);
  }

  async function saveEdit() {
    if (!editUser) return;
    setSaving(true);
    try {
      await api.patch(`/users/${editUser.id}`, {
        role: editRole,
        adminPermissions: editPerms,
        gender: editGender,
        maritalStatus: editMarital,
        membershipStatus: editMembership,
        isBaptized: editBaptized,
      });
      await fetchData();
      setEditUser(null);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function deleteUser(id: string) {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) { console.error(e); }
  }

  async function createTag() {
    if (!newTagName.trim()) return;
    try {
      await api.post('/tags', { name: newTagName.trim(), color: newTagColor });
      setNewTagName('');
      setShowTagModal(false);
      fetchData();
    } catch (e) { console.error(e); }
  }

  async function assignTag(userId: string, tagId: string) {
    try {
      await api.post(`/users/${userId}/tags`, { tagId });
      fetchData();
    } catch (e) { console.error(e); }
  }

  async function removeTag(userId: string, tagId: string) {
    try {
      await api.delete(`/users/${userId}/tags/${tagId}`);
      fetchData();
    } catch (e) { console.error(e); }
  }

  const filtered = users.filter(u => {
    const name = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (genderFilter !== 'All' && u.gender !== genderFilter) return false;
    if (membershipFilter !== 'All' && u.membershipStatus !== membershipFilter) return false;
    return true;
  });

  const roleColor = (role: string) => {
    if (role === 'ADMIN') return 'nb-badge nb-badge-gold';
    if (role === 'LEADER') return 'nb-badge nb-badge-blue';
    return 'nb-badge nb-badge-green';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {filtered.length} member{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button className="btn-ghost" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} /> Filters
          </button>
          <button className="btn-ghost" onClick={() => setShowTagModal(true)}>
            <TagIcon size={14} /> Manage Tags
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="nb-search">
        <Search size={15} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search members by name or email…"
          style={{ width: '100%', maxWidth: 420 }}
        />
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="nb-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.25rem' }}>
          <div style={{ minWidth: 140 }}>
            <label>Gender</label>
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
              <option>All</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div style={{ minWidth: 180 }}>
            <label>Membership Status</label>
            <select value={membershipFilter} onChange={e => setMembershipFilter(e.target.value)}>
              <option>All</option>
              <option>Active Member</option>
              <option>New Member</option>
              <option>Visitor</option>
              <option>Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-ghost" onClick={() => { setGenderFilter('All'); setMembershipFilter('All'); }}>
              <X size={13} /> Clear
            </button>
          </div>
        </div>
      )}

      {/* Members table */}
      <div className="nb-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="nb-spinner" style={{ width: 28, height: 28 }}></div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="nb-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Membership</th>
                  <th>Tags</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-dim)', padding: '2.5rem' }}>
                      No members found
                    </td>
                  </tr>
                ) : filtered.map(u => (
                  <>
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div className="nb-avatar">
                            {u.avatarUrl
                              ? <img src={u.avatarUrl} alt="" />
                              : getInitials(u.firstName, u.lastName)
                            }
                          </div>
                          <div>
                            <p style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                              {u.firstName} {u.lastName}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className={roleColor(u.role)}>{u.role}</span></td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          {u.membershipStatus ?? '—'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {(u.tags ?? []).slice(0, 3).map((ut: any) => (
                            <span
                              key={ut.tag?.id}
                              className="nb-badge"
                              style={{ background: `${ut.tag?.color}22`, color: ut.tag?.color, border: `1px solid ${ut.tag?.color}44` }}
                            >
                              {ut.tag?.name}
                            </span>
                          ))}
                          {(u.tags ?? []).length > 3 && (
                            <span className="nb-badge nb-badge-gold">+{u.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                          <button
                            className="btn-ghost"
                            style={{ padding: '0.3rem 0.6rem' }}
                            onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                            title="Expand details"
                          >
                            {expandedUser === u.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button
                            className="btn-ghost"
                            style={{ padding: '0.3rem 0.6rem' }}
                            onClick={() => openEdit(u)}
                            title="Edit member"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn-ghost"
                            style={{ padding: '0.3rem 0.6rem', borderColor: 'rgba(248,113,113,0.3)', color: 'var(--color-danger)' }}
                            onClick={() => deleteUser(u.id)}
                            title="Remove member"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedUser === u.id && (
                      <tr key={`${u.id}-expanded`}>
                        <td colSpan={6} style={{ background: 'var(--color-surface2)', padding: '1.25rem 1.5rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                            {[
                              ['Phone', u.phone],
                              ['Gender', u.gender],
                              ['Marital Status', u.maritalStatus],
                              ['Baptized', u.isBaptized ? 'Yes' : 'No'],
                              ['Attendance', u.attendanceFreq],
                              ['Discipleship Stage', u.discipleshipStage],
                            ].map(([label, value]) => (
                              <div key={label as string}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '0.2rem' }}>
                                  {label}
                                </p>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                  {(value as string) ?? '—'}
                                </p>
                              </div>
                            ))}
                          </div>
                          {/* Tag assignment */}
                          <div style={{ marginTop: '1rem' }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)', marginBottom: '0.5rem' }}>
                              Assign Tags
                            </p>
                            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                              {tags.map((tag: any) => {
                                const assigned = (u.tags ?? []).some((ut: any) => ut.tag?.id === tag.id);
                                return (
                                  <button
                                    key={tag.id}
                                    onClick={() => assigned ? removeTag(u.id, tag.id) : assignTag(u.id, tag.id)}
                                    className="nb-badge"
                                    style={{
                                      background: assigned ? `${tag.color}33` : 'transparent',
                                      color: tag.color,
                                      border: `1px solid ${tag.color}55`,
                                      cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    }}
                                  >
                                    {assigned && <Check size={10} />}
                                    {tag.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="nb-modal-overlay" onClick={e => e.target === e.currentTarget && setEditUser(null)}>
          <div className="nb-modal">
            <div className="nb-modal-header">
              <h3 className="font-serif" style={{ fontSize: '1.125rem', color: 'var(--color-text)' }}>
                Edit Member — {editUser.firstName} {editUser.lastName}
              </h3>
              <button onClick={() => setEditUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Role</label>
                  <select value={editRole} onChange={e => setEditRole(e.target.value)}>
                    <option value="MEMBER">Member</option>
                    <option value="LEADER">Leader</option>
                    <option value="ADMIN">Admin</option>
                    <option value="GUEST">Guest</option>
                  </select>
                </div>
                <div>
                  <label>Gender</label>
                  <select value={editGender} onChange={e => setEditGender(e.target.value)}>
                    <option value="">Not specified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label>Marital Status</label>
                  <select value={editMarital} onChange={e => setEditMarital(e.target.value)}>
                    <option value="">Not specified</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label>Membership Status</label>
                  <select value={editMembership} onChange={e => setEditMembership(e.target.value)}>
                    <option value="">Not specified</option>
                    <option value="Active Member">Active Member</option>
                    <option value="New Member">New Member</option>
                    <option value="Visitor">Visitor</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label className="nb-toggle">
                  <input type="checkbox" checked={editBaptized} onChange={e => setEditBaptized(e.target.checked)} />
                  <span className="nb-toggle-slider"></span>
                </label>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Baptized</span>
              </div>

              {(editRole === 'ADMIN' || editRole === 'LEADER') && (
                <div>
                  <label style={{ marginBottom: '0.625rem' }}>Admin Permissions</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {PERMISSIONS.map(p => (
                      <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textTransform: 'none', letterSpacing: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editPerms.includes(p.key)}
                          onChange={e => setEditPerms(prev =>
                            e.target.checked ? [...prev, p.key] : prev.filter(x => x !== p.key)
                          )}
                          style={{ width: 'auto' }}
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
                <button className="btn-primary" onClick={saveEdit} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <div className="nb-modal-overlay" onClick={e => e.target === e.currentTarget && setShowTagModal(false)}>
          <div className="nb-modal" style={{ maxWidth: 420 }}>
            <div className="nb-modal-header">
              <h3 className="font-serif" style={{ fontSize: '1.125rem', color: 'var(--color-text)' }}>Manage Tags</h3>
              <button onClick={() => setShowTagModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Existing tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.25rem' }}>
              {tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="nb-badge"
                  style={{ background: `${tag.color}22`, color: tag.color, border: `1px solid ${tag.color}44` }}
                >
                  {tag.name}
                </span>
              ))}
              {tags.length === 0 && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-dim)' }}>No tags created yet.</p>
              )}
            </div>

            <hr className="nb-divider" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label>New Tag Name</label>
                <input
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="e.g. Iron & Fire, Choir, Usher"
                />
              </div>
              <div>
                <label>Tag Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} style={{ width: 44, height: 36, padding: '2px', cursor: 'pointer' }} />
                  <span className="nb-badge" style={{ background: `${newTagColor}22`, color: newTagColor, border: `1px solid ${newTagColor}44` }}>
                    {newTagName || 'Preview'}
                  </span>
                </div>
              </div>
              <button className="btn-primary" onClick={createTag} style={{ alignSelf: 'flex-start' }}>
                <Plus size={14} /> Create Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
