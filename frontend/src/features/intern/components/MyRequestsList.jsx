import { useState } from 'react';
import useCertificateRequests from '../hooks/useCertificateRequests';
import StatusBadge from '../../shared/components/StatusBadge';
import Toast from '../../../shared/components/Toast';
import { getCertificateForRequest, downloadCertificatePdf } from '../services/intern.service';
import { Download, RefreshCw, AlertCircle, FileCheck, Award, Clock } from 'lucide-react';
import './MyRequestsList.css';

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

export default function MyRequestsList() {
  const { requests, loading, error, refetch } = useCertificateRequests();
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  const handleDownload = async (request) => {
    const id = request._id || request.id;
    if (!id || downloadingId) return;

    setDownloadingId(id);
    setDownloadError(null);
    setDownloadSuccess(null);

    try {
      // 1. Fetch certificate metadata to verify backend confirms finalized certificate is available
      const data = await getCertificateForRequest(id);
      const certificate = data.certificate;

      if (!certificate || certificate.status !== 'finalized') {
        throw new Error('Certificate is not finalized or available for download yet.');
      }

      // 2. Download the actual persisted PDF
      const safeFileName = `${(certificate.certificateNumber || request.requestNumber || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      await downloadCertificatePdf(id, safeFileName);

      setDownloadSuccess(`Downloaded certificate ${certificate.certificateNumber || ''} successfully.`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      setDownloadError(err.response?.data?.message || err.message || 'Unable to download certificate. Please try again.');
      setTimeout(() => setDownloadError(null), 5000);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="requests-panel" aria-labelledby="my-requests-title">
      <div className="requests-panel-heading">
        <div>
          <h2 id="my-requests-title">Certificate Request History</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
            Track approvals by your Team Leader and Administration.
          </p>
        </div>
        <button className="requests-refresh" type="button" onClick={refetch} disabled={loading}>
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="requests-toast-wrap">
          <Toast type="success" message={downloadSuccess} onClose={() => setDownloadSuccess(null)} />
        </div>
      )}

      {downloadError && (
        <div className="requests-toast-wrap">
          <Toast type="error" message={downloadError} onClose={() => setDownloadError(null)} />
        </div>
      )}

      {loading && (
        <div className="requests-state">
          <div className="spinner" aria-hidden="true" />
          <span>Loading certificate requests…</span>
        </div>
      )}

      {!loading && error && (
        <div className="requests-state requests-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && !requests.length && (
        <div className="requests-state">
          <Award size={20} style={{ color: 'var(--text-muted)' }} />
          <span>You haven&apos;t submitted any certificate requests yet.</span>
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="requests-table-wrap">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Certificate Type</th>
                <th>Status</th>
                <th>Requested Date</th>
                <th>Official Credential</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const id = request._id || request.id || request.requestNumber;
                const isCompleted = request.status === 'completed';
                const isDownloading = downloadingId === (request._id || request.id);

                return (
                  <tr key={id}>
                    <td>
                      <code>{request.requestNumber || '—'}</code>
                    </td>
                    <td>
                      <strong>{request.certificateType?.replaceAll('_', ' ') || '—'}</strong>
                    </td>
                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                    <td>{formatDate(request.requestedAt || request.createdAt)}</td>
                    <td>
                      {isCompleted ? (
                        <button
                          type="button"
                          className="request-download-btn"
                          onClick={() => handleDownload(request)}
                          disabled={isDownloading}
                          title="Download finalized certificate PDF"
                        >
                          <Download size={13} />
                          <span>{isDownloading ? 'Downloading…' : 'Download PDF'}</span>
                        </button>
                      ) : (
                        <span className="request-action-disabled" title="Available once finalized by admin">
                          <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Awaiting Completion
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
