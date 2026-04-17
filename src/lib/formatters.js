export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  if (Math.abs(num) >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(decimals)}M`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(decimals)}K`;
  return num.toFixed(decimals);
};

export const formatUSD = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '$—';
  return `$${formatNumber(num)}`;
};

export const formatPrice = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  if (num < 0.000001) return num.toExponential(3);
  if (num < 0.01) return num.toFixed(8);
  if (num < 1) return num.toFixed(6);
  return num.toFixed(4);
};

export const formatSOL = (num, decimals = 3) => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return num.toFixed(decimals);
};

export const formatPercent = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
};

export const formatAddress = (addr, chars = 4) => {
  if (!addr) return '';
  if (addr.length <= chars * 2) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
};

export const timeAgo = (date) => {
  if (!date) return '—';
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};