import { CheckCircle2, AlertCircle, Info, Loader2, X } from 'lucide-react';
import './Toast.css';

/**
 * Shared Toast / Alert feedback component.
 *
 * @param {Object} props
 * @param {'success'|'error'|'info'|'loading'} [props.type='info'] - Alert style type
 * @param {string} props.message - Message to display
 * @param {function} [props.onClose] - Optional dismiss handler
 */
export default function Toast({ type = 'info', message, onClose }) {
  if (!message) return null;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="shared-toast-svg" />;
      case 'error':
        return <AlertCircle size={16} className="shared-toast-svg" />;
      case 'loading':
        return <Loader2 size={16} className="shared-toast-svg spin" />;
      case 'info':
      default:
        return <Info size={16} className="shared-toast-svg" />;
    }
  };

  return (
    <div className={`shared-toast shared-toast-${type}`} role="alert" aria-live="polite">
      <span className="shared-toast-icon" aria-hidden="true">
        {renderIcon()}
      </span>
      <span className="shared-toast-message">{message}</span>
      {onClose && (
        <button
          type="button"
          className="shared-toast-close"
          onClick={onClose}
          aria-label="Dismiss message"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
