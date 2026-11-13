---
sidebar_position: 7
title: Dynamic forms
---

# Dynamic forms

The `FormStructure` you pass to the component stays live: change it and the form updates.

## Show fields depending on an answer

```ts
private petNodes = [
  new Dropdown('petType', 'Pet type', [new OptionChild('Dog', 'D'), new OptionChild('Cat', 'C')]),
  new Input('petName', 'Pet name'),
];

onHasPetChange({ event, structure }: ActionEvent) {
  if (event === 'y') {
    const position = structure.nodes.findIndex(n => n.id === 'hasPet') + 1;
    structure.createNodes(position, this.petNodes);
  } else {
    structure.removeNodes(this.petNodes);
  }
}
```

- `createNodes` skips nodes whose id already exists, so calling it twice is safe.
- `removeNodes` removes the controls too, so the values disappear from `getValue()`.

## Enable, disable and change nodes

Node properties are read on every change detection, so you can update them directly:

```ts
const end = structure.getNodeById<DatePicker>('end');
end.minDate = startDate;

const name = structure.getNodeById<Input>('name');
name.readonly();
```

To enable or disable a control use the control itself, or change `node.disabled` and call `remapValues()`
(which also restores the initial values):

```ts
structure.getControlById('email')?.disable();
```

## Buttons at runtime

```ts
structure.createValidateActions(0, [new Button('delete', 'Delete', { style: 'warn', onEvent: () => this.delete() })]);
structure.removeValidateActions([deleteButton]);
```

The bottom bar holds up to 4 buttons.

## Load data into the form

```ts
this.api.getUser(id).subscribe(user => this.formStructure.patchValue({
  name: user.name,
  birthDate: new Date(user.birthDate),
}));
```

`patchValue` throws a `ReferenceException` if a key does not match a node id, which catches typos early.
