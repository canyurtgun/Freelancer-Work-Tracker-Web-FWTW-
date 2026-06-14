const currencyFmt = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
});

export function formatCurrency(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return currencyFmt.format(Number(n));
}

export function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function formatShortDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '—';
  }
}

export function isOverdue(deliveryIso, status) {
  if (!deliveryIso || status === 'completed' || status === 'cancelled') return false;
  const end = new Date(deliveryIso);
  end.setHours(23, 59, 59, 999);
  return Date.now() > end.getTime();
}
