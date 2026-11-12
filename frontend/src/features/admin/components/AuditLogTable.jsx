import { useState } from 'react';
import { Code, ChevronDown, ChevronUp } from 'lucide-react';

export default function AuditLogTable({ logs }) {
  const [expanded, setExpanded] = useState({});

  return (
    <div className="audit-table-wrap">
      <table className="audit-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Target</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>
                <span className="audit-time-cell">
                  {new Date(log.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </td>
              <td>
                <div className="audit-actor-cell">
                  <strong>{log.actorId?.fullName || (log.actorRole === 'system' ? 'System Engine' : 'Unauthenticated')}</strong>
                  <small>
                    <span className={`actor-role-pill ${log.actorRole || 'system'}`}>{log.actorRole}</span>
                    {log.actorId?.email && <span> · {log.actorId.email}</span>}
                  </small>
                </div>
              </td>
              <td>
                <code className="audit-action-code">{log.action}</code>
              </td>
              <td>
                <div className="audit-target-cell">
                  <span>{log.targetType || 'System'}</span>
                  {log.targetId && <small>{log.targetId}</small>}
                </div>
              </td>
              <td>
                <button
                  className="audit-expand-btn"
                  type="button"
                  aria-expanded={!!expanded[log._id]}
                  onClick={() => setExpanded((prev) => ({ ...prev, [log._id]: !prev[log._id] }))}
                >
                  <Code size={12} />
                  <span>{expanded[log._id] ? 'Hide Metadata' : 'View Payload'}</span>
                  {expanded[log._id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {expanded[log._id] && (
                  <pre className="audit-payload-json">
                    {JSON.stringify(
                      {
                        description: log.description,
                        metadata: log.meta,
                        ipAddress: log.ipAddress || log.ip,
                        userAgent: log.userAgent,
                      },
                      null,
                      2
                    )}
                  </pre>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
