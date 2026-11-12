import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

import CreateIntern from '../components/CreateIntern';
import CreateTl from '../components/CreateTl';
import ForwardedRequestsList from '../components/ForwardedRequestsList';
import TeamLeadersSection from '../components/TeamLeadersSection';
import CertificatesOverview from '../components/CertificatesOverview';
import AdminInternsList from '../components/AdminInternsList';
import AdminUpcomingCompletions from '../components/AdminUpcomingCompletions';
import RetentionManagement from '../components/RetentionManagement';

import AnalyticsView from '../analytics/pages/AnalyticsView';
import AuditLogsPage from './AuditLogsPage';
import NotificationBell from '../../shared/components/NotificationBell';
import BrandLogo from '../../shared/components/BrandLogo';

import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Users,
  Briefcase,
  UserPlus,
  UserCheck,
  Inbox,
  Award,
  ScrollText,
  Archive,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Shield,
  Activity
} from 'lucide-react';

import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [fallbackView, setFallbackView] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeView = searchParams.get('view') || fallbackView;

  const initials = (user?.fullName || 'Admin')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const logout = () => {
    handleLogout();
    navigate('/login');
  };

  const openCertificateTemplates = () => {
    setMobileMenuOpen(false);
    navigate('/admin/certificate-templates');
  };

  const changeView = (view) => {
    setFallbackView(view);
    setMobileMenuOpen(false);
    if (searchParams.has('view')) setSearchParams({});
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'analytics':
        return 'Admin Analytics';
      case 'interns':
        return 'Intern Management';
      case 'teamleaders':
        return 'Team Leader Roster';
      case 'intern':
        return 'Create Intern Account';
      case 'teamleader':
        return 'Create Team Leader';
      case 'requests':
        return 'Certificate Requests';
      case 'certificates':
        return 'Issued Certificates';
      case 'retention':
        return 'Account Retention & Archives';
      case 'audit':
        return 'Security & Audit Logs';
      case 'overview':
      default:
        return 'Portal Overview';
    }
  };

  const getPageDescription = () => {
    switch (activeView) {
      case 'analytics':
        return 'Real-time performance metrics, issuance speed, team leader bottlenecks, and domain analytics.';
      case 'interns':
        return 'View, filter, edit, and assign or reassign intern accounts across team leaders.';
      case 'teamleaders':
        return 'Directory and workload metrics for all active team leaders and their intern assignments.';
      case 'intern':
        return 'Provision a new intern profile, specify tenure dates, and assign to a team leader.';
      case 'teamleader':
        return 'Create a team leader administrative account with department assignment.';
      case 'requests':
        return 'Review and finalize certificate approval requests forwarded by team leaders.';
      case 'certificates':
        return 'Comprehensive ledger of all generated certificates with verification and revocation controls.';
      case 'retention':
        return 'Configure automated archival policies, manage purge cycles, and restore archived interns.';
      case 'audit':
        return 'Immutable event log recording all authentication, modification, and security operations.';
      case 'overview':
      default:
        return 'Manage portal users, certificate issuances, system health, and administrative workflows.';
    }
  };

  return (
    <div className={`admin-dashboard-shell ${mobileMenuOpen ? 'mobile-menu-active' : ''}`}>
      {/* =========================================================
          TOP BAR
      ========================================================== */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <BrandLogo size="small" subtitle="Admin" />

          <div className="admin-breadcrumb-separator" aria-hidden="true">/</div>

          <div className="admin-topbar-breadcrumb">
            <span className="breadcrumb-root">Workspace</span>
            <ChevronRight size={14} className="breadcrumb-arrow" />
            <span className="breadcrumb-active">{getPageTitle()}</span>
          </div>
        </div>

        <div className="admin-topbar-right">
          <div className="system-status-indicator" title="System operational">
            <span className="status-indicator-dot" />
            <span className="status-indicator-label">Live</span>
          </div>

          <NotificationBell />

          <div className="admin-user-profile-menu">
            <div className="admin-avatar" aria-hidden="true">
              {initials}
            </div>

            <div className="admin-user-info">
              <span className="admin-user-name">{user?.fullName || 'Administrator'}</span>
              <span className="admin-user-role">Super Admin</span>
            </div>

            <button
              type="button"
              className="admin-logout-btn"
              onClick={logout}
              title="Sign out of administration"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop for mobile navigation */}
      {mobileMenuOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================== */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`} aria-label="Admin navigation">
        <div className="admin-sidebar-scroll">
          {/* Group 1: Workspace Core */}
          <div className="admin-nav-group">
            <p className="admin-sidebar-label">WORKSPACE</p>
            <nav className="admin-sidebar-nav">
              <button
                type="button"
                className={`admin-nav-item ${activeView === 'overview' ? 'active' : ''}`}
                onClick={() => changeView('overview')}
              >
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${activeView === 'analytics' ? 'active' : ''}`}
                onClick={() => changeView('analytics')}
              >
                <ChartNoAxesCombined size={18} />
                <span>Analytics</span>
              </button>
            </nav>
          </div>

          {/* Group 2: User Directory */}
          <div className="admin-nav-group">
            <p className="admin-sidebar-label">MANAGEMENT</p>
            <nav className="admin-sidebar-nav">
              <button
                type="button"
                className={`admin-nav-item ${activeView === 'interns' ? 'active' : ''}`}
                onClick={() => changeView('interns')}
              >
                <Users size={18} />
                <span>Intern Management</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${activeView === 'teamleaders' ? 'active' : ''}`}
                onClick={() => changeView('teamleaders')}
              >
                <Briefcase size={18} />
                <span>Team Leaders</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${activeView === 'intern' ? 'active' : ''}`}
                onClick={() => changeView('intern')}
              >
                <UserPlus size={18} />
                <span>Create Intern</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${activeView === 'teamleader' ? 'active' : ''}`}
                onClick={() => changeView('teamleader')}
              >
                <UserCheck size={18} />
                <span>Create Team Leader</span>
              </button>
            </nav>
          </div>

          {/* Group 3: Certification */}
          <div className="admin-nav-group">
            <p className="admin-sidebar-label">CREDENTIALS</p>
            <nav className="admin-sidebar-nav">
              <button
                type="button"
                className={`admin-nav-item ${activeView === 'requests' ? 'active' : ''}`}
                onClick={() => changeView('requests')}
              >
                <Inbox size={18} />
                <span>Certificate Requests</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${activeView === 'certificates' ? 'active' : ''}`}
                onClick={() => changeView('certificates')}
              >
                <Award size={18} />
                <span>Issued Certificates</span>
              </button>

              <button
                type="button"
                className="admin-nav-item"
                onClick={openCertificateTemplates}
              >
                <ScrollText size={18} />
                <span>Certificate Templates</span>
              </button>
            </nav>
          </div>

          {/* Group 4: Governance */}
          <div className="admin-nav-group">
            <p className="admin-sidebar-label">GOVERNANCE</p>
            <nav className="admin-sidebar-nav">
              <button
                type="button"
                className={`admin-nav-item ${activeView === 'retention' ? 'active' : ''}`}
                onClick={() => changeView('retention')}
              >
                <Archive size={18} />
                <span>Account Retention</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${activeView === 'audit' ? 'active' : ''}`}
                onClick={() => changeView('audit')}
              >
                <ShieldCheck size={18} />
                <span>Audit Logs</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-status">
            <Shield size={14} className="status-shield-icon" />
            <div className="status-meta">
              <span className="status-title">Enterprise Shield</span>
              <span className="status-desc">Audited & Encrypted</span>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <main className="admin-dashboard-main">
        {/* Page Header */}
        <header className="admin-page-header">
          <div className="admin-header-badge">
            <Sparkles size={12} />
            <span>PORTAL ADMINISTRATION</span>
          </div>

          <div className="admin-header-title-row">
            <h1>{getPageTitle()}</h1>
          </div>

          <p className="admin-header-description">
            {getPageDescription()}
          </p>
        </header>

        {/* View Routing */}
        {activeView === 'analytics' ? (
          <AnalyticsView onOpenRequests={() => changeView('requests')} />
        ) : activeView === 'overview' ? (
          <>
            {/* Executive Profile Section */}
            <section className="admin-profile-card" aria-label="Administrator profile">
              <div className="admin-profile-heading">
                <div className="admin-profile-avatar">
                  {initials}
                </div>

                <div className="admin-profile-meta">
                  <div className="admin-profile-badge-row">
                    <span className="admin-badge admin-badge-primary">Administrator</span>
                    <span className="admin-badge admin-badge-neutral">Full Privilege</span>
                  </div>
                  <h2>{user?.fullName || 'Administrator'}</h2>
                  <p className="admin-profile-email">{user?.email || 'admin@uptoskills.com'}</p>
                </div>
              </div>

              <div className="admin-profile-details">
                <div className="admin-detail-item">
                  <div className="detail-item-icon">
                    <Shield size={16} />
                  </div>
                  <div className="detail-item-content">
                    <span>Role Access</span>
                    <strong>{user?.role || 'Super Admin'}</strong>
                  </div>
                </div>

                <div className="admin-detail-item">
                  <div className="detail-item-icon">
                    <Phone size={16} />
                  </div>
                  <div className="detail-item-content">
                    <span>Contact Line</span>
                    <strong>{user?.mobileNo || 'Verified Internal'}</strong>
                  </div>
                </div>

                <div className="admin-detail-item">
                  <div className="detail-item-icon">
                    <Calendar size={16} />
                  </div>
                  <div className="detail-item-content">
                    <span>Platform Member</span>
                    <strong>
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Active since launch'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="admin-quick-actions-section">
                <h3 className="section-subtitle">Operational Shortcuts</h3>
                <div className="admin-quick-actions">
                  <button type="button" onClick={() => changeView('analytics')}>
                    <span className="action-icon-wrap">
                      <ChartNoAxesCombined size={20} />
                    </span>
                    <div className="action-text-wrap">
                      <strong>Admin Analytics</strong>
                      <small>Live metrics, bottlenecks & domain trends</small>
                    </div>
                  </button>

                  <button type="button" onClick={() => changeView('interns')}>
                    <span className="action-icon-wrap">
                      <Users size={20} />
                    </span>
                    <div className="action-text-wrap">
                      <strong>Intern Directory</strong>
                      <small>Manage interns & team assignments</small>
                    </div>
                  </button>

                  <button type="button" onClick={() => changeView('teamleaders')}>
                    <span className="action-icon-wrap">
                      <Briefcase size={20} />
                    </span>
                    <div className="action-text-wrap">
                      <strong>Team Leaders</strong>
                      <small>Review leader workload & intern rosters</small>
                    </div>
                  </button>

                  <button type="button" onClick={() => changeView('intern')}>
                    <span className="action-icon-wrap">
                      <UserPlus size={20} />
                    </span>
                    <div className="action-text-wrap">
                      <strong>Create Intern</strong>
                      <small>Register and provision a new intern profile</small>
                    </div>
                  </button>

                  <button type="button" onClick={() => changeView('teamleader')}>
                    <span className="action-icon-wrap">
                      <UserCheck size={20} />
                    </span>
                    <div className="action-text-wrap">
                      <strong>Create Team Leader</strong>
                      <small>Onboard a manager with intern oversight</small>
                    </div>
                  </button>

                  <button type="button" onClick={openCertificateTemplates}>
                    <span className="action-icon-wrap">
                      <ScrollText size={20} />
                    </span>
                    <div className="action-text-wrap">
                      <strong>Certificate Templates</strong>
                      <small>Design credentials via visual HTML builder</small>
                    </div>
                  </button>
                </div>
              </div>
            </section>

            {/* Upcoming completions */}
            <AdminUpcomingCompletions />
          </>
        ) : activeView === 'interns' ? (
          <AdminInternsList />
        ) : activeView === 'teamleaders' ? (
          <TeamLeadersSection />
        ) : activeView === 'intern' ? (
          <CreateIntern />
        ) : activeView === 'teamleader' ? (
          <CreateTl />
        ) : activeView === 'certificates' ? (
          <CertificatesOverview />
        ) : activeView === 'retention' ? (
          <RetentionManagement />
        ) : activeView === 'audit' ? (
          <AuditLogsPage />
        ) : (
          <ForwardedRequestsList />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
