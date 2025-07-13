// Date formatting and time calculations utilities

/**
 * Format timestamp to Turkish date format (DD.MM.YY HH:mm)
 */
export const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Geçersiz Tarih';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Geçersiz Tarih';
  }
};

/**
 * Format timestamp to relative time (e.g., "2 saat önce", "5 dakika önce")
 */
export const formatRelativeTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Az önce';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} dakika önce`;
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else if (diffInDays < 7) {
      return `${diffInDays} gün önce`;
    } else {
      return formatTimestamp(timestamp);
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Geçersiz Tarih';
  }
};

/**
 * Check if timestamp is within last 24 hours
 */
export const isWithinLast24Hours = (timestamp: string): boolean => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    return diffInHours <= 24;
  } catch (error) {
    console.error('Error checking 24 hours:', error);
    return false;
  }
};

/**
 * Get current timestamp in ISO format
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Get timestamp 24 hours ago
 */
export const get24HoursAgo = (): string => {
  const date = new Date();
  date.setHours(date.getHours() - 24);
  return date.toISOString();
};

/**
 * Format amper value with unit
 */
export const formatAmperValue = (amper: number): string => {
  return `${amper.toFixed(1)}A`;
};

/**
 * Get time difference in minutes between two timestamps
 */
export const getTimeDifferenceInMinutes = (timestamp1: string, timestamp2: string): number => {
  try {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    const diffInMs = Math.abs(date1.getTime() - date2.getTime());
    return Math.floor(diffInMs / (1000 * 60));
  } catch (error) {
    console.error('Error calculating time difference:', error);
    return 0;
  }
}; 