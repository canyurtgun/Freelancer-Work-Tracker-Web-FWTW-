import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/format';

const ICONS = ['📊', '⚡', '💰', '📈', '💎', '⏰', '🔮'];

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.95, filter: 'blur(6px)' },
  show: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.08,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function SummaryCards({ stats }) {
  const items = [
    {
      label: 'Toplam proje',
      value: String(stats.projectCount),
      hint: 'Kayıtlı tüm işler',
      accent: 'violet',
    },
    {
      label: 'Aktif işler',
      value: String(stats.activeCount),
      hint: 'Planlama, devam veya inceleme',
      accent: 'cyan',
    },
    {
      label: 'Tamamlanan gelir',
      value: formatCurrency(stats.completedRevenue),
      hint: 'Tamamlanan projelerin toplamı',
      accent: 'emerald',
    },
    {
      label: 'Bu ay kazanç',
      value: formatCurrency(stats.thisMonthEarned),
      hint: 'Tamamlanan işler (bu ay)',
      accent: 'amber',
    },
    {
      label: 'Alınan depozito',
      value: formatCurrency(stats.depositTotal),
      hint: 'İptal hariç tüm projeler',
      accent: 'rose',
    },
    {
      label: 'Geciken teslim',
      value: String(stats.overdueCount),
      hint: 'Tarihi geçmiş, bitmemiş işler',
      accent: stats.overdueCount > 0 ? 'alert' : 'slate',
    },
    {
      label: 'Bekleyen ekstralar',
      value: formatCurrency(stats.pendingExtrasValue),
      hint: 'Durumu "beklemede" olan ek işler',
      accent: 'violet',
    },
  ];

  return (
    <div className="ft-summary-grid">
      {items.map((item, i) => (
        <motion.article
          key={item.label}
          className={`ft-card ft-stat ft-stat--${item.accent}`}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="show"
          whileHover={{
            y: -5,
            transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
          }}
        >
          <span className="ft-stat__icon" aria-hidden>{ICONS[i]}</span>
          <p className="ft-stat__label">{item.label}</p>
          <p className="ft-stat__value">{item.value}</p>
          <p className="ft-stat__hint">{item.hint}</p>
        </motion.article>
      ))}
    </div>
  );
}
