export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Yerel takvimde aynı gün mü */
export function isSameCalendarDay(isoA, isoB) {
  if (!isoA || !isoB) return false;
  const a = startOfDay(new Date(isoA));
  const b = startOfDay(new Date(isoB));
  return a.getTime() === b.getTime();
}

export function isDueToday(deliveryIso) {
  if (!deliveryIso) return false;
  return isSameCalendarDay(deliveryIso, new Date().toISOString());
}

export function isActiveProject(project) {
  return project.status !== 'completed' && project.status !== 'cancelled';
}

/** Bildirim listesi: aktif, teslim tarihi olan; teslime göre artan */
export function getUpcomingNotificationProjects(projects) {
  return projects
    .filter(isActiveProject)
    .filter((p) => p.deliveryDate)
    .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
}

export function getRelativeDeliveryLabel(deliveryIso) {
  if (!deliveryIso) return '—';
  const d = startOfDay(new Date(deliveryIso));
  const t = startOfDay(new Date());
  const diffDays = Math.round((d - t) / 86400000);
  if (diffDays < 0) {
    const n = Math.abs(diffDays);
    return n === 1 ? '1 gün gecikmiş' : `${n} gün gecikmiş`;
  }
  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Yarın';
  return `${diffDays} gün sonra`;
}

/** Bugün teslim, hâlâ aktif projeler */
export function getTodayActiveDeliveries(projects) {
  return projects.filter((p) => isActiveProject(p) && p.deliveryDate && isDueToday(p.deliveryDate));
}

const PROMPT_KEY = 'freelance-today-prompt-date-v1';

export function wasTodayPromptDismissed() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    return localStorage.getItem(PROMPT_KEY) === today;
  } catch {
    return false;
  }
}

export function dismissTodayPromptForToday() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(PROMPT_KEY, today);
  } catch {
    /* ignore */
  }
}
