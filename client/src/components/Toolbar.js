import { motion } from 'framer-motion';
import { PROJECT_STATUS, PROJECT_STATUS_LABELS } from '../constants';

export default function Toolbar({
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  sortBy,
  onSort,
  onAdd,
}) {
  return (
    <motion.div
      className="ft-toolbar"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
    >
      <div className="ft-toolbar__search">
        <span className="ft-toolbar__icon" aria-hidden>
          ⌕
        </span>
        <input
          type="search"
          className="ft-input ft-input--search"
          placeholder="Başlık, müşteri veya içerik ara..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Projelerde ara"
        />
      </div>
      <div className="ft-toolbar__filters">
        <label className="ft-select-wrap">
          <span className="sr-only">Durum</span>
          <select
            className="ft-select"
            value={statusFilter}
            onChange={(e) => onStatusFilter(e.target.value)}
          >
            <option value="all">Tüm durumlar</option>
            {Object.values(PROJECT_STATUS).map((s) => (
              <option key={s} value={s}>
                {PROJECT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="ft-select-wrap">
          <span className="sr-only">Sırala</span>
          <select className="ft-select" value={sortBy} onChange={(e) => onSort(e.target.value)}>
            <option value="today_first">Bugün teslim önce</option>
            <option value="delivery_asc">Teslim tarihi (yakın)</option>
            <option value="delivery_desc">Teslim tarihi (uzak)</option>
            <option value="created_desc">Eklenme (yeni)</option>
            <option value="value_desc">Tutar (yüksek)</option>
          </select>
        </label>
        <button type="button" className="ft-btn ft-btn--primary" onClick={onAdd}>
          + Yeni proje
        </button>
      </div>
    </motion.div>
  );
}
