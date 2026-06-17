export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatCurrency(amount: number, _currency: string = 'KES'): string {
  return `Kshs ${new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    '14_days': '14 days',
    '30_days': '30 days',
    '60_days': '60 days',
    '90_days': '90 days',
    'custom': 'Custom',
  };
  return labels[period] || period;
}
