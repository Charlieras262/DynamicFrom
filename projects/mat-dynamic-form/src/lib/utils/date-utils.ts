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