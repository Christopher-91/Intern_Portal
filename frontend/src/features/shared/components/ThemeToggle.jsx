import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <div className="theme-toggle-root" title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <button
        type="button"
        className={`theme-switch-control ${isDark ? 'is-dark' : 'is-light'}`}
        onClick={onToggle}
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <span className="theme-switch-track">
          <span className="theme-switch-slot slot-light" aria-hidden="true">
            <Sun size={12} strokeWidth={2.4} />
          </span>
          <span className="theme-switch-slot slot-dark" aria-hidden="true">
            <Moon size={12} strokeWidth={2.4} />
          </span>
          <span className="theme-switch-thumb" aria-hidden="true">
            {isDark ? (
              <Moon size={11} strokeWidth={2.6} className="thumb-icon-dark" />
            ) : (
              <Sun size={11} strokeWidth={2.6} className="thumb-icon-light" />
            )}
          </span>
        </span>
      </button>
    </div>
  );
}
