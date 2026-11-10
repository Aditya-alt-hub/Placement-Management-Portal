export default function Button({
  children,
  variant = 'default',
  size = '',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const variantClass = {
    primary: 'np-btn-primary',
    accent: 'np-btn-accent',
    danger: 'np-btn-danger',
    secondary: 'np-btn',
    default: 'np-btn',
  }[variant] || 'np-btn'

  const sizeClass = {
    sm: 'np-btn-sm',
    lg: 'np-btn-lg',
    '': '',
  }[size] || ''

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`np-btn ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
