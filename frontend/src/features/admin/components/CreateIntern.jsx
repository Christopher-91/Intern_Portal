import { useState } from 'react';
import { createIntern } from '../services/admin.service';
import { UserPlus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const initialValues = {
  fullName: '',
  email: '',
  mobileNo: '',
  domain: '',
  teamleaderEmail: '',
  startDate: '',
  endDate: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};

  if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!emailPattern.test(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.mobileNo.trim()) errors.mobileNo = 'Mobile number is required.';
  if (!values.domain.trim()) errors.domain = 'Domain is required.';
  if (!values.teamleaderEmail.trim()) errors.teamleaderEmail = 'Team leader email is required.';
  else if (!emailPattern.test(values.teamleaderEmail)) errors.teamleaderEmail = 'Enter a valid team leader email address.';
  if (!values.startDate) errors.startDate = 'Start date is required.';
  if (!values.endDate) errors.endDate = 'End date is required.';
  else if (values.startDate && values.endDate < values.startDate) errors.endDate = 'End date must be after the start date.';

  return errors;
}

export default function CreateIntern() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = ({ target }) => {
    setValues((current) => ({ ...current, [target.name]: target.value }));
    setErrors((current) => ({ ...current, [target.name]: undefined }));
    setStatus(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setLoading(true);
    setStatus(null);
    try {
      const response = await createIntern({
        ...values,
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        mobileNo: values.mobileNo.trim(),
        domain: values.domain.trim(),
        teamleaderEmail: values.teamleaderEmail.trim().toLowerCase(),
      });
      setValues(initialValues);
      setErrors({});
      setStatus({ type: 'success', message: response.message || 'Intern account provisioned successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to create intern.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-form-panel">
      <div className="admin-form-heading">
        <div className="admin-form-icon-container">
          <UserPlus size={20} />
        </div>
        <div>
          <h2>Provision Intern Account</h2>
          <p>Register a new intern and assign their track, tenure dates, and reporting team leader.</p>
        </div>
      </div>

      <form className="admin-form" onSubmit={submit} noValidate>
        <div className="admin-form-grid">
          <FormField label="Full Name *" name="fullName" value={values.fullName} onChange={handleChange} error={errors.fullName} placeholder="Jane Doe" />
          <FormField label="Email Address *" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} placeholder="jane.doe@example.com" />
          <FormField label="Mobile Number *" name="mobileNo" type="tel" value={values.mobileNo} onChange={handleChange} error={errors.mobileNo} placeholder="+1 555 0192" />
          <FormField label="Domain / Track *" name="domain" value={values.domain} onChange={handleChange} error={errors.domain} placeholder="e.g. Full Stack Engineering" />
          <FormField label="Assigned Team Leader Email *" name="teamleaderEmail" type="email" value={values.teamleaderEmail} onChange={handleChange} error={errors.teamleaderEmail} placeholder="teamleader@uptoskills.com" />
          <FormField label="Tenure Start Date *" name="startDate" type="date" value={values.startDate} onChange={handleChange} error={errors.startDate} />
          <FormField label="Tenure End Date *" name="endDate" type="date" value={values.endDate} onChange={handleChange} error={errors.endDate} />
        </div>

        <div className="form-submit-row">
          <SubmitButton loading={loading} label="Create Intern Account" />
        </div>

        {status && <StatusMessage status={status} />}
      </form>
    </section>
  );
}

function FormField({ label, name, type = 'text', value, onChange, error, placeholder }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
      />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export function SubmitButton({ loading, label }) {
  return (
    <button className="primary admin-submit-btn" type="submit" disabled={loading}>
      {loading ? (
        <>
          <Loader2 size={16} className="spin" />
          <span>Provisioning Account…</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}

export function StatusMessage({ status }) {
  return (
    <div className={`admin-status-box ${status.type}`} role="status">
      {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      <span>{status.message}</span>
    </div>
  );
}
