// Utility functions for formatting

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1) + 'T';
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export function formatGold(gold: number): string {
  return formatNumber(gold);
}

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.floor(hours * 60);
    return `${minutes}m`;
  }
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  if (m === 0) {
    return `${h}h`;
  }
  return `${h}h ${m}m`;
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return then.toLocaleDateString();
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-500';
    case 'rare':
      return 'text-blue-500';
    case 'epic':
      return 'text-purple-500';
    case 'legendary':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
}

export function getRarityBorderColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'border-gray-500';
    case 'rare':
      return 'border-blue-500';
    case 'epic':
      return 'border-purple-500';
    case 'legendary':
      return 'border-yellow-500';
    default:
      return 'border-gray-500';
  }
}

export function getRarityBgColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100';
    case 'rare':
      return 'bg-blue-100';
    case 'epic':
      return 'bg-purple-100';
    case 'legendary':
      return 'bg-yellow-100';
    default:
      return 'bg-gray-100';
  }
}

export function getLocationEmoji(location: string): string {
  const emojiMap: Record<string, string> = {
    home: '🏠',
    gym: '🏋️',
    spa: '💚',
    library: '📚',
    speed_track: '🏃',
    dojo: '🥋',
    temple: '🛕',
  };
  return emojiMap[location] || '🏠';
}

export function getHappinessColor(happiness: number): string {
  if (happiness >= 70) return 'text-green-500';
  if (happiness >= 30) return 'text-yellow-500';
  return 'text-red-500';
}

export function getHappinessBarColor(happiness: number): string {
  if (happiness >= 70) return 'bg-green-500';
  if (happiness >= 30) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function calculateTimeUntil(futureDate: string | Date): number {
  const now = new Date();
  const future = new Date(futureDate);
  return Math.max(0, Math.floor((future.getTime() - now.getTime()) / 1000));
}

export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Ready!';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
