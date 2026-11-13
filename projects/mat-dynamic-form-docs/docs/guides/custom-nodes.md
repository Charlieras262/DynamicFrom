---
sidebar_position: 8
title: Custom nodes
---

# Custom nodes

`CustomNode` renders any component of yours as a field of the form. The library creates the component, copies
your properties into it and gives it the node's `FormControl` in a `control` property.

```ts
new CustomNode<EmailInputComponent>('contactEmail', EmailInputComponent, {
  label: 'Contact email',
  placeholder: 'name@example.com',
});
```

```ts title="email-input.component.ts"
@Component({
  selector: 'app-email-input',
  template: `
    <mat-form-field appearance="fill" class="col-12">
      <mat-label>{{ label }}</mat-label>
      <input matInput type="email" [placeholder]="placeholder" [formControl]="control" />
    </mat-form-field>
  `,
})
export class EmailInputComponent {
  label: string;
  placeholder: string;
  control: FormControl; // set by mat-dynamic-form: bind it to your field
}
```

- Every key of the properties object is assigned to the component instance.
- `control` is the form control of the node: its value appears in `getValue()` under the node id, and node
  validators apply to it.
- The created instance is available in `node.instance` after the form renders.
- The component must be declared in a module your feature can see (or be standalone), and it needs
  `ReactiveFormsModule` for `[formControl]`.
