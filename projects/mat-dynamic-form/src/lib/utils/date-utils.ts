/**
 * Converts any date value the app may use (JavaScript Date, moment, Luxon, Day.js, ISO string or timestamp) to a
 * new JavaScript Date. Returns null for empty or invalid values.
 *
 * The date-time components work with JavaScript Date internally, whatever DateAdapter the app provides.
 */
export const toDate = (value: any): Date | null => {
  if (value == null || value === '') return null;

  let date: Date;
  if (value instanceof Date) date = new Date(value.getTime());
  else if (typeof value.toDate === 'function') date = value.toDate();          // moment, Day.js
  else if (typeof value.toJSDate === 'function') date = value.toJSDate();      // Luxon
  else date = new Date(typeof value === 'object' ? value.valueOf() : value);   // string, number, other objects

  return date instanceof Date && !isNaN(date.getTime()) ? new Date(date.getTime()) : null;
};

export const to12HourFormat = (hour24: number): { hour12: number, meridiem: 'AM' | 'PM' } => {
  let meridiem: 'AM' | 'PM' = 'AM';
  let hour12 = hour24;

  if (hour24 === 0) {
    hour12 = 12;
  } else if (hour24 === 12) {
    meridiem = 'PM';
  } else if (hour24 > 12) {
    hour12 = hour24 - 12;
    meridiem = 'PM';
  }

  return { hour12, meridiem };
};

export const to24HourFormat = (hour12: number, meridiem: 'AM' | 'PM'): number => {
  let hour24 = hour12;

  if (meridiem === 'AM') {
    if (hour12 === 12) {
      hour24 = 0;
    }
  } else {
    if (hour12 !== 12) {
      hour24 = hour12 + 12;
    }
  }

  return hour24;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

export const isSameDate = (date1: Date, date2: Date, includeTime: { hour: boolean, minute: boolean } = { hour: true, minute: true }): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate() &&
    (includeTime.hour ? date1.getHours() === date2.getHours() : true) &&
    (includeTime.minute ? date1.getMinutes() === date2.getMinutes() : true);
};

export const isGreaterDate = (date1: Date, date2: Date): boolean => {
  if (date1.getFullYear() > date2.getFullYear()) return true;
  if (date1.getFullYear() < date2.getFullYear()) return false;

  if (date1.getMonth() > date2.getMonth()) return true;
  if (date1.getMonth() < date2.getMonth()) return false;

  if (date1.getDate() > date2.getDate()) return true;
  if (date1.getDate() < date2.getDate()) return false;

  if (date1.getHours() > date2.getHours()) return true;
  if (date1.getHours() < date2.getHours()) return false;

  if (date1.getMinutes() > date2.getMinutes()) return true;
  if (date1.getMinutes() < date2.getMinutes()) return false;

  return false;
};

export const isLesserDate = (date1: Date, date2: Date): boolean => {
  if (date1.getFullYear() < date2.getFullYear()) return true;
  if (date1.getFullYear() > date2.getFullYear()) return false;

  if (date1.getMonth() < date2.getMonth()) return true;
  if (date1.getMonth() > date2.getMonth()) return false;

  if (date1.getDate() < date2.getDate()) return true;
  if (date1.getDate() > date2.getDate()) return false;

  if (date1.getHours() < date2.getHours()) return true;
  if (date1.getHours() > date2.getHours()) return false;

  if (date1.getMinutes() < date2.getMinutes()) return true;
  if (date1.getMinutes() > date2.getMinutes()) return false;

  return false;
};