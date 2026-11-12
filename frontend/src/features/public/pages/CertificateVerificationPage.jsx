import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';

const PUBLIC_VERIFY_URL = 'http://localhost:3000/api/public/certificates/verify';

export default function CertificateVerificationPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');

  const query = useMemo(() => ({
    certificateNumber: searchParams.get('certificateNumber') || '',
    verificationCode: searchParams.get('verificationCode') || '',
    verifyId: searchParams.get('verifyId') || ''
  }), [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    if (!params.toString()) {
      setStatus('error');
      setError('Missing verification data. Please scan a valid certificate QR code.');
      return;
    }

    fetch(`${PUBLIC_VERIFY_URL}?${params.toString()}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'Verification failed');
        }
        setCertificate(data.certificate || null);
        setStatus(data.certificate?.isValid ? 'valid' : 'invalid');
      })
      .catch((err) => {
        setStatus('error');
        setError(err.message || 'Verification failed');
      });
  }, [query]);

  return (
    <div style={{ maxWidth: 720, margin: '60px auto', padding: 24, fontFamily: 'var(--font-sans, Inter, sans-serif)' }}>
      <div style={{
        border: '1px solid var(--border-subtle, #E5E7EB)',
        borderRadius: 16,
        padding: 32,
        background: status === 'valid' ? '#F0FDF4' : status === 'invalid' ? '#FEF2F2' : '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}>
        <h1 style={{ marginTop: 0, fontSize: 24, fontWeight: 700, color: '#171923' }}>Certificate Verification</h1>

        {status === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6B7280' }}>
            <Loader2 size={18} className="spin" />
            <p>Checking official certificate status…</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#B91C1C', fontWeight: 700 }}>
              <AlertCircle size={18} />
              <span>Verification unavailable</span>
            </div>
            <p style={{ color: '#4B5563', marginTop: 8 }}>{error}</p>
          </div>
        )}

        {status === 'valid' && certificate && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: '#15803D', fontWeight: 700, marginBottom: 16 }}>
              <CheckCircle2 size={26} />
              <span>Verified Authentic</span>
            </div>
            <p><strong>Certificate No:</strong> <code>{certificate.certificateNumber}</code></p>
            <p><strong>Type:</strong> {certificate.certificateType}</p>
            <p><strong>Issued Date:</strong> {new Date(certificate.issuedDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {certificate.status}</p>
            <p><strong>Verification Hash:</strong> <code>{certificate.verifyId}</code></p>
          </div>
        )}

        {status === 'invalid' && certificate && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: '#B91C1C', fontWeight: 700, marginBottom: 16 }}>
              <AlertTriangle size={26} />
              <span>Invalid or Revoked</span>
            </div>
            <p><strong>Certificate No:</strong> <code>{certificate.certificateNumber}</code></p>
            <p><strong>Status:</strong> {certificate.status}</p>
            {certificate.revocationReason && <p><strong>Reason:</strong> {certificate.revocationReason}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
