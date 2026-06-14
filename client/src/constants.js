export const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.PLANNING]: 'Planlama',
  [PROJECT_STATUS.IN_PROGRESS]: 'Devam ediyor',
  [PROJECT_STATUS.REVIEW]: 'İnceleme / Revizyon',
  [PROJECT_STATUS.COMPLETED]: 'Tamamlandı',
  [PROJECT_STATUS.CANCELLED]: 'İptal',
};

export const EXTRA_STATUS = {
  PENDING: 'pending',
  DONE: 'done',
  CANCELLED: 'cancelled',
};

export const EXTRA_STATUS_LABELS = {
  [EXTRA_STATUS.PENDING]: 'Beklemede',
  [EXTRA_STATUS.DONE]: 'Tamamlandı',
  [EXTRA_STATUS.CANCELLED]: 'İptal',
};

export const STATUS_COLORS = {
  [PROJECT_STATUS.PLANNING]: '#94a3b8',
  [PROJECT_STATUS.IN_PROGRESS]: '#38bdf8',
  [PROJECT_STATUS.REVIEW]: '#fbbf24',
  [PROJECT_STATUS.COMPLETED]: '#34d399',
  [PROJECT_STATUS.CANCELLED]: '#f87171',
};

export const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6'];
