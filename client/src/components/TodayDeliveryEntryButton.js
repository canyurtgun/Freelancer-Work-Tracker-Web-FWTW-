import { motion, AnimatePresence } from 'framer-motion';
import { wasTodayPromptDismissed } from '../utils/dates';

/**
 * İlk girişte modal açmaz; bugün teslim onayı gerektiğinde görünen buton.
 */
export default function TodayDeliveryEntryButton({ pendingCount, modalOpen, onOpen }) {
  const visible =
    pendingCount > 0 && !wasTodayPromptDismissed() && !modalOpen;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="ft-today-entry-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <button type="button" className="ft-today-entry__btn" onClick={onOpen}>
            <span className="ft-today-entry__icon" aria-hidden>
              📋
            </span>
            <span className="ft-today-entry__text">
              <strong className="ft-today-entry__title">Bugün teslim</strong>
              <span className="ft-today-entry__sub">
                {pendingCount} iş onay bekliyor — listeyi aç
              </span>
            </span>
            <span className="ft-today-entry__chev" aria-hidden>
              →
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
