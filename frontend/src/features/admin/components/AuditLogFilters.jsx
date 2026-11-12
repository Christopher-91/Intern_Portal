import { Filter, Download, RotateCcw } from 'lucide-react';

export default function AuditLogFilters({ filters, onChange, onExport, exporting }) {
  return (
    <form
      className="audit-filters"
      onSubmit={(event) => {
        event.preventDefault();
        onChange({ ...filters, page: 1 });
      }}
    >
      <label>
        <span>Action Type</span>
        <input
          value={filters.action || ''}
          onChange={(e) => onChange({ ...filters, action: e.target.value, page: 1 })}
          placeholder="e.g. LOGIN_SUCCESS, CERT_REVOKED"
        />
      </label>

      <label>
        <span>Actor Role</span>
        <select
          value={filters.actorRole || ''}
          onChange={(e) => onChange({ ...filters, actorRole: e.target.value, page: 1 })}
        >
          <option value="">All Roles</option>
          <option value="admin">Administrator</option>
          <option value="teamleader">Team Leader</option>
          <option value="intern">Intern</option>
          <option value="system">System Daemon</option>
        </select>
      </label>

      <label>
        <span>Target Resource</span>
        <input
          value={filters.targetType || ''}
          onChange={(e) => onChange({ ...filters, targetType: e.target.value, page: 1 })}
          placeholder="User, Certificate…"
        />
      </label>

      <label>
        <span>Actor ID</span>
        <input
          value={filters.actorId || ''}
          onChange={(e) => onChange({ ...filters, actorId: e.target.value, page: 1 })}
          placeholder="24-char ObjectID"
        />
      </label>

      <label>
        <span>From Date</span>
        <input
          type="date"
          value={filters.from || ''}
          onChange={(e) => onChange({ ...filters, from: e.target.value, page: 1 })}
        />
      </label>

      <label>
        <span>To Date</span>
        <input
          type="date"
          value={filters.to || ''}
          onChange={(e) => onChange({ ...filters, to: e.target.value, page: 1 })}
        />
      </label>

      <div className="audit-filter-actions">
        <button type="submit" className="audit-primary-btn">
          <Filter size={13} />
          <span>Apply Filters</span>
        </button>

        <button
          type="button"
          className="audit-secondary-btn"
          disabled={exporting}
          onClick={onExport}
        >
          <Download size={13} />
          <span>{exporting ? 'Preparing…' : 'Export CSV'}</span>
        </button>
      </div>
    </form>
  );
}
