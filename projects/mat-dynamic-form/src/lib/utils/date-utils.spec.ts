import { isGreaterDate, isLesserDate, isSameDate, isSameDay, to12HourFormat, to24HourFormat } from './date-utils';

describe('date-utils', () => {

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
