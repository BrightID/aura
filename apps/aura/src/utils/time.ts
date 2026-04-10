export const formatDuration = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);

  if (years > 0) {
    const remainingMonths = Math.floor((days - years * 365.25) / 30.44);
    if (remainingMonths > 0) {
      return `${years}y ${remainingMonths}mo ago`;
    }
    return `${years}y ago`;
  } else if (months > 0) {
    const remainingDays = Math.floor(days - months * 30.44);
    if (remainingDays > 0) {
      return `${months}mo ${remainingDays}d ago`;
    }
    return `${months}mo ago`;
  } else if (days > 0) {
    const remainingHours = hours - days * 24;
    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h ago`;
    }
    return `${days}d ago`;
  } else if (hours > 0) {
    const remainingMinutes = minutes - hours * 60;
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m ago`;
    }
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    if (isNaN(timestamp)) {
      return '';
    }
    return 'now';
  }
};
