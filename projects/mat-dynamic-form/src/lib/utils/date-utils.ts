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
const FORMAT_TOKENS: { [token: string]: { pattern: string, part: 'year' | 'year2' | 'month' | 'day' | 'hour24' | 'hour12' | 'minute' | 'second' | 'meridiem' } } = {
  yyyy: { pattern: '(\\d{4})', part: 'year' },
  yy: { pattern: '(\\d{2})', part: 'year2' },
  MM: { pattern: '(\\d{1,2})', part: 'month' },
  M: { pattern: '(\\d{1,2})', part: 'month' },
  dd: { pattern: '(\\d{1,2})', part: 'day' },
  d: { pattern: '(\\d{1,2})', part: 'day' },
  HH: { pattern: '(\\d{1,2})', part: 'hour24' },
  H: { pattern: '(\\d{1,2})', part: 'hour24' },
  hh: { pattern: '(\\d{1,2})', part: 'hour12' },
  h: { pattern: '(\\d{1,2})', part: 'hour12' },
  mm: { pattern: '(\\d{1,2})', part: 'minute' },
  m: { pattern: '(\\d{1,2})', part: 'minute' },
  ss: { pattern: '(\\d{1,2})', part: 'second' },
  s: { pattern: '(\\d{1,2})', part: 'second' },
  a: { pattern: '([AaPp][Mm])', part: 'meridiem' },
};

/**
 * Reads text written with an Angular DatePipe numeric format (`dd/MM/yyyy HH:mm`, `hh:mm a`, `yyyy-MM-dd`...),
 * so a typed value is understood the same way it is displayed. Parts the format does not contain come from
 * `base` (today by default). Returns null when the text does not match, the date does not exist, or the format
 * uses tokens it cannot read (month or weekday names, time zones...).
 */
export const parseDateWithFormat = (text: string, format: string, base: Date = new Date()): Date | null => {
  if (!text || !format) return null;

  const parts: string[] = [];
  let pattern = '';
  let i = 0;
  while (i < format.length) {
    const char = format[i];
    if (char === "'") {                                   // quoted literal: 'at'
      const end = format.indexOf("'", i + 1);
      const literal = end < 0 ? format.slice(i + 1) : format.slice(i + 1, end);
      pattern += literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      i = end < 0 ? format.length : end + 1;
      continue;
    }
    if (/[A-Za-z]/.test(char)) {
      let run = char;
      while (format[i + run.length] === char) run += char;
      const token = FORMAT_TOKENS[run];
      if (!token) return null;
      pattern += token.pattern;
      parts.push(token.part);
      i += run.length;
      continue;
    }
    pattern += /\s/.test(char) ? '\\s*' : char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    i++;
  }

  const match = new RegExp(`^\\s*${pattern}\\s*$`).exec(text);
  if (!match) return null;

  let year = base.getFullYear(), month = base.getMonth(), day = base.getDate();
  let hours = 0, minutes = 0, seconds = 0;
  let hour12: number | null = null, meridiem: string | null = null;
  const hasTime = parts.some(p => p.startsWith('hour') || p === 'minute');
  if (!hasTime && !parts.some(p => ['year', 'year2', 'month', 'day'].includes(p))) return null;

  parts.forEach((part, index) => {
    const value = match[index + 1];
    switch (part) {
      case 'year': year = +value; break;
      case 'year2': year = 2000 + +value; break;
      case 'month': month = +value - 1; break;
      case 'day': day = +value; break;
      case 'hour24': hours = +value; break;
      case 'hour12': hour12 = +value; break;
      case 'minute': minutes = +value; break;
      case 'second': seconds = +value; break;
      case 'meridiem': meridiem = value.toUpperCase(); break;
    }
  });

  if (hour12 != null) {
    if (hour12 < 1 || hour12 > 12) return null;
    hours = to24HourFormat(hour12, (meridiem ?? 'AM') as 'AM' | 'PM');
  }
  if (hours > 23 || minutes > 59 || seconds > 59) return null;

  const date = new Date(year, month, day, hours, minutes, seconds);
  // Reject overflowing values such as 31/02 (Date would roll them into the next month).
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return date;
};
