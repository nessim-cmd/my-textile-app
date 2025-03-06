// utils/dateUtils.ts
export function getDaysDifference(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffMilliseconds = date2.getTime() - date1.getTime(); // Changed to keep direction
    return Math.round(diffMilliseconds / oneDay);
  }
  
  export function getNotificationDays(endDate: string | Date | null | undefined): number | null {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return null;
    const days = getDaysDifference(today, end);
    // Only notify if days remaining is 5, 3, 2, 1, or 0, and not negative (expired)
    return [0, 1, 2, 3,4, 5].includes(days) && days >= 0 ? days : null;
  }