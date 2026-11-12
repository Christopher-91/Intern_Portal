import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCertificates, downloadAdminCertificate, revokeAdminCertificate, unrevokeAdminCertificate } from '../services/admin.service';
import Toast from '../../../shared/components/Toast';
import { Award, Download, RefreshCw, AlertCircle, ArrowRight, RotateCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import './CertificatesOverview.css';

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function CertificatesOverview() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCertificates();
      setCertificates(data.certificates || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getAllCertificates()
      .then((data) => {
        if (isMounted) {
          setCertificates(data.certificates || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to load certificates');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownload = async (cert) => {
    if (!cert._id || downloadingId) return;

    setDownloadingId(cert._id);
    try {
      const safeName = `${(cert.certificateNumber || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      await downloadAdminCertificate(cert._id, safeName);
      setToast({ type: 'success', message: `Downloaded ${cert.certificateNumber} successfully.` });
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Unable to download certificate PDF.'
      });
    } finally {
      setDownloadingId(null);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleRevoke = async (cert) => {
    const reason = window.prompt(`Enter the reason for revoking certificate ${cert.certificateNumber}:`);
    if (reason === null) return;
    if (!reason.trim()) {
      setToast({ type: 'error', message: 'A revocation reason is required.' });
      return;
    }
    setRevokingId(cert._id);
    try {
      const result = await revokeAdminCertificate(cert._id, reason.trim());
      setCertificates((current) =>
        current.map((item) =>
          item._id === cert._id
            ? { ...item, ...(result.certificate || {}), status: 'revoked' }
            : item
        )
      );
      setToast({ type: 'success', message: `Certificate ${cert.certificateNumber} revoked.` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to revoke certificate.' });
    } finally {
      setRevokingId(null);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleUnrevoke = async (cert) => {
    if (!window.confirm(`Reinstate certificate ${cert.certificateNumber}?`)) return;
    setRevokingId(cert._id);
    try {
      const result = await unrevokeAdminCertificate(cert._id);
      setCertificates((current) =>
        current.map((item) =>
          item._id === cert._id
            ? { ...item, ...(result.certificate || {}), status: result.certificate?.status || 'issued' }
            : item
        )
      );
      setToast({ type: 'success', message: `Certificate ${cert.certificateNumber} reinstated.` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Unable to reinstate certificate.' });
    } finally {
      setRevokingId(null);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <section className="certificates-overview-panel" aria-labelledby="cert-overview-title">
      <div className="certificates-overview-heading">
        <div>
          <h2 id="cert-overview-title">Issued Certificates Ledger</h2>
          <p className="cert-overview-subtext">
            Oversight of all credentials generated, published, and finalized across the organization.
          </p>
        </div>
        <div className="cert-overview-actions">
          <span className="cert-overview-count">
            <Award size={13} />
            <span>{certificates.length} Total</span>
          </span>
          <button
            type="button"
            className="cert-overview-refresh"
            onClick={fetchCertificates}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="cert-overview-toast">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {loading && (
        <div className="cert-overview-state" role="status">
          <div className="cert-overview-spinner" aria-hidden="true" />
          <p>Loading certificate ledger…</p>
        </div>
      )}

      {!loading && error && (
        <div className="cert-overview-error" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button type="button" onClick={fetchCertificates}>Retry</button>
        </div>
      )}

      {!loading && !error && certificates.length === 0 && (
        <div className="cert-overview-empty">
          <div className="cert-empty-icon-wrap" aria-hidden="true">
            <Award size={28} />
          </div>
          <h3>No Certificates Generated Yet</h3>
          <p>When certificate drafts are approved and finalized, their official records will appear here.</p>
        </div>
      )}

      {!loading && !error && certificates.length > 0 && (
        <div className="cert-overview-table-wrap">
          <table className="cert-overview-table">
            <thead>
              <tr>
                <th>Certificate No.</th>
                <th>Intern Name</th>
                <th>Intern Code</th>
                <th>Credential Type</th>
                <th>Issued Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => {
                const isFinalized = cert.status === 'finalized';
                const canRevoke = ['finalized', 'issued'].includes(cert.status);
                const hasPdf = Boolean(cert.pdfPath) && isFinalized;
                const isDownloading = downloadingId === cert._id;
                const intern = cert.userId || {};

                return (
                  <tr key={cert._id}>
                    <td>
                      <code className="cert-num-code">{cert.certificateNumber}</code>
                    </td>
                    <td>
                      <strong>{intern.fullName || '—'}</strong>
                    </td>
                    <td>
                      <span className="cert-intern-code">{cert.internCode || intern.internCode || '—'}</span>
                    </td>
                    <td>
                      <span className="cert-type-text">
                        {cert.certificateType ? cert.certificateType.replace(/_/g, ' ') : '—'}
                      </span>
                    </td>
                    <td>{formatDate(cert.issuedDate || cert.createdAt)}</td>
                    <td>
                      <span className={`cert-status-tag ${cert.status === 'revoked' ? 'is-revoked' : isFinalized ? 'is-finalized' : 'is-draft'}`}>
                        {cert.status ? cert.status.toUpperCase() : 'UNKNOWN'}
                      </span>
                    </td>
                    <td>
                      <div className="cert-row-actions">
                        {hasPdf ? (
                          <button
                            type="button"
                            className="cert-pdf-btn"
                            onClick={() => handleDownload(cert)}
                            disabled={isDownloading}
                            title="Download official finalized PDF"
                          >
                            <Download size={13} />
                            <span>{isDownloading ? 'Downloading…' : 'PDF'}</span>
                          </button>
                        ) : cert.status === 'draft' ? (
                          <button
                            type="button"
                            className="cert-review-link-btn"
                            onClick={() => navigate(`/admin/certificates/${cert._id}/review`)}
                            title="Open draft in review editor"
                          >
                            <span>Review Draft</span>
                            <ArrowRight size={13} />
                          </button>
                        ) : (
                          <span className="cert-pdf-unavailable" title="PDF is not available">
                            Unavailable
                          </span>
                        )}

                        {canRevoke && (
                          <button
                            type="button"
                            className="cert-revoke-btn"
                            onClick={() => handleRevoke(cert)}
                            disabled={revokingId === cert._id}
                          >
                            <ShieldAlert size={12} />
                            <span>{revokingId === cert._id ? 'Revoking…' : 'Revoke'}</span>
                          </button>
                        )}

                        {cert.status === 'revoked' && (
                          <button
                            type="button"
                            className="cert-reinstate-btn"
                            onClick={() => handleUnrevoke(cert)}
                            disabled={revokingId === cert._id}
                          >
                            <RotateCcw size={12} />
                            <span>{revokingId === cert._id ? 'Reinstating…' : 'Reinstate'}</span>
                          </button>
                        )}
                      </div>
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
