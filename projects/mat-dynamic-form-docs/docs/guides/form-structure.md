---
sidebar_position: 1
title: FormStructure
---

# FormStructure

`FormStructure` describes the whole form and is also the API to read and change it once it is rendered.

```ts
const structure = new FormStructure(title?, nodes?, validateActions?);
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Title shown above the form. |
| `showTitle` | `boolean` | `true` | Hides the title when `false`. |
| `nodes` | `Node[]` | — | The fields, in display order. See [Nodes](./nodes.md). |
| `validateActions` | `Button[]` | — | Up to **4** buttons shown at the bottom. More than 4 throws an error. |
| `appearance` | `'standard' \| 'fill' \| 'outline' \| 'legacy'` | `'standard'` | Material form-field appearance. Buttons follow it: `outline` → stroked, `fill` → raised, otherwise flat. |
| `globalValidators` | `ValidatorFn \| ValidatorFn[]` | — | Validators added to every field, on top of each node's own `validator`. |
| `validateEvenDisabled` | `boolean` | `false` | When `true`, buttons with `validateForm` also check the sync validators of **disabled** fields. |
| `onlyScrollContent` | `boolean` | `false` | Keeps the title and buttons fixed and scrolls only the fields. |
| `maxParentHeight` | `string` | `'100vh'` | Maximum height used by `onlyScrollContent` (any CSS length). |

## Reading values

| Method | Returns |
| --- | --- |
| `getValue<T>()` | The form value. Disabled fields are excluded. |
| `getRawValue<T>()` | The form value including disabled fields. |
| `getControlById(id)` | The `AbstractControl` of a node, or `null`. |
| `getNodeById<T>(id)` | The node, with `value` updated from its control. `undefined` if the id does not exist. |
| `getActionById(id)` | A validate action (`Button`). |
| `isValid()` / `isInvalid()` | The form validity. |
| `getFormGroup()` | The underlying `FormGroup`. |

```ts
interface SignUp { name: string; birthDate: Date; }

const value = this.formStructure.getValue<SignUp>();
const nameControl = this.formStructure.getControlById('name');
```

## Changing values

| Method | Description |
| --- | --- |
| `patchValue(values)` | Sets the given controls. Throws `ReferenceException` if an id does not exist. Returns `false` before the form is rendered. |
| `reset()` | Clears every control (`FormGroup.reset()`). |
| `remapValues()` | Puts back the initial value of every node and applies its current `disabled` flag. |

```ts
this.formStructure.patchValue({ name: 'Carlos', hasPet: 'y' });

// "Cancel" button: clear and restore the defaults
structure.reset();
structure.remapValues();
```

:::note Deprecated
`pathValue` and `isInalid` still work but are deprecated. Use `patchValue` and `isInvalid`.
:::

## Validators

| Method | Description |
| --- | --- |
| `addValidators(id, validators)` | Adds sync validators and keeps the existing ones. |
| `setValidator(id, validators)` | Replaces the sync validators. |
| `addAsyncValidators(id, validators)` | Adds async validators and keeps the existing ones. |
| `setAsyncValidator(id, validators)` | Replaces the async validators. |

See [Validation](./validation.md).

## Adding and removing nodes

| Method | Description |
| --- | --- |
| `createNodes(position, nodes)` | Inserts nodes at `position` and creates their controls. Nodes whose id already exists are skipped. |
| `removeNodes(nodes)` | Removes the nodes and their controls (matched by id). |
| `createValidateActions(position, buttons)` | Inserts validate actions. |
| `removeValidateActions(buttons)` | Removes validate actions. |

See [Dynamic forms](./dynamic-forms.md).
