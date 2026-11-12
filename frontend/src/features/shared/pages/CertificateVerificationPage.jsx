import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { verifyCertificate } from '../services/certificateVerification.service';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import './CertificateVerificationPage.css';

export default function CertificateVerificationPage() {
  const { certificateNumber = '' } = useParams();
  const [state, setState] = useState(() => ({ number: certificateNumber, loading: true, result: null, error: '' }));

  useEffect(() => {
    let active = true;
    verifyCertificate(certificateNumber)
      .then((result) => { if (active) setState({ number: certificateNumber, loading: false, result, error: '' }); })
      .catch((error) => {
        if (active) setState({
          number: certificateNumber,
          loading: false,
          result: error.response?.data || null,
          error: error.response?.data?.message || 'Certificate verification is temporarily unavailable.',
        });
      });
    return () => { active = false; };
  }, [certificateNumber]);

  const currentResult = state.number === certificateNumber;
  const loading = !currentResult || state.loading;
  const result = currentResult ? state.result : null;
  const error = currentResult ? state.error : '';
  const status = result?.certificate?.status;
  const title = loading ? 'Checking certificate…'
    : result?.valid ? 'Certificate verified'
      : status === 'revoked' ? 'Certificate revoked'
        : 'Certificate not verified';

  return (
    <main className="certificate-verification-page">
      <section className={`certificate-verification-card ${result?.valid ? 'is-valid' : status === 'revoked' ? 'is-revoked' : ''}`} aria-live="polite">
        <div className="certificate-verification-mark" aria-hidden="true">
          {loading ? (
            <Loader2 size={24} className="spin" />
          ) : result?.valid ? (
            <CheckCircle2 size={24} style={{ color: '#10B981' }} />
          ) : status === 'revoked' ? (
            <XCircle size={24} style={{ color: '#EF4444' }} />
          ) : (
            <AlertCircle size={24} style={{ color: '#F59E0B' }} />
          )}
        </div>
        <p className="certificate-verification-eyebrow">UPTOSKILL · CERTIFICATE SERVICES</p>
        <h1>{title}</h1>
        {loading ? (
          <p>Checking the official credential ledger record…</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : result?.valid ? (
          <>
            <p>This certificate is authentically recorded as issued by UptoSkills Inc.</p>
            <dl>
              <div><dt>Certificate number</dt><dd>{result.certificate.certificateNumber}</dd></div>
              <div><dt>Recipient</dt><dd>{result.certificate.internName}</dd></div>
              <div><dt>Certificate type</dt><dd>{result.certificate.certificateType?.replaceAll('_', ' ')}</dd></div>
              {result.certificate.domain && <div><dt>Domain</dt><dd>{result.certificate.domain}</dd></div>}
              {result.certificate.issuedDate && <div><dt>Issue date</dt><dd>{new Date(result.certificate.issuedDate).toLocaleDateString()}</dd></div>}
            </dl>
          </>
        ) : (
          <>
            <p>{result?.message || 'No active certificate record matched this verification link.'}</p>
            {result?.certificate?.certificateNumber && (
              <dl>
                <div><dt>Certificate number</dt><dd>{result.certificate.certificateNumber}</dd></div>
                <div><dt>Status</dt><dd>{status || 'not verified'}</dd></div>
              </dl>
            )}
            {status === 'revoked' && result?.certificate?.revocationReason && (
              <p className="certificate-verification-reason">
                <strong>Reason:</strong> {result.certificate.revocationReason}
              </p>
            )}
          </>
        )}
        <Link to="/login" style={{ marginTop: '20px', display: 'inline-block' }}>Return to portal</Link>
      </section>
    </main>
  );
}
