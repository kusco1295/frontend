import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPersonAdd, MdClose, MdEdit } from 'react-icons/md';
import { adminAPI } from '../services/adminAPI';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/endpoints';
import '../styles/Teams.css';

const DEPARTMENT_OPTIONS = [
  'planning dept',
  'design dept',
  'purchase dept',
  'sales dept',
  'sales coordinator',
  'account dept',
  'production dept',
  'service dept',
];

const roleColors = {
  superadmin: { bg: '#ede9fe', color: '#7c3aed' },
  admin:      { bg: '#dbeafe', color: '#1d4ed8' },
  member:     { bg: '#d1fae5', color: '#065f46' },
};

const TeamsPage = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const isAdmin = admin?.role === 'admin' || admin?.role === 'superadmin';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Edit modal
  const [editOpen, setEditOpen]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [editForm, setEditForm]         = useState({ name: '', email: '', role: 'member', department: '' });
  const [editError, setEditError]       = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllMembers();
      setMembers(response.data.data.admins);
    } catch {
      setError('Failed to load members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  // ── Edit handlers ──
  const openEdit = (member) => {
    setEditTarget(member);
    setEditForm({ name: member.name, email: member.email, role: member.role, department: member.department || '' });
    setEditError('');
    setEditOpen(true);
  };

  const closeEdit = () => { setEditOpen(false); setEditError(''); setEditTarget(null); };

  const handleEditChange = (e) =>
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.name || !editForm.email) {
      setEditError('Name and email are required.');
      return;
    }
    try {
      setEditSubmitting(true);
      await adminAPI.updateMember(editTarget.id, editForm);
      closeEdit();
      fetchMembers();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update member.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  if (loading) {
    return (
      <div className="page-container">
        <h2 className="page-title">Teams</h2>
        <p className="teams-loading">Loading members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h2 className="page-title">Teams</h2>
        <p className="teams-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="teams-header">
        <div>
          <h2 className="page-title">Teams</h2>
          <p className="page-subtitle">
            {members.length} member{members.length !== 1 ? 's' : ''} in your organisation
          </p>
        </div>
        {isAdmin && (
          <button className="btn-add-member" onClick={() => navigate(ROUTES.ADMIN_ADD_MEMBER)}>
            <MdPersonAdd />
            Add Member
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="empty-state">
          <p>No members found. Add your first team member to get started.</p>
        </div>
      ) : (
        <div className="members-grid">
          {members.map((member) => {
            const badge = roleColors[member.role] || roleColors.member;
            return (
              <div key={member.id} className="member-card">
                <div className="member-avatar">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="member-info">
                  <div className="member-name-row">
                    <h4 className="member-name">{member.name}</h4>
                    {isAdmin && (
                      <button
                        className="btn-edit-member"
                        onClick={() => openEdit(member)}
                        title="Edit member"
                      >
                        <MdEdit />
                      </button>
                    )}
                  </div>
                  <p className="member-email">{member.email}</p>
                  {member.department && (
                    <p className="member-department">{member.department.charAt(0).toUpperCase() + member.department.slice(1)}</p>
                  )}
                  <div className="member-footer">
                    <span className="member-role-badge" style={{ background: badge.bg, color: badge.color }}>
                      {member.role}
                    </span>
                    <span className="member-joined">Joined {formatDate(member.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Member Modal */}
      {editOpen && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Member</h3>
              <button className="modal-close-btn" onClick={closeEdit}><MdClose /></button>
            </div>
            <form className="modal-form" onSubmit={handleEditSubmit}>
              {editError && <p className="modal-error">{editError}</p>}
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" placeholder="Enter full name"
                  value={editForm.name} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="Enter email address"
                  value={editForm.email} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={editForm.role} onChange={handleEditChange}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select name="department" value={editForm.department} onChange={handleEditChange}>
                  <option value="">— Select department —</option>
                  {DEPARTMENT_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeEdit}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={editSubmitting}>
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
