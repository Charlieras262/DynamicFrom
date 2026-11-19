---
sidebar_position: 10
title: App compatibility
---

# App compatibility

How the library behaves with the different ways an application can be set up. Every row is covered by specs
(`app-configurations.spec.ts`, `date-adapters.spec.ts`).

| Your app | Supported | Notes |
| --- | --- | --- |
| Several `<mat-dynamic-form>` on one page, even with the same node ids | ✅ Since 1.7.2 | Events, focus, file inputs and pickers stay inside their own form. Use `structure.getNodeElement(id)` instead of `document.getElementById`. |
| Inside a Shadow DOM (`ViewEncapsulation.ShadowDom`, Angular Elements) | ✅ Since 1.7.2 | |
| Server-side rendering (Angular Universal) | ✅ Since 1.7.2 | The form does not touch `window` or `document` while rendering; focus is only requested in the browser. |
| Its own `DateAdapter` (moment, Luxon, Day.js…) | ✅ Since 1.7.2 | The library never replaces it. See [Dates and times](./dates-times.md#using-moment-or-another-dateadapter). |
| No `DateAdapter` | ✅ | The form uses the native adapter for its own fields only. Import `MatNativeDateModule` if your app has other Material datepickers. |
| Day-first locales (`dd/MM/yyyy`) | ✅ Since 1.7.2 | Typed dates are read with the node's `dateFormat`. |
| Comma as decimal separator | ✅ Since 1.7.2 | `InputNumber` turns `1,5` into `1.5`. |
| Bootstrap 5, Bootstrap 4 or no Bootstrap | ✅ Since 1.7.2 | The form ships its own scoped layout styles; they do not leak to your app. |
| Language other than Spanish | ✅ Since 1.7.2 | Set `selectLabel` / `allFilesLabel` (`InputFile`), `startPlaceholder` / `endPlaceholder` (`DateRangePicker`) and the picker labels. |
| Strict Content Security Policy | ✅ Since 1.7.2 | No inline event handlers. HTML in labels and error messages is trusted as given: do not put user input in them. |
| Assets not copied | ⚠️ | Works; the file type icon is hidden. See [Installation](../getting-started/installation.mdx#4-copy-the-file-upload-icons). |
| Angular 11 – 15 | ✅ | The package uses the View Engine format, compiled by `ngcc` on Angular 12 – 15. Every version is tested with a fresh app (`tests/consumers`). |
| Angular Material 15 (MDC) | ✅ | `standard` and `legacy` appearances look like `fill`; use `fill` or `outline`. |
| No Material Icons font | ⚠️ | Icons show as text. `ng add @angular/material` adds the font. |
| Theme import with 1.5.x | ❌ | The theme files exist since 1.6.0: `Can't find stylesheet to import`. See [Installation](../getting-started/installation.mdx#3-include-the-theme). |
| Angular 16+ | ❌ | Angular 16 removed `ngcc`, so it cannot load View Engine libraries. Since 1.7.2 the peer dependencies say so (`<16.0.0`) and npm warns at install time. |
| Zoneless change detection | ❌ | The form relies on zone.js to update after its internal timers. |

## Accessing node elements

Prefer the structure over global lookups, which can find an element of another form:

```ts
// Before: may return an element of another form with the same id
document.getElementById('email');
node.getNativeElement(); // deprecated

// Now: always the element of this form
this.formStructure.getNodeElement('email');
```
