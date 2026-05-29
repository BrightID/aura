export const formatDuration = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);

  if (years > 0) {
    const rem = Math.floor((days - years * 365.25) / 30.44);
    return rem > 0 ? `${years}y ${rem}mo ago` : `${years}y ago`;
  }
  if (months > 0) {
    const rem = Math.floor(days - months * 30.44);
    return rem > 0 ? `${months}mo ${rem}d ago` : `${months}mo ago`;
  }
  if (days > 0) {
    const rem = hours - days * 24;
    return rem > 0 ? `${days}d ${rem}h ago` : `${days}d ago`;
  }
  if (hours > 0) {
    const rem = minutes - hours * 60;
    return rem > 0 ? `${hours}h ${rem}m ago` : `${hours}h ago`;
  }
  if (minutes > 0) return `${minutes}m ago`;
  if (Number.isNaN(timestamp)) return '';
  return 'now';
};
