
/**
 * Utility functions for date formatting
 */

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time for comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Heute';
  } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    return 'Morgen';
  } else {
    return date.toLocaleDateString('de-DE', { 
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
  }
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = formatDate(dateString);
  const time = formatTime(dateString);
  return `${date} • ${time}`;
};

export const isEventToday = (dateString: string): boolean => {
  const eventDate = new Date(dateString);
  const today = new Date();
  
  return eventDate.toDateString() === today.toDateString();
};

export const isEventUpcoming = (dateString: string): boolean => {
  const eventDate = new Date(dateString);
  const now = new Date();
  
  return eventDate > now;
};

export const getTimeUntilEvent = (dateString: string): string => {
  const eventDate = new Date(dateString);
  const now = new Date();
  const diffMs = eventDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Vorbei';
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `in ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  } else if (diffHours > 0) {
    return `in ${diffHours} Stunde${diffHours > 1 ? 'n' : ''}`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `in ${diffMinutes} Minute${diffMinutes > 1 ? 'n' : ''}`;
  }
};
