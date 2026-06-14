import { motion, AnimatePresence } from 'framer-motion';
import { PROJECT_STATUS } from '../constants';

export default function TodayCheckInModal({ open, items, onClose, onSetStatus }) {
  return (
    <AnimatePresence>
      {open && items.length > 0 && (
        <motion.div
          className="ft-modal-root ft-modal-root--today"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="presentation"
            className="ft-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="ft-modal-dialog ft-modal-dialog--today"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ft-today-title"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ft-modal-head">
              <div>
                <h2 id="ft-today-title">Bugün teslim</h2>
                <p className="ft-today-lead">
                  Bugün teslimi olan işlerin durumunu işaretleyin: tamamlandı mı, yoksa devam mı
                  ediyor?
                </p>
              </div>
            </div>
            <div className="ft-today-list">
              {items.map((p) => (
                <div key={p.id} className="ft-today-row">
                  <div className="ft-today-row__info">
                    <strong>{p.title || 'İsimsiz proje'}</strong>
                    <span>{p.customerName || '—'}</span>
                  </div>
                  <div className="ft-today-row__actions">
                    <button
                      type="button"
                      className="ft-btn ft-btn--success ft-btn--sm"
                      onClick={() => onSetStatus(p.id, PROJECT_STATUS.COMPLETED)}
                    >
                      Tamamlandı
                    </button>
                    <button
                      type="button"
                      className="ft-btn ft-btn--primary ft-btn--sm"
                      onClick={() => onSetStatus(p.id, PROJECT_STATUS.IN_PROGRESS)}
                    >
                      Devam ediyor
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="ft-today-footer">
              <button type="button" className="ft-btn ft-btn--ghost" onClick={onClose}>
                Kapat
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
