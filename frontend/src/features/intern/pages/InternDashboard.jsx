import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIntern } from '../hooks/useIntern';
import { useAuth } from '../../auth/hooks/useAuth';
import RequestCertificateModal from '../components/RequestCertificateModal';
import MyRequestsList from '../components/MyRequestsList';
import NotificationBell from '../../shared/components/NotificationBell';
import BrandLogo from '../../shared/components/BrandLogo';
import {
  LayoutDashboard,
  Award,
  LogOut,
  Mail,
  KeyRound,
  Code,
  GraduationCap,
  CheckCircle2,
  Phone,
  Tag,
  Laptop,
  Calendar,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  ArrowRight,
  Clock,
  Percent,
  AlertCircle,
  FileText,
  User
} from 'lucide-react';
import './InternDashboard.css';
import '../../../app/App.css';

/* helpers */
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const calcProgress = (start, end) => {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (!s || !e || e <= s) return 0;
  const pct = ((now - s) / (e - s)) * 100;
  return Math.min(Math.max(Math.round(pct), 0), 100);
};

const calcDaysLeft = (end) => {
  if (!end) return '—';
  const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86_400_000);
  return diff > 0 ? diff : 0;
};

/* nav items */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Award, label: 'Certificates', id: 'certificates' },
];

/* ============================================================
   InternDashboard
   ============================================================ */
export default function InternDashboard() {
  const { profile, archiveNotice, loading, error, fetchProfile } = useIntern();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [fallbackNav, setFallbackNav] = useState('dashboard');
  const activeNav = searchParams.get('view') || fallbackNav;
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };
  const changeNav = (view) => {
    setFallbackNav(view);
    if (searchParams.has('view')) setSearchParams({});
  };

  /* derived */
  const initials = profile ? getInitials(profile.fullName) : '?';
  const progress = profile
    ? calcProgress(profile.startDate, profile.endDate)
    : 0;
  const daysLeft = profile ? calcDaysLeft(profile.endDate) : '—';

  /* render */
  return (
    <div className="intern-dashboard-page">
      {/* ─── Top Navbar ─── */}
      <nav className="id-navbar">
        <div className="id-brand">
          <BrandLogo size="small" subtitle="Intern" />
        </div>

        <div className="id-nav-right">
          <NotificationBell />
          <div className="id-avatar" aria-label="User avatar">
            {initials}
          </div>
          <div className="id-user-info">
            <strong>{profile?.fullName ?? 'Loading…'}</strong>
            <small>{profile?.email ?? ''}</small>
          </div>

          <button
            id="intern-logout-btn"
            className="id-logout-btn"
            onClick={onLogout}
            title="Sign out of intern portal"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </nav>

      {/* ─── Sidebar ─── */}
      <aside className="id-sidebar" role="navigation" aria-label="Sidebar">
        <p className="id-sidebar-label">WORKSPACE</p>
        <nav className="id-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                className={`id-nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => changeNav(item.id)}
              >
                <span className="id-nav-icon">
                  <Icon size={16} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="id-main">
        {/* Page header */}
        <header className="id-page-header">
          <h1 className="id-greeting">
            Welcome back, <em>{profile?.fullName ?? 'Intern'}</em>
          </h1>
          <p className="id-subtext">
            Here is your active internship tenure overview and credential progress.
          </p>
        </header>

        {activeNav === 'dashboard' && archiveNotice && (
          <div className="id-archive-warning" role="status">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: '#F59E0B' }} />
              <strong>Account Archival Notice</strong>
            </div>
            <span>
              Your account is scheduled for archival on {formatDate(archiveNotice.archiveDate)}.
              {' '}You have {archiveNotice.daysUntilArchive} day{archiveNotice.daysUntilArchive === 1 ? '' : 's'} remaining to access your portal records and download official certificates.
            </span>
          </div>
        )}

        {activeNav === 'certificates' && (
          <>
            <section className="certificate-actions" aria-label="Certificate requests">
              <div>
                <h2>Request a Certificate</h2>
                <p>Submit certificate requests for completed milestones and verify issuance status.</p>
              </div>
              <button
                type="button"
                className="request-primary-button"
                onClick={() => setShowCertificateModal(true)}
              >
                <Award size={14} style={{ display: 'inline', marginRight: '6px' }} />
                <span>New Certificate Request</span>
              </button>
            </section>
            <MyRequestsList />
          </>
        )}

        {/* ── Loading state ── */}
        {activeNav === 'dashboard' && loading && (
          <div className="id-loading" role="status" aria-live="polite">
            <div className="id-spinner" aria-hidden="true" />
            <span>Loading internship profile…</span>
          </div>
        )}

        {/* ── Error state ── */}
        {activeNav === 'dashboard' && !loading && error && (
          <div className="id-error" role="alert">
            <AlertCircle size={28} className="id-error-icon" />
            <span>{error}</span>
            <button
              id="retry-profile-btn"
              className="id-retry-btn"
              onClick={fetchProfile}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Profile data ── */}
        {activeNav === 'dashboard' && !loading && !error && profile && (
          <>
            {/* Profile Card */}
            <section className="id-profile-card" aria-label="Profile details">
              <div className="id-profile-header">
                <div className="id-profile-avatar" aria-hidden="true">
                  {initials}
                </div>
                <div className="id-profile-identity">
                  <h2 className="id-profile-name">{profile.fullName}</h2>
                  <p className="id-profile-email">
                    <Mail size={13} style={{ display: 'inline', marginRight: '6px' }} />
                    {profile.email}
                  </p>
                  <div className="id-badge-row">
                    <span className="id-badge id-badge-code">
                      <KeyRound size={11} />
                      <span>{profile.internCode}</span>
                    </span>
                    <span className="id-badge id-badge-domain">
                      <Code size={11} />
                      <span>{profile.domain}</span>
                    </span>
                    <span className="id-badge id-badge-role">
                      <GraduationCap size={11} />
                      <span>{profile.role}</span>
                    </span>
                    <span className="id-badge id-badge-active">
                      <CheckCircle2 size={11} />
                      <span>Active</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail grid */}
              <div className="id-detail-grid">
                <div className="id-detail-item">
                  <div className="id-detail-label">
                    <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    <span>Mobile Contact</span>
                  </div>
                  <div className="id-detail-value">{profile.mobileNo || 'Not provided'}</div>
                </div>

                <div className="id-detail-item">
                  <div className="id-detail-label">
                    <Tag size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    <span>Intern Code</span>
                  </div>
                  <div className="id-detail-value">{profile.internCode}</div>
                </div>

                <div className="id-detail-item">
                  <div className="id-detail-label">
                    <Laptop size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    <span>Domain Track</span>
                  </div>
                  <div className="id-detail-value">{profile.domain}</div>
                </div>

                <div className="id-detail-item">
                  <div className="id-detail-label">
                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    <span>Member Since</span>
                  </div>
                  <div className="id-detail-value">
                    {formatDate(profile.createdAt)}
                  </div>
                </div>
              </div>
            </section>

            {/* Internship Timeline */}
            <section aria-label="Internship timeline">
              <h3 className="id-section-title">
                <CalendarDays size={16} style={{ display: 'inline', marginRight: '6px' }} />
                <span>Internship Tenure & Milestones</span>
              </h3>
              <div className="id-timeline-card">
                <div className="id-date-row">
                  <div className="id-date-block start">
                    <div className="id-date-label">
                      <CalendarCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      <span>Start Date</span>
                    </div>
                    <div className="id-date-value">
                      {formatDate(profile.startDate)}
                    </div>
                  </div>

                  <div className="id-arrow" aria-hidden="true">
                    <ArrowRight size={18} />
                  </div>

                  <div className="id-date-block end">
                    <div className="id-date-label">
                      <CalendarClock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      <span>End Date</span>
                    </div>
                    <div className="id-date-value">
                      {formatDate(profile.endDate)}
                    </div>
                  </div>
                </div>

                <div className="id-progress-wrapper">
                  <div className="id-progress-label">
                    <span>Program Completion</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div
                    className="id-progress-track"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="id-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Stat Grid */}
            <div className="id-stat-grid" aria-label="Quick stats">
              <div className="id-stat-card">
                <div className="id-stat-icon accent">
                  <User size={18} />
                </div>
                <div className="id-stat-label">Role</div>
                <div className="id-stat-value accent">{profile.role}</div>
              </div>

              <div className="id-stat-card">
                <div className="id-stat-icon success">
                  <Code size={18} />
                </div>
                <div className="id-stat-label">Track</div>
                <div className="id-stat-value success">{profile.domain}</div>
              </div>

              <div className="id-stat-card">
                <div className="id-stat-icon warning">
                  <Clock size={18} />
                </div>
                <div className="id-stat-label">Days Remaining</div>
                <div className="id-stat-value warning">{daysLeft}</div>
              </div>

              <div className="id-stat-card">
                <div className="id-stat-icon info">
                  <Percent size={18} />
                </div>
                <div className="id-stat-label">Elapsed</div>
                <div className="id-stat-value info">{progress}%</div>
              </div>
            </div>
          </>
        )}
      </main>
      {showCertificateModal && <RequestCertificateModal onClose={() => setShowCertificateModal(false)} />}
    </div>
  );
}
