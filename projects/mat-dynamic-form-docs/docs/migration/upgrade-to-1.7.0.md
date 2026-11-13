---
sidebar_position: 1
title: Upgrade to 1.7.0
---

# Upgrade from 1.6.x to 1.7.0

```bash
npm install mat-dynamic-form@1.7.0
```

## Breaking change: import your own animations module

Up to 1.6.x the library imported `BrowserAnimationsModule`. That module re-exports `BrowserModule`, so importing
`MatDynamicFormModule` in a lazy-loaded or feature module failed with:

```text
BrowserModule has already been loaded. If you need access to common directives such as NgIf and NgFor
from a lazy loaded module, import CommonModule instead.
```

Its providers could also override an app that wanted `NoopAnimationsModule`. In 1.7.0 the library imports no app-level
modules, so **your root module must import an animations module**:

```ts title="app.module.ts"
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // add this (or NoopAnimationsModule) if it was missing
    MatDynamicFormModule,
  ],
})
export class AppModule {}
```

Standalone apps add `provideAnimations()` (or `provideNoopAnimations()`) to `bootstrapApplication`.

**Most apps already import one** because Angular Material's `ng add` adds it; in that case there is nothing to do.

## Behavior changes

| What | Before | 1.7.0 |
| --- | --- | --- |
| `valueChange` actions | Skipped when the value went back to the node's initial value. | Run on every change. |
| Empty `DateTimePicker` / `TimePicker` | Showed today's date although the value was empty. | Shows an empty field. |
| `DateTimePicker` without `dateFormat` | Showed only the date. | Shows date and time (time only for `TimePicker`). |
| Changing the day in `DateTimePicker` | Reset the time to 12:00 AM. | Keeps the chosen time. |
| `AutoComplete` with an `Observable` | Subscribed twice (two HTTP requests). | Subscribes once. |
| Positional constructor arguments | Some ended in the wrong property (for example `icon` in `singleLine`). | Mapped as documented. |

If you used positional constructor arguments and adjusted them to the old, shifted behavior, switch to
`apply({...})` with named properties.

## Bug fixes you get for free

See the [changelog](../changelog.md#170) for the full list. The highlights:

- `InputFile` keeps the error state, so **retry** and **remove** appear after a rejected file.
- The deprecated `callback.onClick` runs once per click instead of twice.
- `validateEvenDisabled` no longer throws `ExpressionChangedAfterItHasBeenCheckedError`.
- `TimePicker` no longer blocks PM when `minDate` is in the afternoon.
- Choosing a month or year in the date-time calendar no longer jumps to the time panel.
