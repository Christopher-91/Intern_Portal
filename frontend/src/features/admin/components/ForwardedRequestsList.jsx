import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useForwardedRequests from '../hooks/useForwardedRequests';
import { retryCertificateGeneration } from '../services/admin.service';
import Toast from '../../../shared/components/Toast';
import { Inbox, RefreshCw, CheckCircle2, XCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import './ForwardedRequestsList.css';

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

export default function ForwardedRequestsList() {
  const navigate = useNavigate();
  const { requests, loading, error, refetch, approveRequest, rejectRequest } = useForwardedRequests();
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState(null);
  const [retryingId, setRetryingId] = useState(null);
  const [toast, setToast] = useState(null);

  const approve = async (id) => {
    setActionError(null);
    try {
      const result = await approveRequest(id);
      if (result?.certificate?._id) {
        navigate(`/admin/certificates/${result.certificate._id}/review`);
      }
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const reject = async (id) => {
    if (!reason.trim()) return;
    setActionError(null);
    try {
      await rejectRequest(id, reason.trim());
      setRejectingId(null);
      setReason('');
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const handleRetry = async (id) => {
    if (!id || retryingId) return;
    setRetryingId(id);
    setToast(null);

    try {
      const result = await retryCertificateGeneration(id);
      setToast({
        type: 'success',
        message: 'Draft certificate generated successfully! Navigating to review…',
      });
      await refetch();
      if (result?.certificate?._id) {
        setTimeout(() => {
          navigate(`/admin/certificates/${result.certificate._id}/review`);
        }, 1200);
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Retry generation failed.',
      });
    } finally {
      setRetryingId(null);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <section className="forwarded-requests-panel" aria-labelledby="forwarded-requests-title">
      <div className="forwarded-requests-heading">
        <div>
          <h2 id="forwarded-requests-title">Certificate Requests Queue</h2>
          <p>Review and finalize requests reviewed and forwarded by Team Leaders.</p>
        </div>
        <span className="forwarded-requests-count">
          <Inbox size={13} />
          <span>{requests.length} awaiting action</span>
        </span>
      </div>

      {toast && (
        <div className="forwarded-toast-wrap">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {loading && (
        <div className="forwarded-requests-state">
          <div className="spinner" aria-hidden="true" />
          <span>Loading forwarded certificate requests…</span>
        </div>
      )}

      {!loading && error && (
        <div className="forwarded-requests-error" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button type="button" onClick={refetch}>Retry</button>
        </div>
      )}

      {!loading && !error && actionError && (
        <div className="forwarded-requests-error" role="alert">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {!loading && !error && !requests.length && (
        <div className="forwarded-requests-state empty">
          <CheckCircle2 size={18} style={{ color: '#10B981' }} />
          <span>No requests awaiting approval or recovery. The certificate queue is clear.</span>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="forwarded-requests-list">
          {requests.map((request) => {
            const id = request._id || request.id;
            const intern = request.userId || {};
            const certTargetId = request.certificateId?._id || request.certificateId;
            const isApprovedMissingCert = request.status === 'approved' && !certTargetId;
            const isRetrying = retryingId === id;

            return (
              <article className="forwarded-request-row" key={id}>
                <div className="forwarded-request-details">
                  <div className="forwarded-request-title-row">
                    <h3>{intern.fullName || 'Unknown Intern'}</h3>
                    {request.status && (
                      <span className={`forwarded-status-tag ${request.status}`}>
                        {request.status.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <p className="forwarded-request-meta">
                    {intern.internCode || '—'} · {intern.domain || '—'} · Requested on{' '}
                    {formatDate(request.requestedAt || request.createdAt)}
                  </p>

                  <p className="forwarded-cert-type">
                    <FileText size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    <strong>{request.certificateType?.replaceAll('_', ' ') || 'Internship Certificate'}</strong>
                  </p>

                  <p className="forwarded-request-reason">
                    &ldquo;{request.reason || 'No additional notes provided'}&rdquo;
                  </p>
                </div>

                <div className="forwarded-request-actions">
                  {isApprovedMissingCert ? (
                    <button
                      type="button"
                      className="forwarded-retry-button"
                      onClick={() => handleRetry(id)}
                      disabled={isRetrying}
                      title="Recover draft generation for this approved request"
                    >
                      <RefreshCw size={13} className={isRetrying ? 'spin' : ''} />
                      <span>{isRetrying ? 'Generating…' : 'Retry Draft'}</span>
                    </button>
                  ) : rejectingId === id ? (
                    <div className="forwarded-reject-form">
                      <input
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Rejection justification…"
                        aria-label="Rejection reason"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="confirm-reject-btn"
                        onClick={() => reject(id)}
                        disabled={!reason.trim()}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="cancel-reject-btn"
                        onClick={() => {
                          setRejectingId(null);
                          setReason('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="forwarded-review-button"
                        onClick={() => certTargetId && navigate(`/admin/certificates/${certTargetId}/review`)}
                        disabled={!certTargetId}
                        title={
                          certTargetId
                            ? 'Review certificate HTML and template'
                            : 'Approve request to generate and review draft'
                        }
                      >
                        <span>Review</span>
                        <ArrowRight size={13} />
                      </button>
                      <button
                        type="button"
                        className="forwarded-approve-button"
                        onClick={() => approve(id)}
                      >
                        <CheckCircle2 size={13} />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        className="forwarded-reject-button"
                        onClick={() => setRejectingId(id)}
                      >
                        <XCircle size={13} />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
