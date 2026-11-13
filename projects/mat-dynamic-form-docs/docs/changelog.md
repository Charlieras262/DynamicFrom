---
sidebar_position: 5
title: Changelog
---

# Changelog

Older versions are listed in the [GitHub releases](https://github.com/Charlieras262/DynamicFrom/releases).

## 1.7.0

_2026-11-13_ · [Upgrade guide](./migration/upgrade-to-1.7.0.md)

### Breaking changes

- The library no longer imports `BrowserAnimationsModule`. Import `BrowserAnimationsModule` or
  `NoopAnimationsModule` once in your root module. Fixes `BrowserModule has already been loaded` in lazy-loaded
  and feature modules.
- The internal Material module only includes the Material/CDK modules the form uses.

### Behavior changes

- `valueChange` actions run on every value change, including back to the initial value.
- An empty `DateTimePicker` / `TimePicker` shows an empty field instead of today's date.

### Fixes

**Nodes**

- Positional constructor arguments are mapped to the right properties in `Input`, `InputFile`, `DatePicker`,
  `DateTimePicker` and `DateRangePicker`; `disabled` and `validator` are no longer swapped in `Dropdown`,
  `RadioGroup` and `CustomNode`.
- Options given as a synchronous `Observable` no longer crash.
- `AutoComplete` subscribes to its options once (one HTTP request instead of two).

**FormStructure**

- `nodeGrid` is clamped between 1 and 4.
- `AutoComplete` no longer throws with options without `value`, without `selectedValue`, or when the options
  never load.
- `getNodeById` returns `undefined` for unknown ids instead of throwing.

**Form**

- The deprecated `callback.onClick` runs once per click.
- Validate actions without `action` render with the `outline` and `fill` appearances.
- `validateEvenDisabled` no longer throws `ExpressionChangedAfterItHasBeenCheckedError`.
- The window `resize` listener is removed when the form is destroyed.

**InputFile**

- The error state is kept, so retry and remove are shown after a rejected file.
- Retry opens the file selector; remove and download respond on the whole button.
- Files with an unknown MIME type keep their extension when renamed.
- Works without `accept`.

**DateTimePicker / TimePicker**

- Changing the day keeps the chosen time.
- Shows the time when no `dateFormat` is set.
- `reset()` clears the text; clearing the text sets the value to `null`.
- Cancelling with an empty value no longer breaks the next opening.
- Panels close even when CSS animations do not run.
- PM is no longer blocked when `minDate` is in the afternoon.

**Calendar**

- Choosing a month or year, or clicking a disabled day, no longer jumps to the time panel.
- Opens on the month of the selected date.

### Tooling

- 165 specs cover every component, model, utility and pipe (`npm run test:lib`).
- CI builds and tests on Node 24; releases are published only when the specs pass.
