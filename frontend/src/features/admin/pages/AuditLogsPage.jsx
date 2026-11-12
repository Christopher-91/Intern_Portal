import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { exportAuditLogs } from '../services/admin.service';
import useAuditLogs from '../hooks/useAuditLogs';
import AuditLogFilters from '../components/AuditLogFilters';
import AuditLogTable from '../components/AuditLogTable';
import { ShieldCheck, Download, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import './AuditLogsPage.css';

export default function AuditLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const { logs, pagination, loading, error, refresh } = useAuditLogs({
    page: filters.page || 1,
    limit: 25,
    action: filters.action,
    actorRole: filters.actorRole,
    targetType: filters.targetType,
    actorId: filters.actorId,
    from: filters.from,
    to: filters.to,
  });

  const changeFilters = useCallback(
    (next) => {
      const clean = Object.fromEntries(Object.entries(next).filter(([, value]) => value !== '' && value != null));
      setSearchParams(clean);
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (pagination.pages && Number(filters.page || 1) > pagination.pages) {
      changeFilters({ ...filters, page: pagination.pages });
    }
  }, [pagination.pages, filters, changeFilters]);

  const exportCsv = async () => {
    setExporting(true);
    setExportError('');
    try {
      const blob = await exportAuditLogs(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'audit-logs.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err.message || 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="audit-page">
      <header className="audit-header">
        <div>
          <h2>Security & System Audit Logs</h2>
          <p>Immutable log of administrative operations, authentication events, and certificate records.</p>
        </div>
        <button type="button" onClick={refresh} className="audit-refresh-btn" disabled={loading}>
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </header>

      <AuditLogFilters filters={filters} onChange={changeFilters} onExport={exportCsv} exporting={exporting} />

      {exportError && (
        <div className="audit-error-banner" role="alert">
          <AlertCircle size={16} />
          <span>{exportError}</span>
        </div>
      )}

      {loading ? (
        <div className="audit-state" role="status">
          <div className="spinner" aria-hidden="true" />
          <span>Querying security audit events…</span>
        </div>
      ) : error ? (
        <div className="audit-state audit-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button type="button" onClick={refresh} className="audit-retry-btn">
            Retry
          </button>
        </div>
      ) : logs.length ? (
        <>
          <AuditLogTable logs={logs} />
          <footer className="audit-pagination">
            <span className="audit-pagination-info">
              Showing {pagination.total.toLocaleString()} total events · Page {pagination.page} of{' '}
              {Math.max(pagination.pages, 1)}
            </span>
            <div className="audit-pagination-btns">
              <button
                type="button"
                className="audit-page-btn"
                disabled={pagination.page <= 1}
                onClick={() => changeFilters({ ...filters, page: pagination.page - 1 })}
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <button
                type="button"
                className="audit-page-btn"
                disabled={pagination.page >= pagination.pages}
                onClick={() => changeFilters({ ...filters, page: pagination.page + 1 })}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </footer>
        </>
      ) : (
        <div className="audit-state empty">
          <ShieldCheck size={24} style={{ color: 'var(--text-muted)' }} />
          <span>No security audit events matched your filter criteria.</span>
        </div>
      )}
    </section>
  );
}
