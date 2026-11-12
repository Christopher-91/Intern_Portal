import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button 
      className="theme-toggle" 
      onClick={onToggle} 
      type="button"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
