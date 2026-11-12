import useTeamLeaderInterns from '../hooks/useTeamLeaderInterns';
import StatusBadge from '../../shared/components/StatusBadge';
import { ArrowLeft, Users, Mail, Calendar, AlertCircle } from 'lucide-react';
import './TeamLeadersSection.css';

const formatDate = (date) => date
  ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  : '—';

export default function TeamLeaderInternsView({ teamLeaderId, onBack }) {
  const { teamLeader, interns, loading, error, refetch } = useTeamLeaderInterns(teamLeaderId);

  return (
    <section className="team-leaders-panel" aria-labelledby="team-leader-interns-title">
      <button className="team-leaders-back" type="button" onClick={onBack}>
        <ArrowLeft size={14} />
        <span>Back to Team Leader Roster</span>
      </button>

      {loading && (
        <div className="team-interns-loading" aria-label="Loading interns">
          <div className="team-interns-title-skeleton" />
          {[1, 2].map((item) => <div className="intern-skeleton" key={item} />)}
        </div>
      )}

      {!loading && error && (
        <div className="team-leaders-error" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error === 'Team leader not found' ? 'This team leader could not be found.' : error}</span>
          </div>
          <button type="button" onClick={refetch}>Retry</button>
        </div>
      )}

      {!loading && !error && teamLeader && (
        <>
          <div className="team-leaders-heading team-interns-heading">
            <div>
              <h2 id="team-leader-interns-title">Interns assigned to {teamLeader.fullName}</h2>
              <p className="tl-email-subtitle">{teamLeader.email}</p>
            </div>
            <span className="team-leaders-count">
              <Users size={12} />
              <span>{interns.length} assigned</span>
            </span>
          </div>

          {!interns.length && (
            <div className="team-leaders-state">
              This team leader has no interns assigned yet. Interns can be assigned from the Intern Directory.
            </div>
          )}

          {interns.length > 0 && (
            <div className="intern-list">
              {interns.map((intern) => (
                <article className="intern-row" key={intern._id || intern.id || intern.email}>
                  <div className="intern-row-heading">
                    <div className="intern-title-group">
                      <div className="intern-avatar-small">
                        {intern.fullName?.charAt(0)?.toUpperCase() || 'I'}
                      </div>
                      <div>
                        <h3>{intern.fullName}</h3>
                        <p>{intern.email}</p>
                      </div>
                    </div>
                    <StatusBadge status={intern.internshipDetails?.status} />
                  </div>
                  <div className="intern-details">
                    <div className="detail-box">
                      <span>Intern code</span>
                      <code>{intern.internCode || '—'}</code>
                    </div>
                    <div className="detail-box">
                      <span>Domain</span>
                      <strong>{intern.domain || '—'}</strong>
                    </div>
                    <div className="detail-box">
                      <span>Start date</span>
                      <strong>{formatDate(intern.startDate)}</strong>
                    </div>
                    <div className="detail-box">
                      <span>End date</span>
                      <strong>{formatDate(intern.endDate)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
