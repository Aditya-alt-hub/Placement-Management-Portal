export default function Badge({ children, variant = '', status = '', featured = false }) {
  const normStatus = (status || '').toLowerCase()

  let colorClass = ''
  if (featured || normStatus === 'placed' || normStatus === 'selected' || normStatus === 'approved') {
    colorClass = 'np-badge-filled'
  } else if (normStatus === 'rejected' || normStatus === 'failed' || normStatus === 'cancelled' || normStatus === 'declined') {
    colorClass = 'np-badge-accent'
  } else {
    colorClass = ''
  }

  if (variant === 'accent' || variant === 'featured') {
    colorClass = 'np-badge-accent'
  } else if (variant === 'filled') {
    colorClass = 'np-badge-filled'
  }

  return (
    <span className={`np-badge ${colorClass}`}>
      {featured && <span className="np-badge-dot" />}
      {children}
    </span>
  )
}
