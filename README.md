![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Charlieras262/DynamicFrom/Node.js%20CI) ![npm (tag)](https://img.shields.io/npm/v/mat-dynamic-form/latest) ![npm bundle size](https://img.shields.io/bundlephobia/min/mat-dynamic-form)  
# Mat Dynamic Form

  

This is an Angular Material library that was created to make form designing easier and intuitive, you just need to send a json object to generate a fully functional form.

  

## Installation

```

npm i mat-dynamic-form

```

  

### Dependencies <a id="dependencies"></id>

  

#### Angular Material

[Angular Material Documentation](https://material.angular.io/guide/getting-started)

```

ng add @angular/material

```

This is necesary to create angular material components.


## Usage

  

### AppModule

```typescript

import { NgModule } from '@angular/core';
import { MatDynamicFormModule } from 'mat-dynamic-form';

@NgModule({
  imports: [
    ...,
    MatDynamicFormModule
  ],
  providers: [],
  ...
})

export class AppModule {}

```


### HTML

```html

<mat-dynamic-form  [structure]="formStructure"></mat-dynamic-form>

```

### TS

This is an example of a full sing up form.

```typescript

import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActionEvent, Button, Checkbox, CustomNode, DatePicker, Dropdown, FormStructure, Input, InputFile, InputPassword, OptionChild, RadioGroup, TextArea } from 'projects/mat-dynamic-form/src/public-api';
import { InputComponent } from './input/input.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  formStructure: FormStructure;

  constructor() {
    this.formStructure = new FormStructure();

    this.formStructure.title = 'Sign Up';
    this.formStructure.appearance = 'standard';
    this.formStructure.globalValidators = Validators.required;
    this.formStructure.nodes = [
      new Input('name', 'Name').apply({
        icon: 'person',
        maxCharCount: 100
      }),
      new Button('find', 'Find', { style: 'primary' }).apply({
        icon: "search",
        singleLine: false
      }),
      new Input('tel', 'Phone Number').apply({
        icon: 'phone'
      }),
      new DatePicker('bDate', 'BirthDate').apply({
        action: { callback: this, type: 'change' }
      }),
      new Dropdown('cStatus', 'Civil Status', [
        new OptionChild('Single', 'SI',),
        new OptionChild('Maried', 'MR')
      ]).apply({
        selectedValue: 'SI',
        disabled: true
      }),
      new InputFile('profPic', 'Profile Picture').apply({
        accept: '.png, .jpg, .jpeg'
      }),
      new RadioGroup('hasPet', 'Has Pet', [
        new OptionChild('Yes', 'y'),
        new OptionChild('Not', 'n'),
      ]).apply({
        selectedValue: 'n',
        action: { type: 'valueChange', onEvent: (param) => this.onHasPetValueChange(param) }
      }),
      new InputPassword('pass', 'Password'),
      new TextArea('comments', 'Comments').apply({
        singleLine: true,
        validator: Validators.maxLength(100),
        maxCharCount: 100
      }),
      new CustomNode<InputComponent>('custom1', InputComponent, { label: 'Custom 1', placeholder: 'Custom Placeholder 1' }),
      new CustomNode<InputComponent>('custom2', InputComponent, { label: 'Custom 2', placeholder: 'Custom Placeholder 2' }),
      new Checkbox(
        'agreement',
        `I have read and agree to the terms of DynamicForm License Agreement, <strong><a href='https://www.google.com'>Read the license here.<a </strong>`
      ).apply({
        singleLine: true,
        validator: Validators.requiredTrue
      }),
      new CustomNode<InputComponent>('custom3', InputComponent, { label: 'Custom 3', placeholder: 'Custom Placeholder 2' }),
    ];
    this.formStructure.validateActions = [
      new Button('cancel', 'Cancel', {
        onEvent: (param) => {
          param.structure?.reset();
          param.structure?.remapValues();
        }, style: 'warn'
      }).apply({
        icon: 'close'
      }),
      new Button('save', 'Save', {
        onEvent: (param) => param.structure?.patchValue({ name: 'Carlos', hasPet: 'y' }), style: 'primary',
      }).apply({
        validateForm: true,
        icon: 'save'
      }),
    ];
  }

  ngOnInit(): void {
  }

  onHasPetValueChange(param: ActionEvent) {
    const nodes = [
      new Dropdown('petType', 'Pet Type', [
        new OptionChild('Dog', 'PD'),
        new OptionChild('Cat', 'PC')
      ]),
      new Input('breed', 'Pet Breed'),
      new Input('petName', 'Pet Name')
    ]
    if (param.event == 'y') {
      this.formStructure.createNodes(7, nodes)
    } else this.formStructure.removeNodes(nodes)
  }
}

```

### Custom Component (TS)

This is an example of a custom componente ts child code.

```typescript
@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  control: FormControl; // <-- You must have to add this property

  constructor() { }

  ngOnInit() {
  }
}

```

### Custom Component (HTML)

This is an example of a custom componente html child code.

```html
...
<mat-form-field class="col-12" appearance="fill">
  <mat-label>{{label}}</mat-label>
  <input type="email" matInput placeholder="{{placeholder}}" [formControl]="control"> <!-- You must have to bind control property with your custom component fields -->
</mat-form-field>
...
```

### Resulting Form

![image](https://user-images.githubusercontent.com/44990120/151060579-c03a0cca-1f98-43e0-8b71-48f4c6012c1d.png)

### [Node Types](https://github.com/Charlieras262/DynamicFrom/blob/9df0525bd140aff183a0507571e1ed63088ce484/projects/mat-dynamic-form/src/lib/models/Node.ts#L10)

* [Checkbox](https://github.com/Charlieras262/DynamicFrom/blob/9df0525bd140aff183a0507571e1ed63088ce484/projects/mat-dynamic-form/src/lib/models/Node.ts#L66)
* [Input](https://github.com/Charlieras262/DynamicFrom/blob/9df0525bd140aff183a0507571e1ed63088ce484/projects/mat-dynamic-form/src/lib/models/Node.ts#L75)
* [InputFile](https://github.com/Charlieras262/DynamicFrom/blob/9df0525bd140aff183a0507571e1ed63088ce484/projects/mat-dynamic-form/src/lib/models/Node.ts#L88)
* [InputPassword](https://github.com/Charlieras262/DynamicFrom/blob/9df0525bd140aff183a0507571e1ed63088ce484/projects/mat-dynamic-form/src/lib/models/Node.ts#L99)
* [InputNumber](https://github.com/Charlieras262/DynamicFrom/blob/9df0525bd140aff183a0507571e1ed63088ce484/projects/mat-dynamic-form/src/lib/models/Node.ts#L114)
* [TextArea](https://github.com/Charlieras262/DynamicFrom/blob/9df0525bd140aff183a0507571e1ed63088ce484/projects/mat-dynamic-form/src/lib/models/Node.ts#L107)
* [Radiogroup](https://github.com/Charlieras262/DynamicFrom/blob/9df0525bd140aff183a0507571e1ed63088ce484/projects/mat-dynamic-form/src/lib/models/Node.ts#L121)
* [Dropdown](https://github.com/Charlieras262/DynamicFrom/blob/9df0525bd140aff183a0507571e1ed63088ce484/projects/mat-dynamic-form/src/lib/models/Node.ts#L129)
* [DatePicker](https://github.com/Charlieras262/DynamicFrom/blob/9df0525bd140aff183a0507571e1ed63088ce484/projects/mat-dynamic-form/src/lib/models/Node.ts#L137)
* [Button](https://github.com/Charlieras262/DynamicFrom/blob/9df0525bd140aff183a0507571e1ed63088ce484/projects/mat-dynamic-form/src/lib/models/Node.ts#L147)

### Classes

* [FormStructure](https://github.com/Charlieras262/DynamicFrom/blob/main/projects/mat-dynamic-form/src/lib/models/FormStructure.ts)
* [Node](https://github.com/Charlieras262/DynamicFrom/blob/main/projects/mat-dynamic-form/src/lib/models/Node.ts)
* [DataSet](https://github.com/Charlieras262/DynamicFrom/blob/main/projects/mat-dynamic-form/src/lib/models/DataSet.ts)
* [Action](https://github.com/Charlieras262/DynamicFrom/blob/main/projects/mat-dynamic-form/src/lib/models/Action.ts)
* [OptionChild](https://github.com/Charlieras262/DynamicFrom/blob/main/projects/mat-dynamic-form/src/lib/models/OptionChild.ts)

### Apply Method
[ObjectBase.apply](https://github.com/Charlieras262/DynamicFrom/blob/d4ef39f5a12e6670c0378cd72be3de5d7d7a8993/projects/mat-dynamic-form/src/lib/models/base/ObjectBase.ts#L2)
#### Usage

```typescript

new TextArea('comments', 'Comments').apply({
	// All the properties of the object you´re using "apply" method.
	singleLine: true, 
	validator: Validators.maxLength(100), 
	maxCharCount: 100 
}),

```
> This method can be used in all classes of the lib (like kotlin apply).