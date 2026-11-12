import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/auth.service';
import BrandLogo from '../../shared/components/BrandLogo';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ShieldAlert } from 'lucide-react';
import '../../../app/App.css';

const genericError = 'Something went wrong, please try again.';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const data = await forgotPassword(email.trim().toLowerCase());
      setMessage(data.message || 'Password reset link sent if an account with that email exists.');
    } catch {
      setError(genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <aside className="brand-panel">
        <div className="brand-panel-header">
          <BrandLogo size="medium" subtitle="Enterprise" />
        </div>

        <div className="brand-panel-body">
          <div className="brand-panel-tag">
            <KeyRound size={12} />
            <span>Account Recovery</span>
          </div>

          <h1>
            Secure password <span>recovery portal</span>
          </h1>

          <p>
            Recover access to your administrative or intern portal. For security reasons, reset links expire after 1 hour.
          </p>

          <div className="brand-feature-list">
            <div className="brand-feature-item">
              <ShieldAlert size={18} />
              <span>Time-limited, cryptographically signed reset tokens</span>
            </div>
          </div>
        </div>

        <div className="brand-panel-footer">
          <span>&copy; {new Date().getFullYear()} UptoSkills Inc.</span>
        </div>
      </aside>

      <main className="form-side">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Reset your password</h2>
            <p className="sub">Enter your verified organization email to receive recovery instructions.</p>
          </div>

          {message ? (
            <div className="auth-status success" role="status">
              <CheckCircle2 size={16} />
              <span>{message}</span>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label className="field">
                <span className="field-label">
                  <b>Email address</b>
                </span>
                <div className="input-wrap">
                  <span className="input-icon">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@uptoskills.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              {error && (
                <div className="auth-status error" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="primary"
                disabled={loading || !email.trim()}
                style={{ marginTop: '16px' }}
              >
                {loading ? <span className="spinner" aria-hidden="true" /> : 'Send Reset Instructions'}
              </button>
            </form>
          )}

          <Link
            className="auth-link"
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center', width: '100%' }}
          >
            <ArrowLeft size={14} />
            <span>Back to sign in</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
