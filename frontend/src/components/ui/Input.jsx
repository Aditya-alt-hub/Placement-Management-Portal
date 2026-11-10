export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  id,
  hint,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined)

  return (
    <div className="np-form-group">
      {label && (
        <label className="np-label" htmlFor={inputId}>
          {label}{required && <span style={{ color: 'var(--dp-color-accent)' }}> *</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`np-input ${className}`}
        {...props}
      />
      {hint && <p style={{ fontSize: '0.85rem', color: 'var(--dp-color-secondary)', fontStyle: 'italic', marginTop: '0.25rem' }}>{hint}</p>}
    </div>
  )
}
