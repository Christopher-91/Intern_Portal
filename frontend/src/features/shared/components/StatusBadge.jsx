import './StatusBadge.css';

export default function StatusBadge({ status }) {
  const normalized = (status || 'unknown').toLowerCase();
  const label = normalized.replaceAll('_', ' ');

  return (
    <span className={`status-pill-badge status-${normalized}`}>
      <span className="status-badge-dot" aria-hidden="true" />
      <span className="status-badge-text">{label}</span>
    </span>
  );
}
