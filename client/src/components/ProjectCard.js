import { motion } from 'framer-motion';
import { PROJECT_STATUS_LABELS, EXTRA_STATUS_LABELS } from '../constants';
import { formatCurrency, formatDate, isOverdue } from '../utils/format';
import { totalProjectValue, remainingToCollect, sumExtrasPrice } from '../utils/stats';

export default function ProjectCard({ project, onEdit, onDelete, index }) {
  const overdue = isOverdue(project.deliveryDate, project.status);
  const total = totalProjectValue(project);
  const remaining = remainingToCollect(project);
  const extrasSum = sumExtrasPrice(project.extras);
  const users = project.users || [];

  return (
    <motion.article
      layout
      className={`ft-project-card ${overdue ? 'ft-project-card--overdue' : ''}`}
      initial={{ opacity: 0, y: 30, scale: 0.96, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.94, filter: 'blur(4px)' }}
      transition={{
        delay: index * 0.05,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {/* Shine sweep element */}
      <span className="ft-project-card__shine" aria-hidden />

      {overdue && <span className="ft-project-card__ribbon">Gecikmiş</span>}
      <header className="ft-project-card__head">
        <h3 className="ft-project-card__title">{project.title || 'İsimsiz proje'}</h3>
        <motion.span
          className={`ft-badge ft-badge--${project.status}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.2 }}
        >
          {PROJECT_STATUS_LABELS[project.status] || project.status}
        </motion.span>
      </header>
      <p className="ft-project-card__customer">{project.customerName || '—'}</p>
      <p className="ft-project-card__excerpt">
        {(project.content || '').slice(0, 140)}
        {(project.content || '').length > 140 ? '…' : ''}
      </p>

      {/* Assigned users */}
      {users.length > 0 && (
        <div className="ft-project-card__users">
          {users.slice(0, 4).map((u, i) => (
            <motion.span
              key={u.id}
              className="ft-project-card__user-chip"
              title={u.fullName}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.1 + i * 0.06, type: 'spring', damping: 20 }}
            >
              {(u.fullName || '?')[0].toUpperCase()}
            </motion.span>
          ))}
          {users.length > 4 && (
            <span className="ft-project-card__user-more">+{users.length - 4}</span>
          )}
        </div>
      )}

      <dl className="ft-project-card__meta">
        <div>
          <dt>Başlangıç</dt>
          <dd>{formatDate(project.startDate)}</dd>
        </div>
        <div>
          <dt>Teslim</dt>
          <dd>{formatDate(project.deliveryDate)}</dd>
        </div>
        <div>
          <dt>Toplam</dt>
          <dd>{formatCurrency(total)}</dd>
        </div>
        <div>
          <dt>Depozito</dt>
          <dd>{formatCurrency(project.deposit)}</dd>
        </div>
        <div>
          <dt>Kalan</dt>
          <dd className={remaining > 0 ? 'ft-em' : ''}>{formatCurrency(remaining)}</dd>
        </div>
      </dl>
      {extrasSum > 0 && (
        <p className="ft-project-card__extras">
          Ekstralar: {formatCurrency(extrasSum)} · {(project.extras || []).length} kalem
        </p>
      )}
      {(project.extras || []).length > 0 && (
        <ul className="ft-extra-list">
          {(project.extras || []).slice(0, 3).map((ex) => (
            <li key={ex.id}>
              <span>{ex.label || 'Ek iş'}</span>
              <span className="ft-extra-list__price">{formatCurrency(ex.price)}</span>
              <span className={`ft-mini-badge ft-mini-badge--${ex.status}`}>
                {EXTRA_STATUS_LABELS[ex.status] || ex.status}
              </span>
            </li>
          ))}
          {(project.extras || []).length > 3 && (
            <li className="ft-extra-list__more">+{(project.extras || []).length - 3} daha…</li>
          )}
        </ul>
      )}
      <footer className="ft-project-card__actions">
        <motion.button
          type="button"
          className="ft-btn ft-btn--ghost ft-btn--sm"
          onClick={() => onEdit(project)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Düzenle
        </motion.button>
        <motion.button
          type="button"
          className="ft-btn ft-btn--danger ft-btn--sm"
          onClick={() => {
            if (window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) onDelete(project.id);
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Sil
        </motion.button>
      </footer>
    </motion.article>
  );
}
