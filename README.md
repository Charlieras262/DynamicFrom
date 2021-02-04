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
import { Button, Checkbox, DatePicker, Dropdown, FormListener, FormStructure, Input, InputFile, InputPassword, OptionChild, RadioGroup, TextArea } from 'mat-dynamic-form';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, FormListener {

  formStructure: FormStructure;

  constructor() {
    this.formStructure = new FormStructure();

    this.formStructure.title = 'Sign Up';
    this.formStructure.appearance = 'outline';
    this.formStructure.globalValidators = Validators.required;
    this.formStructure.nodes = [
      new Input('name', 'Name').apply({
        icon: 'person'
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
        new OptionChild('Not', 'n')
      ]).apply({
        selectedValue: 'n',
        action: { type: 'change', callback: this }
      }),
      new InputPassword('pass', 'Password'),
      new TextArea('comments', 'Comments').apply({
        singleLine: true,
        validator: Validators.maxLength(100),
        maxCharCount: 100
      }),
      new Checkbox(
        'agreement',
        `I have read and agree to the terms of DynamicForm License Agreement, <strong><a href='https://www.google.com'>Read the license here.<a </strong>`
      ).apply({
        singleLine: true,
        validator: Validators.requiredTrue
      })
    ];
    this.formStructure.validateActions = [
      new Button('save', 'Save', {
        callback: this, style: 'primary'
      }).apply({
        validateForm: false
      }),
      new Button('cancel', 'Cancel', {
        callback: this, style: 'warn'
      })
    ];
  }

  ngOnInit(): void {
  }

  onEvent(id: string, value: any): void {
    console.log(id, value)
    if (id == 'hasPet') {
      const nodes = [
        new Dropdown('petType', 'Pet Type', [
          new OptionChild('Dog', 'PD'),
          new OptionChild('Cat', 'PC')
        ]),
        new Input('breed', 'Pet Breed'),
        new Input('petName', 'Pet Name')
      ]
      if (value == 'y') {
        this.formStructure.createNodes(6, nodes)
      } else this.formStructure.removeNodes(nodes)
    }
  }

  onClick(actionId: string): void {
    switch (actionId) {
      case 'save':
        this.formStructure?.setValue([
          { key: 'name', value: 'Carlos' },
          { key: 'hasPet', value: 'y' }
        ]);
        break;
      case 'cancel':
        this.formStructure?.reset();
        break;
    }
  }
}

```

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