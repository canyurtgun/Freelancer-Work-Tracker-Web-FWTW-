import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import * as api from '../api';

export default function AlertsModal() {
  const [open, setOpen] = useState(false);
  const [overdue, setOverdue] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await api.getAlerts();
      setOverdue(data.overdue || []);
      setUpcoming(data.upcoming || []);
      if ((data.overdue?.length || 0) + (data.upcoming?.length || 0) > 0) {
        setOpen(true);
      }
      setLoaded(true);
    } catch {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const totalCount = overdue.length + upcoming.length;

  return (
    <>
      {/* Header notification button */}
      <button
        type="button"
        className="ft-notify__trigger"
        aria-label={`Uyarılar${totalCount ? `, ${totalCount} adet` : ''}`}
        onClick={() => setOpen(true)}
      >
        <span className="ft-notify__icon" aria-hidden>🔔</span>
        <span className="ft-notify__label">Uyarılar</span>
        {totalCount > 0 && (
          <span className="ft-notify__badge" aria-hidden>
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Uyarılar (${totalCount})`}
        size="md"
        className="ft-alerts-modal"
      >
        <div className="ft-alerts">
          {!loaded ? (
            <div className="ft-usermgmt__loading">
              <span className="ft-login-spinner" />
            </div>
          ) : totalCount === 0 ? (
            <p className="ft-alerts__empty">
              🎉 Harika! Gecikmiş veya yaklaşan teslim yok.
            </p>
          ) : (
            <>
              {overdue.length > 0 && (
                <div className="ft-alerts__section">
                  <h3 className="ft-alerts__section-title ft-alerts__section-title--overdue">
                    🔴 Gecikmiş Teslimatlar ({overdue.length})
                  </h3>
                  <AnimatePresence>
                    {overdue.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        className="ft-alerts__card ft-alerts__card--overdue"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="ft-alerts__card-main">
                          <span className="ft-alerts__card-title">{item.title}</span>
                          {item.customerName && (
                            <span className="ft-alerts__card-customer">{item.customerName}</span>
                          )}
                        </div>
                        <div className="ft-alerts__card-meta">
                          <span className="ft-alerts__pill ft-alerts__pill--overdue">
                            {item.daysOverdue} gün gecikmiş
                          </span>
                          <span className="ft-alerts__date">
                            {new Date(item.deliveryDate).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                            })}
                          </span>
                        </div>
                        {item.users?.length > 0 && (
                          <div className="ft-alerts__card-users">
                            {item.users.map((u) => (
                              <span key={u.id} className="ft-alerts__user-chip">
                                {u.fullName}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {upcoming.length > 0 && (
                <div className="ft-alerts__section">
                  <h3 className="ft-alerts__section-title ft-alerts__section-title--upcoming">
                    🟡 Yaklaşan Teslimatlar ({upcoming.length})
                  </h3>
                  <AnimatePresence>
                    {upcoming.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        className="ft-alerts__card ft-alerts__card--upcoming"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 + (overdue.length * 0.05) }}
                      >
                        <div className="ft-alerts__card-main">
                          <span className="ft-alerts__card-title">{item.title}</span>
                          {item.customerName && (
                            <span className="ft-alerts__card-customer">{item.customerName}</span>
                          )}
                        </div>
                        <div className="ft-alerts__card-meta">
                          <span className="ft-alerts__pill ft-alerts__pill--upcoming">
                            {item.daysUntil === 0
                              ? 'Bugün'
                              : item.daysUntil === 1
                                ? 'Yarın'
                                : `${item.daysUntil} gün kaldı`}
                          </span>
                          <span className="ft-alerts__date">
                            {new Date(item.deliveryDate).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                            })}
                          </span>
                        </div>
                        {item.users?.length > 0 && (
                          <div className="ft-alerts__card-users">
                            {item.users.map((u) => (
                              <span key={u.id} className="ft-alerts__user-chip">
                                {u.fullName}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          <div className="ft-form-actions">
            <button
              type="button"
              className="ft-btn ft-btn--primary"
              onClick={() => setOpen(false)}
            >
              Anlaşıldı
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
