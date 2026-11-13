---
sidebar_position: 2
title: Nodes
---

# Nodes

A node is one field of the form. Its `id` is the name of its control in the form value. All nodes are
configured with `apply({...})` or with constructor arguments.

## Common properties

Every node has these properties:

| Property | Type | Description |
| --- | --- | --- |
| `id` | `string` | Control name and DOM id. Must be unique in the form. |
| `placeholder` | `string` | Label of the field. |
| `singleLine` | `boolean` | Uses the full row instead of half of it (two columns by default). |
| `icon` | `string` | Material icon name shown as suffix. |
| `hint` | `string` | Help text under the field. |
| `errorMessage` | `string` | Message shown when the field is invalid. HTML is allowed. |
| `disabled` | `boolean` | Creates the control disabled. |
| `validator` | `ValidatorFn \| ValidatorFn[]` | Sync validators. See [Validation](./validation.md). |
| `asyncValidator` | `AsyncValidatorFn` | Async validator. |
| `autoFocus` | `boolean` | Focuses this field when the form is shown. Without it the first field gets the focus. |
| `action` | `Action \| Action[]` | Code to run on events. See [Actions and events](./actions-events.md). |

Nodes that hold a free value (`Input`, `TextArea`, `InputPassword`, `InputNumber`, `DatePicker`,
`DateTimePicker`, `TimePicker`, `InputFile`) also have `value` (initial value) and `readOnly`.

## Text

### Input

```ts
new Input('name', 'Name').apply({ icon: 'person', maxCharCount: 100, hint: 'Your full name' });
```

| Property | Description |
| --- | --- |
| `maxCharCount` | Max length. Also shows a `current / max` counter. |
| `minCharCount` | Min length (`minlength` attribute). |
| `readOnly` | Read-only field. `readonly()` and `editable()` toggle it. |

### InputPassword

An `Input` with a show/hide button.

```ts
new InputPassword('password', 'Password').apply({ validator: Validators.minLength(8) });
```

### TextArea

An `Input` rendered as a `<textarea>`.

```ts
new TextArea('comments', 'Comments').apply({ singleLine: true, maxCharCount: 500 });
```

### InputNumber

An `Input` that only accepts numbers.

```ts
new InputNumber('age', 'Age').apply({ min: 18, max: 99, decimalCount: 0 });
```

| Property | Default | Description |
| --- | --- | --- |
| `min` | — | Values below are replaced by `min`. |
| `max` | — | Values above are replaced by `max`. |
| `decimalCount` | `2` | Maximum decimals. `0` allows integers only. |

Letters are removed while typing and negative numbers are allowed. The value is stored as a **string**.

## Choices

Options are `OptionChild` instances: `new OptionChild(title, value)`. For `Dropdown`, `RadioGroup` and
`AutoComplete` the options can be an array, a `Promise` or an `Observable`:

```ts
new Dropdown('country', 'Country', this.http.get<OptionChild[]>('/api/countries'));
```

The `Observable` is subscribed once (one HTTP request) and only its first value is used.

### Dropdown

```ts
new Dropdown('status', 'Civil status', [
  new OptionChild('Single', 'SI'),
  new OptionChild('Married', 'MR'),
]).apply({ selectedValue: 'SI', multiple: false });
```

| Property | Description |
| --- | --- |
| `selectedValue` | Initial value (an option `value`). |
| `multiple` | Allows several options; the value becomes an array. |

### RadioGroup

```ts
new RadioGroup('hasPet', 'Has pet', [new OptionChild('Yes', 'y'), new OptionChild('No', 'n')])
  .apply({ selectedValue: 'n' });
```

### AutoComplete

A text field that filters its options while typing (by title or value, case insensitive).

```ts
new AutoComplete('country', 'Country', this.countries$).apply({ selectedValue: 'gt' });
```

The value of the control is the selected **`OptionChild`**, not its value. `selectedValue` is matched against
the option values (case insensitive) once the options load. If they never load, the field stays empty.

### Checkbox and Switch

```ts
new Checkbox('terms', 'I accept the <a href="/terms">terms</a>').apply({ validator: Validators.requiredTrue });
new Switch('notifications', 'Email notifications', true);
```

The `Checkbox` label accepts HTML. The value is a `boolean`.

## Dates and times

`DatePicker`, `DateRangePicker`, `DateTimePicker` and `TimePicker` are described in
[Dates and times](./dates-times.md).

## Files

`InputFile` is described in [File upload](./file-upload.md).

## Buttons

`Button` nodes can be placed among the fields or as `validateActions` at the bottom of the form.

```ts
new Button('search', 'Search', { style: 'primary', onEvent: ({ structure }) => this.search(structure) })
  .apply({ icon: 'search', validateForm: false });
```

| Property | Description |
| --- | --- |
| `action.style` | `'primary' \| 'accent' \| 'warn'` color. |
| `action.onEvent` | Runs on click. Receives `{ event, structure }`. |
| `icon` | Material icon. |
| `validateForm` | Disables the button while the form is invalid. |
| `validation` | `(param) => boolean`. The button is disabled while it returns `false`. |
| `disabled` | Always disabled. |

```ts
new Button('find', 'Find', { style: 'primary' }).apply({
  validation: ({ structure }) => structure.getControlById('name')?.value?.length > 0,
});
```

## Custom components

`CustomNode` renders your own component. See [Custom nodes](./custom-nodes.md).
