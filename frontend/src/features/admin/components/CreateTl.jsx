import { useState } from 'react';
import { createTeamLeader } from '../services/admin.service';
import { StatusMessage, SubmitButton } from './CreateIntern';
import { UserCheck } from 'lucide-react';

const initialValues = { fullName: '', email: '', mobileNo: '', startDate: '', endDate: '', password: '' };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};
  if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!emailPattern.test(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.mobileNo.trim()) errors.mobileNo = 'Mobile number is required.';
  if (!values.startDate) errors.startDate = 'Start date is required.';
  if (!values.endDate) errors.endDate = 'End date is required.';
  else if (values.startDate && values.endDate < values.startDate) errors.endDate = 'End date must be after the start date.';
  if (!values.password) errors.password = 'Password is required.';
  else if (values.password.length < 6) errors.password = 'Password must be at least 6 characters.';
  return errors;
}

export default function CreateTl() {
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
      const response = await createTeamLeader({
        ...values,
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        mobileNo: values.mobileNo.trim(),
      });
      setValues(initialValues);
      setErrors({});
      setStatus({ type: 'success', message: response.message || 'Team leader created successfully.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to create team leader.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-form-panel">
      <div className="admin-form-heading">
        <div className="admin-form-icon-container">
          <UserCheck size={20} />
        </div>
        <div>
          <h2>Create Team Leader</h2>
          <p>Grant administrative management access to review and forward intern requests.</p>
        </div>
      </div>

      <form className="admin-form" onSubmit={submit} noValidate>
        <div className="admin-form-grid">
          <FormField label="Full Name *" name="fullName" value={values.fullName} onChange={handleChange} error={errors.fullName} placeholder="Sarah Jenkins" />
          <FormField label="Email Address *" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} placeholder="sarah.jenkins@uptoskills.com" />
          <FormField label="Mobile Number *" name="mobileNo" type="tel" value={values.mobileNo} onChange={handleChange} error={errors.mobileNo} placeholder="+1 555 0184" />
          <FormField label="Temporary Password *" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} placeholder="Minimum 6 characters" />
          <FormField label="Active From Date *" name="startDate" type="date" value={values.startDate} onChange={handleChange} error={errors.startDate} />
          <FormField label="Active Until Date *" name="endDate" type="date" value={values.endDate} onChange={handleChange} error={errors.endDate} />
        </div>

        <div className="form-submit-row">
          <SubmitButton loading={loading} label="Create Team Leader" />
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
