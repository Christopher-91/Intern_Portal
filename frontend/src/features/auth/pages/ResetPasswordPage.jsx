import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { resetPassword as resetPasswordRequest } from '../services/auth.service';
import BrandLogo from '../../shared/components/BrandLogo';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import '../../../app/App.css';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const data = await resetPasswordRequest(token, newPassword);
      setSuccess(data.message || 'Password has been successfully reset.');
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong, please try again');
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
            <span>Account Security</span>
          </div>

          <h1>
            Set your new <span>account password</span>
          </h1>

          <p>
            Choose a strong, unique password to secure your administrative portal and intern records.
          </p>

          <div className="brand-feature-list">
            <div className="brand-feature-item">
              <ShieldCheck size={18} />
              <span>Requires minimum 8 characters with high entropy</span>
            </div>
            <div className="brand-feature-item">
              <Lock size={18} />
              <span>Encrypted with industry standard salted hashing</span>
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
            <h2>Create New Password</h2>
            <p className="sub">Enter and confirm your updated access credentials below.</p>
          </div>

          {success ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="auth-status success" role="status">
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </div>
              <Link className="primary auth-button-link" to="/login" style={{ textDecoration: 'none' }}>
                <span>Proceed to Sign In</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label className="field">
                <span className="field-label">
                  <b>New Password</b>
                </span>
                <div className="input-wrap">
                  <span className="input-icon">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <label className="field">
                <span className="field-label">
                  <b>Confirm New Password</b>
                </span>
                <div className="input-wrap">
                  <span className="input-icon">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
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
                disabled={loading || !newPassword || !confirmPassword}
                style={{ marginTop: '16px' }}
              >
                {loading ? <span className="spinner" aria-hidden="true" /> : 'Update Password'}
              </button>
            </form>
          )}

          {!success && (
            <Link className="auth-link" to="/forgot-password" style={{ textAlign: 'center', width: '100%' }}>
              Need a new reset link?
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
