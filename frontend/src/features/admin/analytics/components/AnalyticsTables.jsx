import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalyticsExportActions from './AnalyticsExportActions';
import {
  Download,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function AnalyticsTables({
  teamLeadersData,
  stuckData,
  upcomingData,
  loadingMap,
  errorMap,
  onRetry,
  onExport,
  onOpenRequests
}) {
  const navigate = useNavigate();
  const [tlSortKey, setTlSortKey] = useState('pendingReviews');
  const [tlSortAsc, setTlSortAsc] = useState(false);

  const handleSort = (key) => {
    if (tlSortKey === key) {
      setTlSortAsc(!tlSortAsc);
    } else {
      setTlSortKey(key);
      setTlSortAsc(false);
    }
  };

  const sortedTeamLeaders = [...(teamLeadersData || [])].sort((a, b) => {
    let valA = a[tlSortKey];
    let valB = b[tlSortKey];
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return tlSortAsc ? -1 : 1;
    if (valA > valB) return tlSortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="analytics-tables-container">
      {/* 1. Team Leader Performance Table */}
      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h3>Team Leader Performance Matrix</h3>
            <p className="table-subtitle">Review speeds, pending counts, and overdue flags per Team Leader</p>
          </div>
          <div className="header-actions-row">
            <AnalyticsExportActions onExport={onExport} type="team-leaders" formats={['xlsx']} />
            <button
              type="button"
              className="table-export-btn"
              onClick={() => onExport('team-leaders')}
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {loadingMap.teamLeaders ? (
          <div className="table-skeleton">Loading performance matrix...</div>
        ) : errorMap.teamLeaders ? (
          <div className="widget-error-box" role="alert">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>Error: {errorMap.teamLeaders}</span>
            </div>
            <button className="retry-btn" onClick={() => onRetry('teamLeaders')}>Retry</button>
          </div>
        ) : sortedTeamLeaders.length === 0 ? (
          <div className="empty-state">No Team Leaders registered yet</div>
        ) : (
          <div className="table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('fullName')}>
                    <div className="sort-th-content">
                      <span>Team Leader</span>
                      {tlSortKey === 'fullName' && (tlSortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('internsAssigned')}>
                    <div className="sort-th-content">
                      <span>Interns</span>
                      {tlSortKey === 'internsAssigned' && (tlSortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('requestsReviewed')}>
                    <div className="sort-th-content">
                      <span>Reviewed</span>
                      {tlSortKey === 'requestsReviewed' && (tlSortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('pendingReviews')}>
                    <div className="sort-th-content">
                      <span>Pending</span>
                      {tlSortKey === 'pendingReviews' && (tlSortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('avgReviewTimeHours')}>
                    <div className="sort-th-content">
                      <span>Avg Review Time</span>
                      {tlSortKey === 'avgReviewTimeHours' && (tlSortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('rejectionRate')}>
                    <div className="sort-th-content">
                      <span>Rejection Rate</span>
                      {tlSortKey === 'rejectionRate' && (tlSortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </div>
                  </th>
                  <th>Overdue Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeamLeaders.map((tl) => (
                  <tr key={tl.id} className={tl.hasOverdueRequests ? 'row-overdue-highlight' : ''}>
                    <td>
                      <div className="tl-name-cell">
                        <strong>{tl.fullName}</strong>
                        <small>{tl.email}</small>
                      </div>
                    </td>
                    <td><span className="pill blue">{tl.internsAssigned}</span></td>
                    <td><span className="pill green">{tl.requestsReviewed}</span></td>
                    <td>
                      <span className={`pill ${tl.pendingReviews > 0 ? 'amber' : 'gray'}`}>
                        {tl.pendingReviews}
                      </span>
                    </td>
                    <td>{tl.avgReviewTimeHours > 0 ? `${tl.avgReviewTimeHours} hrs` : 'N/A'}</td>
                    <td>{tl.rejectionRate}%</td>
                    <td>
                      {tl.hasOverdueRequests ? (
                        <span className="status-badge alert" title={`Longest pending request: ${tl.maxPendingDays} days`}>
                          <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Overdue ({tl.maxPendingDays}d)
                        </span>
                      ) : (
                        <span className="status-badge ok">
                          <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          On Track
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Stuck Requests & Upcoming Completions Grid */}
      <div className="tables-duo-grid">
        {/* Stuck Requests List */}
        <div className="table-card">
          <div className="table-card-header">
            <div>
              <h3>Requests Pending &gt; 3 Days</h3>
              <p className="table-subtitle">Requests stuck in bottleneck stages</p>
            </div>
            <div className="header-actions-row">
              <AnalyticsExportActions onExport={onExport} type="stuck-requests" formats={['xlsx']} />
              <button
                type="button"
                className="table-export-btn"
                onClick={() => onExport('stuck-requests')}
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {loadingMap.stuck ? (
            <div className="table-skeleton">Loading stuck requests...</div>
          ) : errorMap.stuck ? (
            <div className="widget-error-box" role="alert">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>Error: {errorMap.stuck}</span>
              </div>
              <button className="retry-btn" onClick={() => onRetry('stuck')}>Retry</button>
            </div>
          ) : !stuckData || stuckData.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={18} style={{ color: '#10B981', marginRight: '8px' }} />
              <span>No stuck requests. All queues are processing within SLA.</span>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="analytics-table mini">
                <thead>
                  <tr>
                    <th>Request #</th>
                    <th>Intern</th>
                    <th>Days Pending</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stuckData.map((item) => (
                    <tr key={item.id} className="row-stuck-warning">
                      <td><strong>{item.requestNumber}</strong></td>
                      <td>
                        <div className="tl-name-cell">
                          <span>{item.internName}</span>
                          <small>{item.certificateType}</small>
                        </div>
                      </td>
                      <td>
                        <span className="days-pending-badge">
                          <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {item.daysPending} days
                        </span>
                      </td>
                      <td>
                        <span className={`status-tag ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.reviewLink ? (
                          <button
                            type="button"
                            className="table-action-btn"
                            onClick={() => item.reviewLink === 'requests-queue' ? onOpenRequests?.() : navigate(item.reviewLink)}
                          >
                            <span>{item.reviewLink === 'requests-queue' ? 'Open Retry Queue' : 'Review'}</span>
                            <ArrowRight size={12} />
                          </button>
                        ) : <span className="text-muted" title="This request is waiting for Team Leader review">Awaiting TL</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Completions */}
        <div className="table-card">
          <div className="table-card-header">
            <div>
              <h3>Upcoming Internship Completions</h3>
              <p className="table-subtitle">Interns with end dates in the selected date window</p>
            </div>
            <div className="header-actions-row">
              <AnalyticsExportActions onExport={onExport} type="upcoming-completions" formats={['xlsx']} />
              <button
                type="button"
                className="table-export-btn"
                onClick={() => onExport('upcoming-completions')}
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {loadingMap.upcoming ? (
            <div className="table-skeleton">Loading upcoming completions...</div>
          ) : errorMap.upcoming ? (
            <div className="widget-error-box" role="alert">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>Error: {errorMap.upcoming}</span>
              </div>
              <button className="retry-btn" onClick={() => onRetry('upcoming')}>Retry</button>
            </div>
          ) : !upcomingData || upcomingData.length === 0 ? (
            <div className="empty-state">No upcoming completions found for this filter</div>
          ) : (
            <div className="table-wrapper">
              <table className="analytics-table mini">
                <thead>
                  <tr>
                    <th>Intern</th>
                    <th>End Date</th>
                    <th>Remaining</th>
                    <th>Cert Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="tl-name-cell">
                          <strong>{item.fullName}</strong>
                          <small>{item.domain} • TL: {item.teamLeaderName}</small>
                        </div>
                      </td>
                      <td>{new Date(item.endDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`pill ${item.daysRemaining <= 7 ? 'amber' : 'blue'}`}>
                          {item.daysRemaining} days left
                        </span>
                      </td>
                      <td>
                        {item.hasRequestedCertificate ? (
                          <span className="status-badge ok">
                            <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            {item.certificateStatus}
                          </span>
                        ) : (
                          <span className="status-badge not-requested">Not Requested</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
