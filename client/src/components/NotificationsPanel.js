import { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUpcomingNotificationProjects, getRelativeDeliveryLabel } from '../utils/dates';
import { formatDate } from '../utils/format';
import { PROJECT_STATUS_LABELS } from '../constants';

export default function NotificationsPanel({ projects }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const list = useMemo(() => getUpcomingNotificationProjects(projects), [projects]);
  const count = list.length;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const t = setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const mq = window.matchMedia('(max-width: 640px)');
    const apply = () => {
      if (mq.matches) document.body.style.overflow = 'hidden';
      else document.body.style.overflow = '';
    };
    apply();
    mq.addEventListener('change', apply);
    return () => {
      document.body.style.overflow = '';
      mq.removeEventListener('change', apply);
    };
  }, [open]);

  return (
    <div className={`ft-notify ${open ? 'ft-notify--open' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className="ft-notify__trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Bildirimler${count ? `, ${count} yaklaşan teslim` : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ft-notify__icon" aria-hidden>
          🔔
        </span>
        <span className="ft-notify__label">Bildirimler</span>
        {count > 0 && (
          <span className="ft-notify__badge" aria-hidden>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              className="ft-notify__backdrop"
              aria-label="Kapat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="ft-notify__panel"
              role="dialog"
              aria-modal="true"
              aria-label="Yaklaşan teslim tarihleri"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ft-notify__head">
                <strong>Yaklaşan teslimler</strong>
                <span className="ft-notify__sub">Tarihe göre sıralı</span>
              </div>
              <div className="ft-notify__body">
                {list.length === 0 ? (
                  <p className="ft-notify__empty">Aktif işlerde bekleyen teslim tarihi yok.</p>
                ) : (
                  <ul className="ft-notify__list">
                    {list.map((p) => (
                      <li key={p.id} className="ft-notify__item">
                        <div className="ft-notify__item-main">
                          <span className="ft-notify__item-title">{p.title || 'İsimsiz'}</span>
                          <span className="ft-notify__item-customer">{p.customerName || '—'}</span>
                        </div>
                        <div className="ft-notify__item-meta">
                          <span className="ft-notify__pill">{getRelativeDeliveryLabel(p.deliveryDate)}</span>
                          <span className="ft-notify__date">{formatDate(p.deliveryDate)}</span>
                        </div>
                        <span className="ft-notify__status">
                          {PROJECT_STATUS_LABELS[p.status] || p.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
