import { PROJECT_STATUS } from '../constants';

function completionDate(project) {
  if (project.status !== PROJECT_STATUS.COMPLETED) return null;
  const raw = project.completedAt || project.deliveryDate || project.updatedAt;
  return raw ? new Date(raw) : null;
}

export function sumExtrasPrice(extras) {
  if (!extras || !extras.length) return 0;
  return extras.reduce((acc, e) => {
    if (e.status === 'cancelled') return acc;
    return acc + (Number(e.price) || 0);
  }, 0);
}

export function totalProjectValue(project) {
  const base = Number(project.price) || 0;
  return base + sumExtrasPrice(project.extras);
}

export function remainingToCollect(project) {
  const total = totalProjectValue(project);
  const dep = Number(project.deposit) || 0;
  return Math.max(0, total - dep);
}

export function aggregateStats(projects) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let completedRevenue = 0;
  let thisMonthEarned = 0;
  let activeCount = 0;
  let overdueCount = 0;
  let depositTotal = 0;
  let pendingExtrasValue = 0;

  projects.forEach((p) => {
    const status = p.status;
    const total = totalProjectValue(p);
    const dep = Number(p.deposit) || 0;

    if (status !== PROJECT_STATUS.CANCELLED) {
      depositTotal += dep;
    }

    if (
      status === PROJECT_STATUS.IN_PROGRESS ||
      status === PROJECT_STATUS.REVIEW ||
      status === PROJECT_STATUS.PLANNING
    ) {
      activeCount += 1;
    }

    const delivery = p.deliveryDate ? new Date(p.deliveryDate) : null;
    if (
      delivery &&
      status !== PROJECT_STATUS.COMPLETED &&
      status !== PROJECT_STATUS.CANCELLED
    ) {
      delivery.setHours(23, 59, 59, 999);
      if (Date.now() > delivery.getTime()) overdueCount += 1;
    }

    (p.extras || []).forEach((ex) => {
      if (ex.status === 'pending') pendingExtrasValue += Number(ex.price) || 0;
    });

    if (status === PROJECT_STATUS.COMPLETED) {
      completedRevenue += total;
      const cd = completionDate(p);
      if (cd && !Number.isNaN(cd.getTime()) && cd >= startOfMonth) {
        thisMonthEarned += total;
      }
    }
  });

  return {
    projectCount: projects.length,
    activeCount,
    completedRevenue,
    thisMonthEarned,
    overdueCount,
    depositTotal,
    pendingExtrasValue,
  };
}

export function statusCounts(projects) {
  const keys = Object.values(PROJECT_STATUS);
  const map = Object.fromEntries(keys.map((k) => [k, 0]));
  projects.forEach((p) => {
    if (map[p.status] != null) map[p.status] += 1;
  });
  return map;
}

export function monthlyEarningsSeries(projects, monthsBack = 8) {
  const now = new Date();
  const rows = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const label = d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
    let sum = 0;
    projects.forEach((p) => {
      if (p.status !== PROJECT_STATUS.COMPLETED) return;
      const cd = completionDate(p);
      if (!cd || Number.isNaN(cd.getTime())) return;
      if (cd.getFullYear() === y && cd.getMonth() === m) {
        sum += totalProjectValue(p);
      }
    });
    rows.push({ name: label, kazanç: Math.round(sum), ay: label });
  }
  return rows;
}

export function cumulativeEarningsSeries(projects) {
  const monthly = monthlyEarningsSeries(projects, 12);
  let acc = 0;
  return monthly.map((row) => {
    acc += row.kazanç;
    return { name: row.name, toplam: acc };
  });
}

export function customerBreakdown(projects) {
  const map = new Map();
  projects.forEach((p) => {
    if (p.status !== PROJECT_STATUS.COMPLETED) return;
    const name = (p.customerName || 'İsimsiz').trim();
    const v = totalProjectValue(p);
    map.set(name, (map.get(name) || 0) + v);
  });
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}
