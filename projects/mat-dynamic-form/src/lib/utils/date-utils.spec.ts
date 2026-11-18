import * as moment from 'moment';
import { isGreaterDate, isLesserDate, isSameDate, isSameDay, to12HourFormat, to24HourFormat, toDate } from './date-utils';

describe('date-utils', () => {

  describe('toDate', () => {
    it('returns null for empty or invalid values', () => {
      expect(toDate(null)).toBeNull();
      expect(toDate(undefined)).toBeNull();
      expect(toDate('')).toBeNull();
      expect(toDate('not a date')).toBeNull();
      expect(toDate(new Date('invalid'))).toBeNull();
      expect(toDate(moment.invalid())).toBeNull();
    });

    it('copies JavaScript dates', () => {
      const original = new Date(2025, 4, 6, 14, 30);
      const copy = toDate(original);
      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
    });

    it('converts moment, Luxon-like objects, strings and timestamps', () => {
      const expected = new Date(2025, 4, 6, 14, 30);
      expect(toDate(moment([2025, 4, 6, 14, 30]))).toEqual(expected);
      expect(toDate({ toJSDate: () => new Date(expected) })).toEqual(expected);
      expect(toDate(expected.getTime())).toEqual(expected);
      expect(toDate(expected.toISOString())).toEqual(expected);
    });
  });

  it('to12HourFormat converts every hour of the day', () => {
    expect(to12HourFormat(0)).toEqual({ hour12: 12, meridiem: 'AM' });
    expect(to12HourFormat(1)).toEqual({ hour12: 1, meridiem: 'AM' });
    expect(to12HourFormat(11)).toEqual({ hour12: 11, meridiem: 'AM' });
    expect(to12HourFormat(12)).toEqual({ hour12: 12, meridiem: 'PM' });
    expect(to12HourFormat(13)).toEqual({ hour12: 1, meridiem: 'PM' });
    expect(to12HourFormat(23)).toEqual({ hour12: 11, meridiem: 'PM' });
  });

  it('to24HourFormat is the inverse of to12HourFormat', () => {
    for (let h = 0; h < 24; h++) {
      const { hour12, meridiem } = to12HourFormat(h);
      expect(to24HourFormat(hour12, meridiem)).toBe(h);
    }
  });

  it('isSameDay ignores the time', () => {
    expect(isSameDay(new Date(2025, 1, 2, 1), new Date(2025, 1, 2, 23))).toBeTrue();
    expect(isSameDay(new Date(2025, 1, 2), new Date(2025, 1, 3))).toBeFalse();
  });

  it('isSameDate compares hour and minute unless excluded', () => {
    const a = new Date(2025, 1, 2, 10, 30);
    const b = new Date(2025, 1, 2, 10, 45);
    expect(isSameDate(a, b)).toBeFalse();
    expect(isSameDate(a, b, { hour: true, minute: false })).toBeTrue();
    expect(isSameDate(a, new Date(2025, 1, 2, 11, 30), { hour: false, minute: true })).toBeTrue();
  });

  it('isGreaterDate / isLesserDate compare up to the minute', () => {
    const base = new Date(2025, 5, 15, 12, 30);
    const later = [new Date(2026, 0, 1), new Date(2025, 6, 1), new Date(2025, 5, 16), new Date(2025, 5, 15, 13), new Date(2025, 5, 15, 12, 31)];

    later.forEach(d => {
      expect(isGreaterDate(d, base)).toBeTrue();
      expect(isLesserDate(base, d)).toBeTrue();
      expect(isGreaterDate(base, d)).toBeFalse();
      expect(isLesserDate(d, base)).toBeFalse();
    });

    expect(isGreaterDate(base, new Date(base))).toBeFalse();
    expect(isLesserDate(base, new Date(base))).toBeFalse();
  });
});
