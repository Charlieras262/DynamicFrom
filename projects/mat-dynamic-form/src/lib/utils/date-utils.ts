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

export const isSameDate = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate() &&
    date1.getHours() === date2.getHours() &&
    date1.getMinutes() === date2.getMinutes();
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