---
sidebar_position: 1
slug: /intro
title: Introduction
---

# Mat Dynamic Form

**Mat Dynamic Form** is an Angular Material library that builds complete reactive forms from a single
`FormStructure` object. You describe the fields as _nodes_ (inputs, dropdowns, date pickers, file uploads,
buttons, your own components…) and the `<mat-dynamic-form>` component renders the Angular Material fields,
creates the `FormGroup`, wires validators and runs your actions.

```html
<mat-dynamic-form [structure]="formStructure"></mat-dynamic-form>
```

## What you get

- **16 node types** ready to use: text, number, password, text area, checkbox, switch, radio group, dropdown,
  autocomplete, date, date range, date-time, time, file upload, buttons and custom components.
- **Reactive forms under the hood**: every node is a `FormControl` you can read, patch and validate through
  the `FormStructure` API.
- **Runtime changes**: add or remove nodes, enable or disable them, change validators and react to events while
  the form is displayed.
- **Actions**: run code on value changes, DOM events or button clicks, with access to the whole structure.
- **Theming**: a Sass mixin that follows your Angular Material theme.

## Compatibility

| mat-dynamic-form | Angular / Angular Material | Notes |
| --- | --- | --- |
| **1.7.x** | 11 – 16 | The app imports its own animations module. See [Upgrade to 1.7.0](./migration/upgrade-to-1.7.0.md). 1.7.1 adds `apply` with a block. |
| 1.6.x | 11 – 16 | Imported `BrowserAnimationsModule` itself. |

## Next steps

- [Install the library](./getting-started/installation.mdx) and set up animations, the theme and the assets.
- Build [your first form](./getting-started/first-form.md).
- Coming from 1.6.x? Read [Upgrade to 1.7.0](./migration/upgrade-to-1.7.0.md).
