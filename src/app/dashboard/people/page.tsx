'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import { Search, Plus, Filter, MessageSquare, Tag as TagIcon, X, Edit2, Check, User, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = 'http://localhost:3000';

const PERMISSIONS = [
  { key: 'SUPER_ADMIN', label: 'Full Access (Pastor)' },
  { key: 'MANAGE_PEOPLE', label: 'Manage People & Tags' },
  { key: 'MANAGE_EVENTS', label: 'Events & Calendar' },
  { key: 'MANAGE_MEDIA', label: 'Media & Sermons' },
  { key: 'MANAGE_PRAYER', label: 'Prayer Wall' },
  { key: 'MANAGE_ANNOUNCEMENTS', label: 'Announcements' },
  { key: 'MANAGE_FINANCE', label: 'Giving & Finances' },
  { key: 'MANAGE_CHAT', label: 'Chat Moderation' },
];

export default function PeoplePage() {
  const router = useRouter();
  
  // --- DATA STATE ---
  const [users, setUsers] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- FILTER STATE ---
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [genderFilter, setGenderFilter] = useState('All');
  const [maritalFilter, setMaritalFilter] = useState('All');
  const [ageGroup, setAgeGroup] = useState('All');
  const [membershipStatus, setMembershipStatus] = useState('All');
  const [ministryInterest, setMinistryInterest] = useState('All');
  const [attendanceFreq, setAttendanceFreq] = useState('All');
  
  // Boolean Filters
  const [isBaptized, setIsBaptized] = useState(false);
  const [isNewMember, setIsNewMember] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [pastoralCare, setPastoralCare] = useState(false);

  // --- EDIT USER MODAL STATE ---
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('Basic'); 

  // Edit Form Fields
  const [editGender, setEditGender] = useState('');
  const [editMarital, setEditMarital] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editParenting, setEditParenting] = useState('');
  const [editSingleParent, setEditSingleParent] = useState(false);
  const [editMembership, setEditMembership] = useState('');
  const [editIsBaptized, setEditIsBaptized] = useState(false);
  const [editMinistrySkills, setEditMinistrySkills] = useState('');
  const [editPastoralCareNeeded, setEditPastoralCareNeeded] = useState(false);
  const [editCareTypes, setEditCareTypes] = useState('');
  const [editLifeEvents, setEditLifeEvents] = useState('');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  
  // Tag Modal
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#1976D2');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, tagsRes] = await Promise.all([
        api.get('/users'),
        api.get('/tags')
      ]);
      setUsers(usersRes.data);
      setTags(tagsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTER LOGIC ---
  const applyFilter = async () => {
    setLoading(true);
    try {
      // Calculate Age Logic
      let minAge, maxAge;
      if (ageGroup !== 'All') {
        switch (ageGroup) {
          case 'Child': minAge = 0; maxAge = 12; break;
          case 'Youth': minAge = 13; maxAge = 18; break;
          case 'Young Adult': minAge = 19; maxAge = 29; break;
          case 'Adult': minAge = 30; maxAge = 64; break;
          case 'Senior': minAge = 65; maxAge = 120; break;
        }
      }

      const criteria = {
        gender: genderFilter !== 'All' ? genderFilter : undefined,
        maritalStatus: maritalFilter !== 'All' ? maritalFilter : undefined,
        membershipStatus: membershipStatus !== 'All' ? membershipStatus : undefined,
        ministryInterest: ministryInterest !== 'All' ? ministryInterest : undefined,
        attendanceFreq: attendanceFreq !== 'All' ? attendanceFreq : undefined,
        isBaptized: isBaptized ? true : undefined,
        isNewMember: isNewMember ? true : undefined,
        hasChildren: hasChildren ? true : undefined,
        pastoralCareNeeded: pastoralCare ? true : undefined,
        minAge,
        maxAge
      };

      const response = await api.post('/users/filter', criteria);
      setUsers(response.data);
    } catch (error) {
      console.error('Filter error:', error);
      alert('Filter failed. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setGenderFilter('All');
    setMaritalFilter('All');
    setAgeGroup('All');
    setMembershipStatus('All');
    setMinistryInterest('All');
    setIsBaptized(false);
    setIsNewMember(false);
    fetchData();
  };

  const messageFilteredGroup = async () => {
    const groupName = prompt(`Name this group (${users.length} people):`);
    if (!groupName) return;
    try {
      const adminUser = JSON.parse(localStorage.getItem('user') || '{}');
      await api.post('/chat/group', {
        name: groupName,
        adminId: adminUser.id,
        memberIds: users.map(u => u.id)
      });
      router.push('/dashboard/chat');
    } catch (error) {
      alert('Could not create group');
    }
  };

  // --- EDIT USER LOGIC ---
  const openEditUser = (user: any) => {
    setSelectedUser(user);
    setEditGender(user.gender || '');
    setEditMarital(user.maritalStatus || '');
    setEditDob(user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
    setEditParenting(user.parentingStage || '');
    setEditSingleParent(user.singleParent || false);
    setEditMembership(user.membershipStatus || '');
    setEditIsBaptized(user.isBaptized || false);
    // Arrays to string
    setEditMinistrySkills(user.ministrySkills ? user.ministrySkills.join(', ') : '');
    setEditPastoralCareNeeded(user.pastoralCareNeeded || false);
    setEditCareTypes(user.careTypes ? user.careTypes.join(', ') : '');
    setEditLifeEvents(user.lifeEvents ? user.lifeEvents.join(', ') : '');
    setEditPermissions(user.adminPermissions || []);
    
    setShowEditUserModal(true);
  };

  const saveUserDemographics = async () => {
    if (!selectedUser) return;
    try {
      const toArray = (str: string) => str ? str.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
      
      const payload = {
        gender: editGender,
        maritalStatus: editMarital,
        dateOfBirth: editDob ? new Date(editDob).toISOString() : undefined,
        parentingStage: editParenting,
        singleParent: editSingleParent,
        membershipStatus: editMembership,
        isBaptized: editIsBaptized,
        ministrySkills: toArray(editMinistrySkills),
        pastoralCareNeeded: editPastoralCareNeeded,
        careTypes: toArray(editCareTypes),
        lifeEvents: toArray(editLifeEvents),
        adminPermissions: editPermissions,
      };

      await api.patch(`/users/${selectedUser.id}`, payload);
      setShowEditUserModal(false);
      fetchData();
      alert('User updated!');
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save changes.');
    }
  };

  // --- TAG LOGIC ---
  const createTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tags', { name: newTagName, color: newTagColor });
      setShowTagModal(false);
      setNewTagName('');
      const res = await api.get('/tags');
      setTags(res.data);
    } catch (error) { alert('Error creating tag'); }
  };

  const toggleTagForUser = async (tagId: string, hasTag: boolean) => {
    if (!selectedUser) return;
    try {
      if (hasTag) await api.delete(`/tags/${tagId}/users/${selectedUser.id}`);
      else await api.post(`/tags/${tagId}/users`, { userId: selectedUser.id });
      
      const res = await api.get(`/users/${selectedUser.id}`);
      setSelectedUser(res.data);
      setUsers(users.map(u => u.id === selectedUser.id ? res.data : u));
    } catch (error) { console.error('Tag error', error); }
  };

  // Helper
  const getAvatarUrl = (url?: string) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${API_BASE}${url}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">People Directory</h1>
          <p className="text-gray-500">Manage {users.length} members</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTagModal(true)} className="px-4 py-2 bg-white border rounded hover:bg-gray-50">
            Manage Tags
          </button>
          <button onClick={() => setShowFilterPanel(!showFilterPanel)} className={`px-4 py-2 rounded flex items-center gap-2 ${showFilterPanel ? 'bg-blue-100 text-blue-700' : 'bg-blue-600 text-white'}`}>
            <Filter size={18} /> {showFilterPanel ? 'Hide Filters' : 'Filters'}
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE FILTER PANEL */}
      {showFilterPanel && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Demographics */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-700 text-sm uppercase">Demographics</h4>
              <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="w-full border rounded p-2 text-sm">
                <option value="All">Gender: All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select value={maritalFilter} onChange={e => setMaritalFilter(e.target.value)} className="w-full border rounded p-2 text-sm">
                <option value="All">Marital: All</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
              <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} className="w-full border rounded p-2 text-sm">
                <option value="All">Age Group: All</option>
                <option value="Child">Child (0-12)</option>
                <option value="Youth">Youth (13-18)</option>
                <option value="Young Adult">Young Adult (19-29)</option>
                <option value="Adult">Adult (30-64)</option>
                <option value="Senior">Senior (65+)</option>
              </select>
            </div>

            {/* Spiritual & Ministry */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-700 text-sm uppercase">Ministry</h4>
              <select value={membershipStatus} onChange={e => setMembershipStatus(e.target.value)} className="w-full border rounded p-2 text-sm">
                <option value="All">Status: All</option>
                <option value="Member">Member</option>
                <option value="Visitor">Visitor</option>
                <option value="Leadership">Leadership</option>
              </select>
              <select value={ministryInterest} onChange={e => setMinistryInterest(e.target.value)} className="w-full border rounded p-2 text-sm">
                <option value="All">Interest: All</option>
                <option value="Worship">Worship</option>
                <option value="Tech">Tech</option>
                <option value="Youth">Youth</option>
                <option value="Kids">Children's Ministry</option>
              </select>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isBaptized} onChange={e => setIsBaptized(e.target.checked)} /> Baptized</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isNewMember} onChange={e => setIsNewMember(e.target.checked)} /> New Member</label>
              </div>
            </div>

            {/* Care & Family */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-700 text-sm uppercase">Care & Family</h4>
              <select value={attendanceFreq} onChange={e => setAttendanceFreq(e.target.value)} className="w-full border rounded p-2 text-sm">
                <option value="All">Attendance: All</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Occasional">Occasional</option>
              </select>
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hasChildren} onChange={e => setHasChildren(e.target.checked)} /> Has Children</label>
                <label className="flex items-center gap-2 text-sm text-red-600 font-medium"><input type="checkbox" checked={pastoralCare} onChange={e => setPastoralCare(e.target.checked)} /> Needs Pastoral Care</label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between border-t pt-4">
            <button onClick={clearFilters} className="text-gray-500 hover:text-black text-sm">Reset All</button>
            <div className="flex gap-3">
              <button onClick={applyFilter} className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Apply Filters</button>
              <button onClick={messageFilteredGroup} className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 flex items-center gap-2">
                <MessageSquare size={16} /> Message These {users.length}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tags</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => {
              const avatar = getAvatarUrl(user.avatarUrl);
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    {avatar ? 
                      <img src={avatar} className="w-10 h-10 rounded-full object-cover" /> :
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{user.firstName[0]}</div>
                    }
                    <div>
                      <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{user.membershipStatus || 'Visitor'}</div>
                    <div className="text-xs text-gray-500">{user.gender} • {user.ageGroup || user.maritalStatus}</div>
                  </td>
                  <td className="px-6 py-4 flex flex-wrap gap-1">
                    {user.tags.map((t: any) => (
                      <span key={t.tag.id} style={{backgroundColor: t.tag.color}} className="px-2 py-0.5 rounded text-xs text-white">{t.tag.name}</span>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEditUser(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><Edit2 size={18}/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Edit Profile</h3>
              <button onClick={() => setShowEditUserModal(false)}><X size={24}/></button>
            </div>
            
            <div className="flex border-b">
              {['Basic', 'Family', 'Ministry', 'Care', ...(selectedUser.role === 'ADMIN' ? ['Permissions'] : [])].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {activeTab === 'Basic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 text-center mb-4">
                    <h4 className="font-bold text-lg">{selectedUser.firstName} {selectedUser.lastName}</h4>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Gender</label>
                    <select value={editGender} onChange={e => setEditGender(e.target.value)} className="w-full border p-2 rounded">
                      <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Marital Status</label>
                    <select value={editMarital} onChange={e => setEditMarital(e.target.value)} className="w-full border p-2 rounded">
                      <option value="">Select</option><option value="Single">Single</option><option value="Married">Married</option><option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold mb-1">Date of Birth</label>
                    <input type="date" value={editDob} onChange={e => setEditDob(e.target.value)} className="w-full border p-2 rounded"/>
                  </div>
                </div>
              )}

              {activeTab === 'Family' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Parenting Stage</label>
                    <select value={editParenting} onChange={e => setEditParenting(e.target.value)} className="w-full border p-2 rounded">
                      <option value="">Select</option><option value="Expecting">Expecting</option><option value="Young Kids">Young Kids</option><option value="Teens">Teens</option><option value="Empty Nest">Empty Nest</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={editSingleParent} onChange={e => setEditSingleParent(e.target.checked)}/> Single Parent Household</label>
                </div>
              )}

              {activeTab === 'Ministry' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Membership Status</label>
                    <select value={editMembership} onChange={e => setEditMembership(e.target.value)} className="w-full border p-2 rounded">
                      <option value="Visitor">Visitor</option><option value="Member">Member</option><option value="Leader">Leader</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={editIsBaptized} onChange={e => setEditIsBaptized(e.target.checked)}/> Has been Baptized</label>
                  <div>
                    <label className="block text-xs font-bold mb-1">Ministry Skills (comma separated)</label>
                    <input type="text" value={editMinistrySkills} onChange={e => setEditMinistrySkills(e.target.value)} className="w-full border p-2 rounded" placeholder="Singing, Tech, Kids..."/>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-bold mb-2">Manage Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => {
                        const hasTag = selectedUser.tags.some((t: any) => t.tag.id === tag.id);
                        return (
                          <button 
                            key={tag.id} 
                            onClick={() => toggleTagForUser(tag.id, hasTag)}
                            className={`px-3 py-1 rounded text-xs border ${hasTag ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                          >
                            {tag.name} {hasTag && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Care' && (
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <label className="flex items-center gap-2 font-bold text-red-700">
                      <input type="checkbox" checked={editPastoralCareNeeded} onChange={e => setEditPastoralCareNeeded(e.target.checked)}/> 
                      NEEDS PASTORAL CARE
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Care Types / Needs</label>
                    <input type="text" value={editCareTypes} onChange={e => setEditCareTypes(e.target.value)} className="w-full border p-2 rounded" placeholder="Grief, Financial, Marriage..."/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Recent Life Events</label>
                    <input type="text" value={editLifeEvents} onChange={e => setEditLifeEvents(e.target.value)} className="w-full border p-2 rounded" placeholder="New Baby, Moved, Job Change..."/>
                  </div>
                </div>
              )}

              {activeTab === 'Permissions' && selectedUser.role === 'ADMIN' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                    <p className="text-sm text-blue-800">
                      Select the permissions this admin user should have. <strong>Full Access (Pastor)</strong> grants all permissions automatically.
                    </p>
                  </div>
                  {PERMISSIONS.map(permission => {
                    const isChecked = editPermissions.includes(permission.key);
                    const isSuperAdmin = permission.key === 'SUPER_ADMIN';
                    const isDisabled = editPermissions.includes('SUPER_ADMIN') && !isSuperAdmin;
                    
                    return (
                      <label 
                        key={permission.key}
                        className={`flex items-center gap-3 p-3 rounded border ${isDisabled ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200 hover:bg-gray-50'} cursor-pointer`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked || (editPermissions.includes('SUPER_ADMIN') && !isSuperAdmin)}
                          disabled={isDisabled}
                          onChange={(e) => {
                            if (isSuperAdmin) {
                              if (e.target.checked) {
                                // If SUPER_ADMIN is checked, set all permissions
                                setEditPermissions(PERMISSIONS.map(p => p.key));
                              } else {
                                // If SUPER_ADMIN is unchecked, remove it
                                setEditPermissions(editPermissions.filter(p => p !== 'SUPER_ADMIN'));
                              }
                            } else {
                              // Toggle individual permission
                              if (e.target.checked) {
                                setEditPermissions([...editPermissions, permission.key]);
                              } else {
                                setEditPermissions(editPermissions.filter(p => p !== permission.key));
                              }
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{permission.label}</div>
                          {isSuperAdmin && isChecked && (
                            <div className="text-xs text-blue-600 mt-1">All permissions granted</div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setShowEditUserModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
              <button onClick={saveUserDemographics} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TAG MODAL */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold mb-4">New Tag</h3>
            <form onSubmit={createTag} className="space-y-4">
              <input type="text" value={newTagName} onChange={e => setNewTagName(e.target.value)} className="w-full border p-2 rounded" placeholder="Tag Name" required/>
              <div className="flex gap-2">
                <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="h-10 w-16 p-1 border rounded"/>
                <div className="flex-1 flex items-center px-3 border rounded bg-gray-50 text-gray-500">{newTagColor}</div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowTagModal(false)} className="px-4 py-2">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
