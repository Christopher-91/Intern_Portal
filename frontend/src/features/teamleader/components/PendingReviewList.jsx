import { useState } from 'react';
import { Send, XCircle, Check, X, Clock, User, AlertCircle, FileCheck } from 'lucide-react';
import useReviewRequests from '../hooks/useReviewRequests';
import './PendingReviewList.css';

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

export default function PendingReviewList() {
  const { requests, loading, error, forwardRequest, rejectRequest } = useReviewRequests();
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const forward = async (id) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await forwardRequest(id);
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async (id) => {
    if (!reason.trim()) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await rejectRequest(id, reason.trim());
      setRejectingId(null);
      setReason('');
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="review-panel" aria-labelledby="review-title">
      <div className="review-heading">
        <div>
          <p className="request-eyebrow">INBOX</p>
          <h2 id="review-title">Pending Certificate Reviews</h2>
          <p className="review-subtitle">Review verification requests submitted by your team before forwarding to admin.</p>
        </div>
        {!loading && (
          <span className="review-count">
            <Clock size={12} />
            {requests.length} pending
          </span>
        )}
      </div>

      {loading && (
        <div className="requests-state">
          <div className="admin-loading-spinner" />
          <span>Loading review queue...</span>
        </div>
      )}

      {!loading && (error || actionError) && (
        <div className="requests-state requests-error" role="alert">
          <AlertCircle size={16} />
          <span>{error || actionError}</span>
        </div>
      )}

      {!loading && !error && !requests.length && (
        <div className="requests-empty">
          <FileCheck size={36} className="requests-empty-icon" />
          <h3>All Caught Up</h3>
          <p>There are no pending certificate requests awaiting review.</p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="review-list">
          {requests.map((request) => {
            const id = request._id || request.id;
            const intern = request.userId || {};
            return (
              <article className="review-row" key={id}>
                <div className="review-details">
                  <div className="review-header-line">
                    <span className="review-intern-avatar">
                      {(intern.fullName || 'U').charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <h3>{intern.fullName || 'Unknown Intern'}</h3>
                      <p className="review-meta">
                        <span className="review-meta-item">{intern.internCode || '—'}</span>
                        <span className="review-meta-sep">•</span>
                        <span className="review-meta-item">{intern.domain || 'General'}</span>
                        <span className="review-meta-sep">•</span>
                        <span className="review-meta-item">{formatDate(request.requestedAt || request.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="review-badge-row">
                    <span className="review-cert-type">
                      {request.certificateType?.replaceAll('_', ' ') || 'Internship Certificate'}
                    </span>
                  </div>

                  {request.reason && (
                    <p className="review-reason">
                      <strong>Note: </strong>
                      {request.reason}
                    </p>
                  )}
                </div>

                <div className="review-actions">
                  {rejectingId === id ? (
                    <div className="reject-form">
                      <input
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Provide reason for rejection..."
                        aria-label="Rejection reason"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="reject-confirm-btn"
                        onClick={() => reject(id)}
                        disabled={!reason.trim() || actionLoading}
                      >
                        <Check size={14} />
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="reject-cancel-btn"
                        onClick={() => {
                          setRejectingId(null);
                          setReason('');
                        }}
                        disabled={actionLoading}
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="action-buttons-group">
                      <button
                        type="button"
                        className="forward-button"
                        onClick={() => forward(id)}
                        disabled={actionLoading}
                        title="Forward request to Admin for generation"
                      >
                        <Send size={13} />
                        Forward to Admin
                      </button>
                      <button
                        type="button"
                        className="reject-button"
                        onClick={() => setRejectingId(id)}
                        disabled={actionLoading}
                        title="Reject request with feedback"
                      >
                        <XCircle size={13} />
                        Reject
                      </button>
                    </div>
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
