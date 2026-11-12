import { Users, Activity, Clock, Award, Timer, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function AnalyticsKPICards({ overviewData, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="analytics-kpi-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="kpi-card skeleton">
            <div className="skeleton-title"></div>
            <div className="skeleton-value"></div>
            <div className="skeleton-sub"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget-error-box" role="alert">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>Failed to load Overview KPIs: {error}</span>
        </div>
        <button type="button" className="retry-btn" onClick={onRetry}>
          Retry KPI Data
        </button>
      </div>
    );
  }

  const kpis = overviewData?.kpis || {};
  const changes = overviewData?.changes || {};

  const formatHours = (hours) => {
    if (!hours || hours === 0) return '0h';
    if (hours < 24) return `${hours}h`;
    const days = (hours / 24).toFixed(1);
    return `${days}d (${hours}h)`;
  };

  return (
    <div className="analytics-kpi-grid">
      {/* 1. Total Interns */}
      <div className="kpi-card accent-primary">
        <div className="kpi-header">
          <span className="kpi-title">Total Interns</span>
          <div className="kpi-icon-wrap primary">
            <Users size={18} />
          </div>
        </div>
        <div className="kpi-value">{kpis.totalInterns || 0}</div>
        <div className="kpi-sub">
          <span>Active: <strong>{kpis.activeInterns || 0}</strong></span>
          <span className="dot" aria-hidden="true">•</span>
          <span>Upcoming: <strong>{kpis.upcomingInterns || 0}</strong></span>
          <span className="dot" aria-hidden="true">•</span>
          <span>Cancelled: <strong>{kpis.cancelledInterns || 0}</strong></span>
        </div>
      </div>

      {/* 2. Active Interns */}
      <div className="kpi-card accent-teal">
        <div className="kpi-header">
          <span className="kpi-title">Active Interns</span>
          <div className="kpi-icon-wrap teal">
            <Activity size={18} />
          </div>
        </div>
        <div className="kpi-value">{kpis.activeInterns || 0}</div>
        <div className="kpi-sub">
          <span>Completed: <strong>{kpis.completedInterns || 0}</strong></span>
          <span className="dot" aria-hidden="true">•</span>
          <span>Team Leaders: <strong>{kpis.totalTeamLeaders || 0}</strong></span>
        </div>
      </div>

      {/* 3. Pending Requests */}
      <div className="kpi-card accent-amber">
        <div className="kpi-header">
          <span className="kpi-title">Pending Requests</span>
          <div className="kpi-icon-wrap amber">
            <Clock size={18} />
          </div>
        </div>
        <div className="kpi-value">{kpis.pendingRequests || 0}</div>
        <div className="kpi-sub">
          <span>Forwarded: <strong>{kpis.forwardedRequests || 0}</strong></span>
          <span className="dot" aria-hidden="true">•</span>
          <span>In period: <strong>{kpis.requestsThisMonth || 0}</strong></span>
        </div>
      </div>

      {/* 4. Certificates Issued */}
      <div className="kpi-card accent-violet">
        <div className="kpi-header">
          <span className="kpi-title">Certificates Issued</span>
          <div className="kpi-icon-wrap violet">
            <Award size={18} />
          </div>
        </div>
        <div className="kpi-value">{kpis.certificatesIssuedThisMonth || 0}</div>
        <div className="kpi-sub">
          {changes.certificates !== undefined && (
            <span className={`kpi-badge ${changes.certificates >= 0 ? 'pos' : 'neg'}`}>
              {changes.certificates >= 0 ? (
                <>
                  <TrendingUp size={12} />
                  <span>+{changes.certificates}%</span>
                </>
              ) : (
                <>
                  <TrendingDown size={12} />
                  <span>{changes.certificates}%</span>
                </>
              )}
            </span>
          )}
          <span className="sub-text">vs previous period</span>
        </div>
      </div>

      {/* 5. Avg Turnaround */}
      <div className="kpi-card accent-emerald">
        <div className="kpi-header">
          <span className="kpi-title">Avg Turnaround</span>
          <div className="kpi-icon-wrap emerald">
            <Timer size={18} />
          </div>
        </div>
        <div className="kpi-value">{formatHours(kpis.avgTurnaroundHours)}</div>
        <div className="kpi-sub">
          <span>Approval: <strong>{kpis.approvalRate || 0}%</strong></span>
          <span className="dot" aria-hidden="true">•</span>
          <span>Rejection: <strong>{kpis.rejectionRate || 0}%</strong></span>
        </div>
      </div>
    </div>
  );
}
