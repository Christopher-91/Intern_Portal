import { useState } from 'react';
import useTeamLeaders from '../hooks/useTeamLeaders';
import { updateTeamLeader } from '../services/admin.service';
import { Search, ChevronRight, Briefcase, Edit2, X, AlertCircle, CheckCircle2, Phone, Mail, Calendar } from 'lucide-react';
import './TeamLeadersSection.css';

export default function TeamLeaderList({ onSelect }) {
  const { teamLeaders, loading, error, refetch } = useTeamLeaders();
  const [searchTerm, setSearchTerm] = useState('');

  // Edit Modal State
  const [editingTl, setEditingTl] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState(null);

  const filtered = teamLeaders.filter((tl) => {
    const s = searchTerm.toLowerCase();
    return (
      tl.fullName?.toLowerCase().includes(s) ||
      tl.email?.toLowerCase().includes(s) ||
      tl.mobileNo?.includes(s)
    );
  });

  const openEditModal = (e, tl) => {
    e.stopPropagation();
    setEditingTl(tl);
    setEditForm({
      fullName: tl.fullName || '',
      mobileNo: tl.mobileNo || '',
      startDate: tl.startDate ? new Date(tl.startDate).toISOString().slice(0, 10) : '',
      endDate: tl.endDate ? new Date(tl.endDate).toISOString().slice(0, 10) : '',
    });
    setEditMsg(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMsg(null);
    try {
      await updateTeamLeader(editingTl._id || editingTl.id, editForm);
      setEditMsg({ type: 'success', text: 'Team Leader updated successfully!' });
      setTimeout(() => {
        setEditingTl(null);
        refetch();
      }, 700);
    } catch (err) {
      setEditMsg({ type: 'error', text: err.message || 'Failed to update Team Leader' });
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <section className="team-leaders-panel" aria-labelledby="team-leaders-title">
      <div className="team-leaders-heading">
        <div>
          <h2 id="team-leaders-title">Team Leader Roster</h2>
          <p>Select a team leader to view their assigned interns, or edit management details.</p>
        </div>
        {!loading && !error && (
          <span className="team-leaders-count">
            <Briefcase size={12} />
            <span>{teamLeaders.length} active leaders</span>
          </span>
        )}
      </div>

      <div className="tl-search-bar-wrap">
        <Search size={15} className="tl-search-icon" />
        <input
          type="text"
          className="tl-search-input"
          placeholder="Search team leaders by name or email…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {loading && (
        <div className="team-leader-list" aria-label="Loading team leaders">
          {[1, 2, 3].map((item) => (
            <div className="team-leader-skeleton" key={item} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="team-leaders-error" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button type="button" onClick={refetch}>Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="team-leaders-state">
          No team leaders found matching &quot;{searchTerm}&quot;
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="team-leader-list">
          {filtered.map((teamLeader) => {
            const id = teamLeader._id || teamLeader.id;
            return (
              <div
                className="team-leader-row"
                key={id}
                onClick={() => onSelect(id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelect(id);
                }}
              >
                <span className="team-leader-avatar">
                  {teamLeader.fullName?.charAt(0)?.toUpperCase() || 'T'}
                </span>

                <span className="team-leader-details">
                  <strong>{teamLeader.fullName}</strong>
                  <small>{teamLeader.email}</small>
                  {teamLeader.mobileNo && (
                    <small className="tl-mobile-text">{teamLeader.mobileNo}</small>
                  )}
                </span>

                <div className="team-leader-right-actions">
                  <span className="team-leaders-intern-badge">
                    {teamLeader.assignedInternCount || 0}{' '}
                    {teamLeader.assignedInternCount === 1 ? 'intern' : 'interns'}
                  </span>

                  <button
                    type="button"
                    className="admin-btn-sm"
                    onClick={(e) => openEditModal(e, teamLeader)}
                    title="Edit Team Leader Profile"
                  >
                    Edit
                  </button>

                  <ChevronRight size={16} className="team-leader-chevron" aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit TL Modal */}
      {editingTl && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="modal-header-row">
              <div>
                <h3>Edit Team Leader Details</h3>
                <p>
                  Update profile fields for <strong>{editingTl.fullName}</strong>.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingTl(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {editMsg && (
              <div className={`admin-alert-box ${editMsg.type}`}>
                {editMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{editMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleEditSave}>
              <div className="admin-form-group" style={{ marginBottom: '14px' }}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: '14px' }}>
                <label>Mobile Number</label>
                <input
                  type="text"
                  value={editForm.mobileNo}
                  onChange={(e) => setEditForm({ ...editForm, mobileNo: e.target.value })}
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: '14px' }}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: '14px' }}>
                <label>End Date</label>
                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => setEditingTl(null)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-sm admin-btn-primary-sm"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
