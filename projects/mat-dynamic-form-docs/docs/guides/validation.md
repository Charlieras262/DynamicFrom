---
sidebar_position: 6
title: Validation
---

# Validation

Validation uses Angular's `Validators` (or your own `ValidatorFn`).

## Node and global validators

```ts
this.formStructure.globalValidators = Validators.required; // every field

this.formStructure.nodes = [
  new Input('email', 'Email').apply({
    validator: Validators.email, // combined with the global validators
    errorMessage: 'Enter a valid email',
  }),
  new Checkbox('terms', 'I accept the terms').apply({ validator: Validators.requiredTrue }),
];
```

`errorMessage` is shown under the field when it is invalid. It accepts HTML.

## Async validators

```ts
new Input('username', 'Username').apply({
  asyncValidator: (control) => this.api.isTaken(control.value).pipe(map(taken => (taken ? { taken: true } : null))),
});
```

## Changing validators at runtime

```ts
structure.addValidators('phone', Validators.pattern(/^\d{8}$/)); // keeps the existing ones
structure.setValidator('phone', Validators.required);            // replaces them
structure.addAsyncValidators('username', uniqueUsername);
structure.setAsyncValidator('username', null);
```

## Buttons that need a valid form

- `validateForm: true` disables a button while the form is invalid.
- `validation: (param) => boolean` adds your own condition.
- `FormStructure.validateEvenDisabled = true` also checks the validators of **disabled** fields (disabled
  controls are otherwise ignored by Angular). Since 1.7.0 this check no longer touches the controls, so it does not
  cause `ExpressionChangedAfterItHasBeenCheckedError`.

```ts
new Button('save', 'Save', { style: 'primary' }).apply({
  validateForm: true,
  validation: ({ structure }) => structure.getValue<any>().password === structure.getValue<any>().confirm,
});
```
