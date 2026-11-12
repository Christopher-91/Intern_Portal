import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import CertificatePreview from '../components/CertificatePreview';
import CertificateTemplateEditor from '../components/CertificateTemplateEditor';
import useCertificateDraft from '../hooks/useCertificateDraft';
import Toast from '../../../shared/components/Toast';
import BrandLogo from '../../shared/components/BrandLogo';
import {
  ArrowLeft,
  LogOut,
  AlertCircle,
  Info,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
  Save,
  Send,
  FileCheck
} from 'lucide-react';
import './CertificateReviewPage.css';

/**
 * CertificateReviewPage
 *
 * Certificate Review & Finalization Interface.
 * Connects real certificate draft fetching, live HTML editing,
 * iframe-based preview rendering, draft persistence, and
 * final PDF generation + email delivery.
 */
export default function CertificateReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();

  const {
    draft,
    htmlContent,
    setHtmlContent,
    loading,
    saving,
    finalizing,
    error,
    saveError,
    saveSuccess,
    finalizeError,
    finalizeSuccess,
    fetchDraft,
    saveDraft,
    finalizeDraft,
    resetContent
  } = useCertificateDraft(id);

  const [copied, setCopied] = useState(false);
  const [draftDirty, setDraftDirty] = useState(false);
  const [editorController, setEditorController] = useState(null);

  const isFinalized = draft?.status === 'finalized';

  const initials = (user?.fullName || 'Admin')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const onLogout = () => {
    if (draftDirty && !window.confirm('You have unsaved certificate edits. Sign out and discard them?')) return;
    handleLogout();
    navigate('/login');
  };

  const handleBack = () => {
    if (draftDirty && !window.confirm('You have unsaved certificate edits. Leave without saving?')) return;
    navigate('/admin/dashboard?view=requests');
  };

  const handleSaveDraft = async () => {
    const saved = await saveDraft();
    if (saved) {
      setDraftDirty(false);
      editorController?.markSaved?.();
    }
  };

  const handleFinalize = async () => {
    try {
      await finalizeDraft();
      setDraftDirty(false);
      editorController?.markSaved?.();
    } catch {
      // The hook exposes the failure to the page as finalizeError.
    }
  };

  const handleResetDraft = () => {
    resetContent();
    setDraftDirty(false);
    editorController?.markSaved?.();
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Gracefully handle clipboard write rejection
    }
  };

  // Line count for editor metadata
  const lineCount = (htmlContent.match(/\n/g) || []).length + 1;

  return (
    <div className="certificate-review-shell">
      <header className="certificate-review-topbar">
        <div className="certificate-review-brand-row">
          <BrandLogo size="small" subtitle="Cert Review" />
        </div>

        <div className="certificate-review-user-area">
          <div className="certificate-review-avatar" aria-hidden="true">
            {initials}
          </div>
          <div>
            <strong>{user?.fullName || 'Administrator'}</strong>
            <small>{user?.email || 'Admin Portal'}</small>
          </div>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={onLogout}
            title="Sign out"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="certificate-review-main">
        <div className="certificate-review-header-section">
          <div className="certificate-review-back-nav">
            <button
              type="button"
              className="certificate-back-button"
              onClick={handleBack}
              aria-label="Back to Certificate Requests"
            >
              <ArrowLeft size={14} />
              <span>Back to Requests Queue</span>
            </button>
          </div>

          <div className="certificate-review-title-row">
            <div className="certificate-review-title-block">
              <h1>{isFinalized ? 'Finalized Certificate Record' : 'Review & Customize Certificate Draft'}</h1>
              <p>
                {isFinalized
                  ? 'This certificate has been finalized and locked. The official PDF has been rendered and delivered.'
                  : 'Review markup and visual preview. When ready, finalize to generate official vector PDF and deliver to the intern.'}
              </p>
            </div>

            <div className="certificate-review-status-tags">
              <span className={`review-badge-status ${isFinalized ? 'status-finalized' : ''}`}>
                {draft?.status ? draft.status.toUpperCase() : 'DRAFT'}
              </span>
              <span className="review-badge-draft">
                {draft?.certificateType ? draft.certificateType.replace(/_/g, ' ') : 'Certificate'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Feedback Toasts */}
        {finalizeSuccess && (
          <div className="certificate-review-toast-container">
            <Toast
              type={finalizeSuccess.emailSent ? 'success' : 'info'}
              message={
                finalizeSuccess.emailSent
                  ? 'Certificate finalized, PDF generated, and email delivered successfully.'
                  : `Certificate finalized and PDF generated. (${finalizeSuccess.emailError})`
              }
            />
          </div>
        )}

        {finalizeError && (
          <div className="certificate-review-toast-container">
            <Toast type="error" message={finalizeError} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="certificate-review-state-panel loading" role="status">
            <div className="certificate-review-spinner" aria-hidden="true" />
            <p>Loading certificate draft…</p>
          </div>
        )}

        {/* Fetch Error State */}
        {!loading && error && (
          <div className="certificate-review-state-panel error" role="alert">
            <AlertCircle size={24} style={{ color: '#EF4444' }} />
            <div className="certificate-error-content">
              <h3>Unable to load certificate draft.</h3>
              <p>{error}</p>
              <button
                type="button"
                className="certificate-retry-btn"
                onClick={() => fetchDraft(id)}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Content Loaded */}
        {!loading && !error && (
          <>
            {/* Request context banner */}
            <section className="certificate-context-banner" aria-label="Certificate request context">
              <div className="certificate-context-icon" aria-hidden="true">
                <Info size={16} />
              </div>
              <div className="certificate-context-info">
                <div className="certificate-context-info-top">
                  <span className="certificate-context-id">
                    Recipient: <strong>{draft?.userId?.fullName || draft?.internCode || 'Intern'}</strong>
                    {draft?.internCode && <code>({draft.internCode})</code>}
                  </span>
                  <span className="certificate-context-cert-num">
                    Certificate No: <code>{draft?.certificateNumber || 'Draft'}</code>
                  </span>
                  <span className="certificate-context-tag">
                    {isFinalized ? 'Locked Document' : 'Active Draft'}
                  </span>
                </div>
                <p className="certificate-context-desc">
                  {isFinalized
                    ? `This certificate is finalized. The rendered PDF is archived at: ${draft?.pdfPath || 'uploads/certificates'}.`
                    : 'Modify HTML markup and styling below. Real-time preview updates automatically as you edit.'}
                </p>
              </div>
            </section>

            {/* Main review workspace */}
            <div className="certificate-review-workspace">
              {/* Left: Certificate Preview */}
              <CertificatePreview htmlContent={htmlContent} />

              {/* Right: HTML/Content Editor */}
              <section className="certificate-editor-container" aria-label="Certificate HTML editor panel">
                <header className="certificate-editor-header">
                  <div className="certificate-editor-title-group">
                    <h2 className="certificate-editor-title">HTML Template Source</h2>
                    <span className="certificate-editor-meta">{lineCount} lines · {htmlContent.length} chars</span>
                  </div>

                  <div className="certificate-editor-controls">
                    <button
                      type="button"
                      className="editor-action-btn"
                      onClick={handleCopyHtml}
                      title="Copy HTML to clipboard"
                    >
                      {copied ? <Check size={13} style={{ color: '#10B981' }} /> : <Copy size={13} />}
                      <span>{copied ? 'Copied' : 'Copy HTML'}</span>
                    </button>
                    {!isFinalized && (
                      <button
                        type="button"
                        className="editor-action-btn"
                        onClick={handleResetDraft}
                        title="Reset to last saved draft content"
                      >
                        <RotateCcw size={13} />
                        <span>Revert Changes</span>
                      </button>
                    )}
                  </div>
                </header>

                <div className="certificate-editor-body">
                  <p className="certificate-editor-instructions">
                    {isFinalized
                      ? 'This certificate is finalized. Markup is locked in read-only mode.'
                      : 'Modify HTML markup below. The document preview renders updates dynamically.'}
                  </p>

                  <div className="certificate-editor-field">
                    <label htmlFor="certificate-html-editor" className="visually-hidden">
                      Certificate HTML markup
                    </label>
                    <CertificateTemplateEditor
                      key={draft?._id}
                      initialHtml={htmlContent}
                      onChange={setHtmlContent}
                      onDirtyChange={setDraftDirty}
                      onEditorReady={setEditorController}
                      readOnly={isFinalized}
                    />
                  </div>
                </div>

                <footer className="certificate-editor-footer">
                  <div className="editor-save-wrapper">
                    {/* Save Draft Button */}
                    <button
                      type="button"
                      className={`editor-save-btn ${saving ? 'is-saving' : ''}`}
                      onClick={handleSaveDraft}
                      disabled={saving || loading || finalizing || isFinalized}
                      title={isFinalized ? 'Certificate is finalized' : 'Save modifications to the certificate draft'}
                    >
                      <Save size={14} />
                      <span>{saving ? 'Saving…' : 'Save Draft'}</span>
                    </button>

                    {/* Finalize & Send Button */}
                    <button
                      type="button"
                      className={`editor-finalize-btn ${finalizing ? 'is-finalizing' : ''} ${isFinalized ? 'is-finalized' : ''}`}
                      onClick={handleFinalize}
                      disabled={finalizing || saving || loading || isFinalized}
                      title={
                        isFinalized
                          ? 'Certificate is already finalized'
                          : 'Render PDF, finalize document, and send email to intern'
                      }
                    >
                      {isFinalized ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Finalized & Delivered</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>{finalizing ? 'Finalizing & Sending…' : 'Finalize & Send'}</span>
                        </>
                      )}
                    </button>

                    {saveSuccess && (
                      <Toast type="success" message="Draft saved successfully." />
                    )}

                    {saveError && (
                      <div className="editor-save-error-block">
                        <Toast type="error" message={saveError} />
                        <button type="button" className="editor-save-retry" onClick={saveDraft} disabled={saving || finalizing}>Retry save</button>
                      </div>
                    )}
                  </div>

                  <div className="editor-stats-indicator">
                    <span>UTF-8 · HTML5</span>
                  </div>
                </footer>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
