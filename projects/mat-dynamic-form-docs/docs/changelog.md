---
sidebar_position: 5
title: Changelog
---

# Changelog

Older versions are listed in the [GitHub releases](https://github.com/Charlieras262/DynamicFrom/releases).

## Unreleased

### Features

- `InputPassword.showPasswordLabel` and `hidePasswordLabel`: accessible names of the show/hide toggle (default
  `Show password` / `Hide password`).

### Fixes

- `AutoComplete` with options given as an **array** ignored `selectedValue`: the control kept the raw text
  instead of the option. It only worked with a `Promise` or an `Observable`.
- `remapValues()` could not enable a control again once it was disabled, and registered its event actions a
  second time (actions ran twice).
- `addAsyncValidators()` failed with `Cannot read properties of null (reading 'validate')` when the control had
  no async validator yet.
- The show/hide toggle of one `InputPassword` showed **every** password field of the form; each field now has
  its own toggle. Its accessible name says what it will do (`Show password` while hidden).
- Buttons of the password toggle and of the time panel (AM, PM, Cancel, OK) were submit buttons; they no longer
  submit the surrounding form. The remove file button has an accessible name.

### Documentation

- The Material Icons font is required (added by `ng add @angular/material`).
- Angular Material 15 has no `standard` or `legacy` appearance: use `fill` or `outline`.

### Tooling

- `tests/consumers`: installs the packed library in a fresh Angular 11, 12, 13, 14 and 15 app, builds it and
  runs an in-browser scenario with the native and the moment adapter. Runs in CI (**Consumer apps** workflow).

## 1.7.2

_2026-11-18_ · [App compatibility](./guides/app-compatibility.md)

### Behavior changes

- `peerDependencies` now declare Angular **11 to 15** (`>=11.0.0 <16.0.0`). The package is built in View Engine
  format, which Angular 16 cannot load because it removed `ngcc`; the old range (`<17`) let npm install it on
  Angular 16, where it failed. Angular 16 apps now get a peer dependency warning at install time.

- The library no longer registers `MatNativeDateModule` for the whole app. It used to replace the `DateAdapter`
  your app configured (for example moment) depending on the import order. The form now uses your adapter, or the
  native one only for its own fields. If your app has other Material datepickers and no date adapter, import
  `MatNativeDateModule` (or another adapter) in your app.

### Features

- `FormStructure.getNodeElement(id)` returns the element of a node inside its own form. `Node.getNativeElement()`
  is deprecated.
- Configurable texts: `InputFile.selectLabel` and `allFilesLabel`, `DateRangePicker.startPlaceholder` and
  `endPlaceholder` (defaults unchanged).

### Fixes

- Several forms on one page with the same node ids, or a form inside a Shadow DOM: events, autofocus, scroll
  sizing, `InputNumber`, file inputs and the date-time picker icon acted on the first matching element of the
  whole document. Lookups now stay inside each form.
- Server-side rendering: the form no longer uses `window` while rendering.
- Typed dates in `DateTimePicker` / `TimePicker` are read with the node's `dateFormat`: `06/05/2025` with
  `dd/MM/yyyy` is 6 May, not 5 June; `02:15 PM` with `hh:mm a` works.
- `InputNumber` accepts a comma as decimal separator.
- Layout without Bootstrap 5: the templates used Bootstrap 5 classes (`ms-auto`, `me-3`…) while the package
  installs Bootstrap 4, so the action buttons were not aligned or spaced, and without Bootstrap the native file
  input was visible. The form now has its own scoped layout styles.
- `InputFile` icon: the inline `onerror` handler (blocked by strict CSP) had a typo that requested the generic
  icon in an endless loop when the assets were missing. It now falls back once and hides the image.

- `DateTimePicker` and `TimePicker` work with any `DateAdapter`, such as `MomentDateAdapter`. With moment, the
  versions since the date-time picker was rewritten (1.6.x to 1.7.1) failed with `this.today.setHours is not a function` (calendar with `minDate`),
  `date.toDateString is not a function` (drawing the days), `date.setHours is not a function` (opening an empty
  picker) or `date.clone is not a function` (formatting with `dateTimeInput`). The calendar now compares dates
  with the adapter, and values, `minDate` and `maxDate` may be `Date`, moment, Luxon, Day.js, ISO strings or
  timestamps. See [Using moment or another DateAdapter](./guides/dates-times.md#using-moment-or-another-dateadapter).

## 1.7.1

_2026-11-13_

### Features

- `apply` accepts a block, like Kotlin's `apply { }`: `node.apply(n => { ... })`. The block receives the object
  (also bound to `this` in `function` expressions) and `apply` still returns the same instance. The new
  `ApplyBlock<T>` type lets you share blocks between nodes. See [The apply method](./getting-started/first-form.md#the-apply-method).

### Fixes

- `@angular/forms`, `@angular/platform-browser` and `rxjs` (`^6.5.3 || ^7.0.0`) are declared as peer dependencies.
  The library always used them; now package managers check them and size tools no longer count them as part of
  the library.

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
