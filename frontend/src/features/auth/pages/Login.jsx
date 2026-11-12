import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from '../../shared/components/BrandLogo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  FileCheck2,
  Users2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import '../../../app/App.css';

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export default function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const isEmailValid = touched.email && !errors.email && values.email.trim() && validateEmail(values.email);
  const isEmailInvalid = touched.email && errors.email;

  const isPasswordValid = touched.password && !errors.password && values.password.trim().length > 0;
  const isPasswordInvalid = touched.password && errors.password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, email: 'Email address is required.' }));
      } else if (!validateEmail(value)) {
        setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.email;
          return next;
        });
      }
    }

    if (name === 'password') {
      if (!value) {
        setErrors((prev) => ({ ...prev, password: 'Password is required.' }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.password;
          return next;
        });
      }
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await handleLogin(values.email.trim().toLowerCase(), values.password);
      setLoading(false);
      notify('success', 'Logged in successfully!');

      const userData = data.user || data;
      navigate(`/${userData.role}/dashboard`);
    } catch (error) {
      console.error(error);
      setLoading(false);
      notify('error', error.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="auth-page">
      {notification && (
        <div className={`notification ${notification.type}`} role="status">
          <span className="notification-icon">
            {notification.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
          </span>
          <span>{notification.message}</span>
          <button className="close-btn" type="button" onClick={() => setNotification(null)} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Left Brand Showcase Panel */}
      <aside className="brand-panel">
        <div className="brand-panel-header">
          <BrandLogo size="medium" subtitle="Enterprise" />
        </div>

        <div className="brand-panel-body">
          <div className="brand-panel-tag">
            <Sparkles size={12} />
            <span>Internship Management Suite</span>
          </div>

          <h1>
            Automate internship lifecycle <span>& credentialing</span>
          </h1>

          <p>
            A unified enterprise workspace for tracking intern cohorts, review workflows, role governance, and generating verifiable cryptographic certificates.
          </p>

          <div className="brand-feature-list">
            <div className="brand-feature-item">
              <ShieldCheck size={18} />
              <span>Tamper-proof certificates with public QR verification</span>
            </div>
            <div className="brand-feature-item">
              <FileCheck2 size={18} />
              <span>Multi-tier review & approval pipelines</span>
            </div>
            <div className="brand-feature-item">
              <Users2 size={18} />
              <span>Dedicated dashboards for Interns, Team Leaders & Admins</span>
            </div>
          </div>
        </div>

        <div className="brand-panel-footer">
          <span>&copy; {new Date().getFullYear()} UptoSkills Inc.</span>
          <span>Enterprise Edition v2.4</span>
        </div>
      </aside>

      {/* Right Login Form Side */}
      <main className="form-side">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p className="sub">Enter your organization credentials to access your dashboard.</p>
          </div>

          <form onSubmit={submit} noValidate>
            <label className="field">
              <span className="field-label">
                <b>Email address</b>
              </span>
              <div className={`input-wrap ${isEmailInvalid ? 'invalid' : isEmailValid ? 'valid' : ''}`}>
                <span className="input-icon">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="name@uptoskills.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="email"
                  required
                />
              </div>
              {isEmailInvalid && (
                <span className="field-error">
                  <AlertCircle size={12} /> {errors.email}
                </span>
              )}
            </label>

            <label className="field">
              <span className="field-label">
                <b>Password</b>
                <Link className="auth-link" to="/forgot-password" style={{ margin: 0, fontSize: '12px' }}>
                  Forgot password?
                </Link>
              </span>
              <div className={`input-wrap ${isPasswordInvalid ? 'invalid' : isPasswordValid ? 'valid' : ''}`}>
                <span className="input-icon">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••••••"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {isPasswordInvalid && (
                <span className="field-error">
                  <AlertCircle size={12} /> {errors.password}
                </span>
              )}
            </label>

            <button
              type="submit"
              className="primary"
              disabled={loading}
              style={{ marginTop: '18px' }}
            >
              {loading ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
