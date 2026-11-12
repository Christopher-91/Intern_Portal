import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import CreateIntern from '../components/CreateIntern';
import MyInternsList from '../components/MyInternsList';
import UpcomingCompletions from '../components/UpcomingCompletions';
import PendingReviewList from '../components/PendingReviewList';
import { getUpcomingCompletions } from '../services/tl.service';
import NotificationBell from '../../shared/components/NotificationBell';
import BrandLogo from '../../shared/components/BrandLogo';
import {
  LayoutDashboard,
  Inbox,
  Users,
  UserPlus,
  LogOut,
  Briefcase,
  Calendar,
  Phone,
  Sparkles,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import './TLDashboard.css';

const TLDashboard = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [fallbackView, setFallbackView] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeView = searchParams.get('view') || fallbackView;
  const [upcomingCompletions, setUpcomingCompletions] = useState([]);

  useEffect(() => {
    const fetchUpcomingCompletions = async () => {
      try {
        const data = await getUpcomingCompletions();
        setUpcomingCompletions(data.upcomingCompletions || []);
      } catch (error) {
        console.error('Failed to fetch upcoming completions:', error);
      }
    };

    fetchUpcomingCompletions();
  }, []);

  const initials = (user?.fullName || 'Team Leader')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const logout = () => {
    handleLogout();
    navigate('/login');
  };

  const changeView = (view) => {
    setFallbackView(view);
    setMobileMenuOpen(false);
    if (searchParams.has('view')) setSearchParams({});
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'requests':
        return 'Certificate Requests';
      case 'myInterns':
        return 'Assigned Interns';
      case 'intern':
        return 'Register Intern';
      case 'overview':
      default:
        return 'Team Workspace';
    }
  };

  const getPageDescription = () => {
    switch (activeView) {
      case 'requests':
        return 'Review and verify certificate requests from your interns before forwarding to Admin.';
      case 'myInterns':
        return 'Directory of all active and upcoming interns assigned to your direct supervision.';
      case 'intern':
        return 'Provision and onboard a new intern directly to your supervision group.';
      case 'overview':
      default:
        return 'Supervise intern milestones, review credentials, and oversee cohort tenures.';
    }
  };

  return (
    <div className={`admin-dashboard-shell ${mobileMenuOpen ? 'mobile-menu-active' : ''}`}>
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <BrandLogo size="small" subtitle="Team Leader" />

          <div className="admin-breadcrumb-separator" aria-hidden="true">/</div>

          <div className="admin-topbar-breadcrumb">
            <span className="breadcrumb-root">Workspace</span>
            <ChevronRight size={14} className="breadcrumb-arrow" />
            <span className="breadcrumb-active">{getPageTitle()}</span>
          </div>
        </div>

        <div className="admin-topbar-right">
          <NotificationBell />

          <div className="admin-user-profile-menu">
            <div className="admin-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.fullName || 'Team Leader'}</span>
              <span className="admin-user-role">Lead Supervisor</span>
            </div>

            <button
              type="button"
              className="admin-logout-btn"
              onClick={logout}
              title="Sign out of supervisor portal"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`} aria-label="Team leader navigation">
        <div className="admin-sidebar-scroll">
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
                className={`admin-nav-item ${activeView === 'requests' ? 'active' : ''}`}
                onClick={() => changeView('requests')}
              >
                <Inbox size={18} />
                <span>Certificate Requests</span>
              </button>
            </nav>
          </div>

          <div className="admin-nav-group">
            <p className="admin-sidebar-label">TEAM MANAGEMENT</p>
            <nav className="admin-sidebar-nav">
              <button
                type="button"
                className={`admin-nav-item ${activeView === 'myInterns' ? 'active' : ''}`}
                onClick={() => changeView('myInterns')}
              >
                <Users size={18} />
                <span>My Interns</span>
              </button>

              <button
                type="button"
                className={`admin-nav-item ${activeView === 'intern' ? 'active' : ''}`}
                onClick={() => changeView('intern')}
              >
                <UserPlus size={18} />
                <span>Create Intern</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-status">
            <Briefcase size={14} className="status-shield-icon" />
            <div className="status-meta">
              <span className="status-title">Team Leader Active</span>
              <span className="status-desc">Cohort Management</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="admin-dashboard-main">
        <header className="admin-page-header">
          <div className="admin-header-badge">
            <Sparkles size={12} />
            <span>SUPERVISION PORTAL</span>
          </div>
          <h1>{getPageTitle()}</h1>
          <p className="admin-header-description">{getPageDescription()}</p>
        </header>

        {activeView === 'overview' ? (
          <>
            <section className="admin-profile-card" aria-label="Team leader profile">
              <div className="admin-profile-heading">
                <div className="admin-profile-avatar">
                  {initials}
                </div>
                <div className="admin-profile-meta">
                  <div className="admin-profile-badge-row">
                    <span className="admin-badge admin-badge-primary">Team Leader</span>
                    <span className="admin-badge admin-badge-neutral">Cohort Lead</span>
                  </div>
                  <h2>{user?.fullName || 'Team Leader'}</h2>
                  <p className="admin-profile-email">{user?.email || 'teamleader@uptoskills.com'}</p>
                </div>
              </div>

              <div className="admin-profile-details">
                <div className="admin-detail-item">
                  <div className="detail-item-icon">
                    <Briefcase size={16} />
                  </div>
                  <div className="detail-item-content">
                    <span>Supervisor Role</span>
                    <strong>{user?.role || 'Team Leader'}</strong>
                  </div>
                </div>

                <div className="admin-detail-item">
                  <div className="detail-item-icon">
                    <Phone size={16} />
                  </div>
                  <div className="detail-item-content">
                    <span>Direct Line</span>
                    <strong>{user?.mobileNo || 'Verified Internal'}</strong>
                  </div>
                </div>

                <div className="admin-detail-item">
                  <div className="detail-item-icon">
                    <Calendar size={16} />
                  </div>
                  <div className="detail-item-content">
                    <span>Member Since</span>
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

              <div className="admin-quick-actions-section">
                <h3 className="section-subtitle">Leader Shortcuts</h3>
                <div className="admin-quick-actions">
                  <button type="button" onClick={() => changeView('requests')}>
                    <span className="action-icon-wrap">
                      <Inbox size={20} />
                    </span>
                    <div className="action-text-wrap">
                      <strong>Review Requests</strong>
                      <small>Inspect & forward intern certificates to admin</small>
                    </div>
                  </button>

                  <button type="button" onClick={() => changeView('myInterns')}>
                    <span className="action-icon-wrap">
                      <Users size={20} />
                    </span>
                    <div className="action-text-wrap">
                      <strong>My Interns</strong>
                      <small>View and manage assigned cohort records</small>
                    </div>
                  </button>

                  <button type="button" onClick={() => changeView('intern')}>
                    <span className="action-icon-wrap">
                      <UserPlus size={20} />
                    </span>
                    <div className="action-text-wrap">
                      <strong>Create Intern</strong>
                      <small>Provision a new intern profile to your team</small>
                    </div>
                  </button>
                </div>
              </div>
            </section>

            <div>
              <UpcomingCompletions interns={upcomingCompletions} />
            </div>
          </>
        ) : activeView === 'requests' ? (
          <PendingReviewList />
        ) : activeView === 'myInterns' ? (
          <MyInternsList />
        ) : (
          <div className="teamleader-form-grid">
            <CreateIntern />
          </div>
        )}
      </main>
    </div>
  );
};

export default TLDashboard;
