---
sidebar_position: 3
title: Dates and times
---

# Dates and times

The library uses Angular Material's datepicker and includes `MatNativeDateModule`, so dates are JavaScript
`Date` objects and no extra date adapter is required.

## DatePicker

```ts
new DatePicker('birthDate', 'Birth date').apply({
  minDate: new Date(1900, 0, 1),
  maxDate: new Date(),
});
```

| Property | Description |
| --- | --- |
| `value` | Initial `Date`. |
| `minDate` / `maxDate` | Days outside the range are disabled. |

## DateRangePicker

The control is a group with `start` and `end`.

```ts
new DateRangePicker('vacation', 'Vacation').apply({ minDate: new Date() });

// value: { vacation: { start: Date | null, end: Date | null } }
```

| Property | Description |
| --- | --- |
| `startDate` / `endDate` | Initial values. |
| `minDate` / `maxDate` | Allowed range. |

## DateTimePicker

Picks a day in a calendar and then the time in a second panel.

```ts
new DateTimePicker('appointment', 'Appointment', null, 'dd/MM/yyyy hh:mm a').apply({
  minDate: new Date(),
  showClockPicker: true,
});
```

| Property | Default | Description |
| --- | --- | --- |
| `dateFormat` | — | [Angular `DatePipe` format](https://angular.io/api/common/DatePipe#custom-format-options) of the text. |
| `minDate` / `maxDate` | — | Limits for days **and** times: the time is moved inside the range automatically. |
| `showClockPicker` | `false` | Opens the time panel with the clock face instead of the keyboard inputs. |
| `orientation` | `'portrait'` | `'portrait'` or `'landscape'` time panel. |
| `acceptLabel` / `cancelLabel` | `'OK'` / `'Cancel'` | Buttons of the time panel. |
| `selectTimeLabel` / `enterTimeLabel` | `'Select Time'` / `'Enter Time'` | Titles of the clock and keyboard modes. |

Behavior:

- Without a `dateFormat`, the text uses `MAT_DATE_FORMATS.display.dateTimeInput` if your app provides it, or the
  locale's short date and time (for example `5/6/25, 2:30 PM`).
- An empty control shows an empty field; the calendar opens on today.
- Changing the day keeps the time already chosen.
- **Cancel** or a click outside the panel keeps the previous value.
- Typed text is parsed with `new Date(text)`. Invalid text sets the `invalidDate` error; empty text sets the value
  to `null`.

## TimePicker

The same picker without the calendar. The value is still a `Date` (today's date with the chosen time).

```ts
new TimePicker('start', 'Start time', null, 'hh:mm a').apply({ showClockPicker: true });
```

Without a `dateFormat` the text shows only the time.
