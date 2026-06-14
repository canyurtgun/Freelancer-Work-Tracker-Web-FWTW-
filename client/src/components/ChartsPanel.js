import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { PROJECT_STATUS_LABELS, STATUS_COLORS, CHART_COLORS } from '../constants';
import { formatCurrency } from '../utils/format';
import {
  statusCounts,
  monthlyEarningsSeries,
  cumulativeEarningsSeries,
  customerBreakdown,
} from '../utils/stats';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ft-chart-tooltip">
      {label && <p className="ft-chart-tooltip__title">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey}>
          <span className="ft-chart-tooltip__dot" style={{ background: p.color }} />
          {p.name}: <strong>{typeof p.value === 'number' ? formatCurrency(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function ChartsPanel({ projects }) {
  const counts = statusCounts(projects);
  const pieData = Object.keys(PROJECT_STATUS_LABELS).map((key) => ({
    name: PROJECT_STATUS_LABELS[key],
    value: counts[key] || 0,
    key,
  })).filter((d) => d.value > 0);

  const monthly = monthlyEarningsSeries(projects, 8);
  const cumulative = cumulativeEarningsSeries(projects);
  const customers = customerBreakdown(projects);

  return (
    <motion.section
      className="ft-charts"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <h2 className="ft-section-title">Grafikler & analiz</h2>
      <div className="ft-charts__grid">
        <div className="ft-chart-card">
          <h3 className="ft-chart-card__title">Durum dağılımı</h3>
          <div className="ft-chart-card__body ft-chart-card__body--pie">
            {pieData.length === 0 ? (
              <p className="ft-empty-chart">Henüz veri yok</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={96}
                    paddingAngle={3}
                    animationDuration={800}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.key}
                        fill={STATUS_COLORS[entry.key] || CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="ft-chart-card">
          <h3 className="ft-chart-card__title">Aylık kazanç</h3>
          <div className="ft-chart-card__body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `₺${Math.round(v / 1000)}k` : `₺${Math.round(v)}`)}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                <Bar dataKey="kazanç" name="Kazanç" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ft-chart-card ft-chart-card--wide">
          <h3 className="ft-chart-card__title">Kümülatif gelir trendi</h3>
          <div className="ft-chart-card__body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cumulative} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ftArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `₺${Math.round(v / 1000)}k` : `₺${Math.round(v)}`)}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="toplam"
                  name="Toplam"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fill="url(#ftArea)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ft-chart-card">
          <h3 className="ft-chart-card__title">Müşteri bazlı gelir (tamamlanan)</h3>
          <div className="ft-chart-card__body">
            {customers.length === 0 ? (
              <p className="ft-empty-chart">Tamamlanan proje yok</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={customers}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `₺${Math.round(v / 1000)}k` : `₺${Math.round(v)}`
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fill: '#cbd5e1', fontSize: 11 }}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Gelir" fill="#8b5cf6" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
