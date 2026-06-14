import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable modal component.
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title: string (optional)
 *  - size: 'sm' | 'md' | 'lg' | 'full' (default 'md')
 *  - children: ReactNode
 *  - className: extra class on the dialog
 *  - showClose: boolean (default true)
 */
export default function Modal({
  open,
  onClose,
  title,
  size = 'md',
  children,
  className = '',
  showClose = true,
}) {
  const dialogRef = useRef(null);
  const prevFocus = useRef(null);

  // Focus trap + body scroll lock
  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      dialogRef.current?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      prevFocus.current?.focus?.();
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const sizeClass = `ft-remodal--${size}`;

  const handleBackdropClick = useCallback(() => onClose(), [onClose]);

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="ft-remodal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="ft-remodal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            role="presentation"
          />
          <motion.div
            ref={dialogRef}
            className={`ft-remodal-dialog ${sizeClass} ${className}`}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
            tabIndex={-1}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            {(title || showClose) && (
              <div className="ft-remodal-head">
                {title && <h2 className="ft-remodal-title">{title}</h2>}
                {showClose && (
                  <button
                    type="button"
                    className="ft-modal-close"
                    onClick={onClose}
                    aria-label="Kapat"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            <div className="ft-remodal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
