---
sidebar_position: 9
title: Theming
---

# Theming

The `mat-dynamic-form-theme` mixin colors the date-time picker, the file upload and the field icons with your
Angular Material theme. Include it after your Angular Material theme:

```scss
@import 'mat-dynamic-form/src/lib/styles/theme';        // Angular 11 – 13
// @import 'mat-dynamic-form/src/lib/styles/14/theme';  // Angular 14 – 16

@include mat-dynamic-form-theme($app-theme);
```

The full setup is in [Installation](../getting-started/installation.mdx#3-include-the-theme).

## Layout

Fields are laid out in two columns with Bootstrap's grid (included by the theme). Use `singleLine: true` on a
node to make it take the whole row.

## Appearance

`FormStructure.appearance` sets the Material form-field appearance of every field and the style of the buttons:

| appearance | Fields | Buttons |
| --- | --- | --- |
| `standard` (default) | Underlined | Flat (`mat-button`) |
| `fill` | Filled | Raised (`mat-raised-button`) |
| `outline` | Outlined | Stroked (`mat-stroked-button`) |

## Animations

The pickers' panels use CSS animations, and Material components use Angular animations. Use
`NoopAnimationsModule` (or `provideNoopAnimations()`) in your root to turn the Angular animations off. Panels
close correctly even when CSS animations are disabled.
