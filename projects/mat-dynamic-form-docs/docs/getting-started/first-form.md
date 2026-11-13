---
sidebar_position: 2
title: Your first form
---

# Your first form

A form is a `FormStructure` with a list of **nodes** (the fields) and up to four **validate actions** (the
buttons at the bottom). Pass it to `<mat-dynamic-form>`.

```html title="sign-up.component.html"
<mat-dynamic-form [structure]="formStructure"></mat-dynamic-form>
```

```ts title="sign-up.component.ts"
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import {
  ActionEvent, Button, Checkbox, DatePicker, Dropdown, FormStructure, Input, InputPassword, OptionChild, RadioGroup
} from 'mat-dynamic-form';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {
  formStructure = new FormStructure();

  constructor() {
    this.formStructure.title = 'Sign Up';
    this.formStructure.appearance = 'outline';
    this.formStructure.globalValidators = Validators.required;

    this.formStructure.nodes = [
      new Input('name', 'Name').apply({ icon: 'person', maxCharCount: 100 }),
      new Input('email', 'Email').apply({ icon: 'email', validator: Validators.email }),
      new InputPassword('password', 'Password'),
      new DatePicker('birthDate', 'Birth date').apply({ maxDate: new Date() }),
      new Dropdown('status', 'Civil status', [
        new OptionChild('Single', 'SI'),
        new OptionChild('Married', 'MR'),
      ]).apply({ selectedValue: 'SI' }),
      new RadioGroup('hasPet', 'Has pet', [
        new OptionChild('Yes', 'y'),
        new OptionChild('No', 'n'),
      ]).apply({ selectedValue: 'n' }),
      new Checkbox('terms', 'I accept the <strong>terms and conditions</strong>').apply({
        singleLine: true,
        validator: Validators.requiredTrue,
      }),
    ];

    this.formStructure.validateActions = [
      new Button('cancel', 'Cancel', {
        style: 'warn',
        onEvent: ({ structure }) => {
          structure.reset();
          structure.remapValues();
        },
      }).apply({ icon: 'close' }),
      new Button('save', 'Save', {
        style: 'primary',
        onEvent: (param: ActionEvent) => this.save(param),
      }).apply({ icon: 'save', validateForm: true }),
    ];
  }

  save({ structure }: ActionEvent) {
    console.log(structure.getValue());
  }
}
```

What happens:

- Each node becomes an Angular Material field and a control in the form, under its **id** (`name`, `email`…).
- `globalValidators` is added to every field. Node validators (`Validators.email`) are combined with it.
- `validateForm: true` keeps **Save** disabled until the form is valid.
- `structure.getValue()` returns `{ name, email, password, birthDate, status, hasPet, terms }`.
- **Cancel** clears the form with `reset()` and puts the initial values back with `remapValues()`.

## The `apply` method

Every class of the library (nodes, `FormStructure`, `OptionChild`…) has an `apply` method, similar to Kotlin's
`apply`: it assigns the given properties and returns the same instance, so you can configure a node inline.

```ts
new TextArea('comments', 'Comments').apply({
  singleLine: true,
  validator: Validators.maxLength(100),
  maxCharCount: 100,
});
```

:::tip
Prefer `apply` over long positional constructors. Since 1.7.0 the positional arguments are mapped correctly,
but named properties are easier to read and keep working if a constructor gains parameters.
:::

## Next

- All the [node types](../guides/nodes.md) and their options.
- The [`FormStructure` API](../guides/form-structure.md) to read and change the form.
