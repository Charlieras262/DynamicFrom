---
sidebar_position: 5
title: Actions and events
---

# Actions and events

An `Action` runs your code when something happens on a node. Set it in the node's `action` property (one action
or an array).

```ts
interface Action {
  type?: 'valueChange' | string;   // event name
  style?: 'primary' | 'accent' | 'warn'; // buttons only
  onEvent?: (param: ActionEvent) => void;
}

interface ActionEvent {
  event: any;               // the new value, or the DOM event
  structure: FormStructure; // the form, to read or change it
}
```

## `valueChange`

Runs every time the control value changes, from the user or from code. `event` is the **new value**.

```ts
new RadioGroup('hasPet', 'Has pet', [new OptionChild('Yes', 'y'), new OptionChild('No', 'n')]).apply({
  action: {
    type: 'valueChange',
    onEvent: ({ event, structure }) => console.log('hasPet is now', event),
  },
});
```

:::info Changed in 1.7.0
`valueChange` now also runs when the value goes back to its initial value. Before 1.7.0 that change was skipped.
:::

## DOM events

Any other `type` is a DOM event name (`'change'`, `'blur'`, `'focus'`, `'keyup'`…) listened on the node's element.
`event` is the DOM `Event`. The action runs only when the control value differs from the node's initial `value`.

```ts
new Input('zip', 'ZIP code').apply({
  action: { type: 'blur', onEvent: ({ structure }) => this.lookUpCity(structure) },
});
```

## Several actions

```ts
new DatePicker('start', 'Start').apply({
  action: [
    { type: 'valueChange', onEvent: ({ event, structure }) => (structure.getNodeById<DatePicker>('end').minDate = event) },
    { type: 'blur', onEvent: () => this.markTouched() },
  ],
});
```

## Buttons

For `Button` nodes the action runs on **click** (or on `action.type` if you set another event). Each click runs
the action exactly once.

```ts
new Button('save', 'Save', {
  style: 'primary',
  onEvent: ({ structure }) => this.api.save(structure.getValue()),
}).apply({ validateForm: true });
```

## Deprecated: `callback`

`action.callback` (an object implementing `FormListener` with `onEvent(id, value)` and `onClick(id)`) still works
but will be removed in 2.0.0. Use `onEvent` instead.
