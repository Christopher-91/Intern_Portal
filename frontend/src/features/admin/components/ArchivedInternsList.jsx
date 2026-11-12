import { useState } from 'react';
import Toast from '../../../shared/components/Toast';
import useArchivedInterns from '../hooks/useArchivedInterns';
import { Archive, RotateCcw, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import './RetentionManagement.css';

const dateLabel = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

export default function ArchivedInternsList() {
  const { interns, loading, error, refresh, restore } = useArchivedInterns();
  const [restoringId, setRestoringId] = useState('');
  const [toast, setToast] = useState(null);

  const handleRestore = async (intern) => {
    if (!window.confirm(`Restore ${intern.fullName} and re-enable their portal login?`)) return;
    setRestoringId(intern._id);
    try {
      const message = await restore(intern);
      setToast({ type: 'success', message });
    } catch (requestError) {
      setToast({ type: 'error', message: requestError.message || 'Unable to restore this intern.' });
    } finally {
      setRestoringId('');
    }
  };

  return (
    <section className="archived-interns-card" aria-labelledby="archived-interns-title">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <header className="archived-header-row">
        <div>
          <h2 id="archived-interns-title">Archived Accounts Directory</h2>
          <p className="archived-subtitle">Accounts currently in archival holding before final purge cycle.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="retention-refresh-btn"
          title="Refresh archived interns"
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </header>

      {loading ? (
        <div className="retention-state" role="status">
          <div className="spinner" aria-hidden="true" />
          <span>Loading archived intern records…</span>
        </div>
      ) : error ? (
        <div className="retention-state retention-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button type="button" onClick={refresh} className="retention-btn-secondary">
            Retry
          </button>
        </div>
      ) : interns.length === 0 ? (
        <div className="retention-state empty">
          <Archive size={20} style={{ color: 'var(--text-muted)' }} />
          <span>No archived accounts pending purge. All records are active.</span>
        </div>
      ) : (
        <div className="retention-table-wrap">
          <table className="retention-table">
            <thead>
              <tr>
                <th>Intern</th>
                <th>Intern Code</th>
                <th>Domain</th>
                <th>Archived Date</th>
                <th>Days Before Purge</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {interns.map((intern) => (
                <tr key={intern._id}>
                  <td>
                    <strong>{intern.fullName}</strong>
                    <small>{intern.email}</small>
                  </td>
                  <td><code>{intern.internCode || '—'}</code></td>
                  <td>{intern.domain || '—'}</td>
                  <td>{dateLabel(intern.archivedAt)}</td>
                  <td>
                    <span className="purge-countdown-pill">
                      <Clock size={12} />
                      <span>{intern.daysLeftBeforePurge} days left</span>
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="restore-account-btn"
                      onClick={() => handleRestore(intern)}
                      disabled={restoringId === intern._id}
                    >
                      <RotateCcw size={12} className={restoringId === intern._id ? 'spin' : ''} />
                      <span>{restoringId === intern._id ? 'Restoring…' : 'Restore'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
