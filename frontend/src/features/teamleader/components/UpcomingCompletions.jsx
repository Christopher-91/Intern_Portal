import { CheckCircle2, Clock, Calendar } from 'lucide-react';
import './UpcomingCompletions.css';

const UpcomingCompletions = ({ interns }) => {
  if (!interns || interns.length === 0) {
    return (
      <section className="upcoming-completions-card">
        <div className="upcoming-completions-header">
          <div>
            <h2>Upcoming Cohort Completions</h2>
            <p>Cohort completions occurring within the next 72 hours.</p>
          </div>
        </div>

        <div className="upcoming-empty-state">
          <CheckCircle2 size={18} style={{ color: '#10B981' }} />
          <p>No interns are completing their internship within the next 3 days.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="upcoming-completions-card">
      <div className="upcoming-completions-header">
        <div>
          <h2>Upcoming Cohort Completions</h2>
          <p>
            These interns are completing their internship within the next 3 days.
            Review and forward their certificates in advance.
          </p>
        </div>

        <div className="upcoming-count">
          {interns.length} {interns.length === 1 ? 'intern' : 'interns'}
        </div>
      </div>

      <div className="upcoming-completions-list">
        {interns.map((intern) => (
          <div className="upcoming-completion-item" key={intern._id}>
            <div className="upcoming-intern-avatar">
              {(intern.fullName || 'I')
                .split(' ')
                .map((part) => part[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>

            <div className="upcoming-intern-info">
              <strong>{intern.fullName}</strong>
              <span>{intern.internCode}</span>
              <small>{intern.domain || 'Internship'}</small>
            </div>

            <div className="upcoming-completion-date">
              <strong>
                {intern.daysUntilCompletion === 0
                  ? 'Completing today'
                  : intern.daysUntilCompletion === 1
                    ? 'Completing tomorrow'
                    : `${intern.daysUntilCompletion} days left`}
              </strong>

              <span>
                {new Date(intern.endDate).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingCompletions;
