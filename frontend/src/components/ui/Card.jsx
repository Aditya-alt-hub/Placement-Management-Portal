export default function Card({ children, className = '', style = {}, title, action }) {
  return (
    <div className={`np-panel ${className}`} style={style}>
      {(title || action) && (
        <div className="np-panel-header">
          {title && <h3>{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
