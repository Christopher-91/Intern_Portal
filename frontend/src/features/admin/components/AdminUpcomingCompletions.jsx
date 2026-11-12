import { useEffect, useState } from 'react';
import { getAllInterns } from '../services/admin.service';
import { Calendar, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import './AdminUpcomingCompletions.css';

export default function AdminUpcomingCompletions() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllInterns()
      .then(({ interns: allInterns = [] }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirdDay = new Date(today);
        thirdDay.setDate(thirdDay.getDate() + 3);
        setInterns(
          allInterns
            .filter((intern) => {
              if (
                !intern.endDate ||
                ['completed', 'cancelled'].includes(intern.internshipDetails?.status)
              ) {
                return false;
              }
              const endDate = new Date(intern.endDate);
              endDate.setHours(0, 0, 0, 0);
              return endDate >= today && endDate <= thirdDay;
            })
            .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
        );
      })
      .catch((requestError) =>
        setError(requestError.message || 'Could not load upcoming completions.')
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="admin-upcoming-card" aria-labelledby="admin-upcoming-title">
      <div className="admin-upcoming-heading">
        <div className="admin-upcoming-title-group">
          <div className="admin-upcoming-icon-pill">
            <Clock size={16} />
          </div>
          <div>
            <h2 id="admin-upcoming-title">Upcoming Internship Completions</h2>
            <p>Intern cohorts scheduled to conclude within the next 72 hours.</p>
          </div>
        </div>

        {!loading && !error && (
          <span className="admin-upcoming-count-badge">
            {interns.length} {interns.length === 1 ? 'intern' : 'interns'}
          </span>
        )}
      </div>

      {loading ? (
        <div className="admin-upcoming-state-box">
          <div className="spinner" aria-hidden="true" />
          <span>Scanning intern rosters for expiring tenures…</span>
        </div>
      ) : error ? (
        <div className="admin-upcoming-state-box error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : interns.length === 0 ? (
        <div className="admin-upcoming-state-box empty">
          <CheckCircle2 size={18} className="empty-check-icon" />
          <span>No internships scheduled to finish within the next 3 days. All rosters are current.</span>
        </div>
      ) : (
        <div className="admin-upcoming-list">
          {interns.map((intern) => (
            <article className="admin-upcoming-item" key={intern._id}>
              <div className="upcoming-intern-main">
                <div className="upcoming-intern-avatar">
                  <User size={15} />
                </div>
                <div>
                  <strong>{intern.fullName}</strong>
                  <small>
                    {intern.internCode || intern.email} · {intern.domain || 'General Track'}
                  </small>
                </div>
              </div>

              <div className="upcoming-intern-meta">
                <div className="upcoming-date-pill">
                  <Calendar size={13} />
                  <span>
                    {new Date(intern.endDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <small className="upcoming-lead">
                  TL: {intern.internshipDetails?.teamLeader?.fullName ||
                    intern.internshipDetails?.teamleaderEmail ||
                    'Unassigned'}
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
