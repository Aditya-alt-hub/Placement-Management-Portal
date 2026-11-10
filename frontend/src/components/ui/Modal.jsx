import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="np-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="np-modal">
        <div className="np-modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="np-btn np-btn-sm"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.9rem' }}
          >
            ✕
          </button>
        </div>
        <div className="np-modal-body">{children}</div>
        {footer && <div className="np-modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
