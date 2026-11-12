import AnalyticsExportActions from './AnalyticsExportActions';
import { Timer, Clock, Zap, AlertCircle } from 'lucide-react';

const stages = [
  ['timeToTLReview', 'Request to Team Leader review', Zap],
  ['timeToAdminFinalize', 'Team Leader review to completion', Clock],
  ['totalTurnaround', 'End-to-end issuance cycle', Timer]
];

export default function AnalyticsTurnaround({ data, loading, error, onRetry, onExport }) {
  return (
    <section className="turnaround-card" aria-labelledby="turnaround-title">
      <div className="turnaround-heading">
        <div className="turnaround-title-group">
          <div className="turnaround-icon-pill">
            <Timer size={18} />
          </div>
          <div>
            <h2 id="turnaround-title">Workflow Turnaround Benchmarks</h2>
            <p>Average, median, and 90th percentile resolution time by workflow stage.</p>
          </div>
        </div>
        <AnalyticsExportActions onExport={onExport} type="turnaround" />
      </div>

      {loading ? (
        <div className="turnaround-state">Calculating turnaround metrics…</div>
      ) : error ? (
        <div className="widget-error-box" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>Failed to load turnaround metrics: {error}</span>
          </div>
          <button className="retry-btn" onClick={onRetry}>Retry</button>
        </div>
      ) : (
        <div className="turnaround-grid">
          {stages.map(([key, title, Icon]) => {
            const stats = data?.[key] || { avg: 0, median: 0, p90: 0 };
            return (
              <article className="turnaround-stage" key={key}>
                <div className="stage-header">
                  <Icon size={14} className="stage-icon" />
                  <h3>{title}</h3>
                </div>
                <dl>
                  <div className="turnaround-stat-col">
                    <dt>Average</dt>
                    <dd>{stats.avg}h</dd>
                  </div>
                  <div className="turnaround-stat-col">
                    <dt>Median</dt>
                    <dd>{stats.median}h</dd>
                  </div>
                  <div className="turnaround-stat-col">
                    <dt>90th %ile</dt>
                    <dd>{stats.p90}h</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
