[![Node.js CI](https://github.com/Charlieras262/DynamicFrom/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/Charlieras262/DynamicFrom/actions/workflows/node.js.yml) [![Documentation](https://img.shields.io/badge/docs-1.7.1-3f51b5?logo=docusaurus&logoColor=white)](https://charlieras262.github.io/DynamicFrom/) [![npm](https://img.shields.io/npm/v/mat-dynamic-form?logo=npm)](https://www.npmjs.com/package/mat-dynamic-form) [![npm downloads](https://img.shields.io/npm/dm/mat-dynamic-form)](https://www.npmjs.com/package/mat-dynamic-form)

# Mat Dynamic Form

  

This is an Angular Material library that was created to make form designing easier and intuitive, you just need to send a json object to generate a fully functional form.

📖 **Documentation:** https://charlieras262.github.io/DynamicFrom/

  

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

#### Animations (since v1.7.0)

Starting with **v1.7.0** the library no longer imports `BrowserAnimationsModule`. Each application decides which animations module to use, importing it **once** in its root module (`AppModule`):

- `BrowserAnimationsModule` from `@angular/platform-browser/animations` to enable animations.
- `NoopAnimationsModule` from `@angular/platform-browser/animations` to disable them.

This fixes the `BrowserModule has already been loaded` error when `MatDynamicFormModule` was imported in lazy-loaded or feature modules. If you are upgrading from 1.6.x and your app did not import an animations module, add one of the above.


## Usage

  

### AppModule

```typescript

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDynamicFormModule } from 'mat-dynamic-form';

@NgModule({
  imports: [
    BrowserModule,
    // Required by Angular Material. The library does not import it for you;
    // use NoopAnimationsModule instead if you want to disable animations.
    BrowserAnimationsModule,
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

Since 1.7.1 `apply` also accepts a block that receives the object (also bound to `this` in `function` expressions), for configuration that needs logic:

```typescript

new DatePicker('checkOut', 'Check-out').apply(picker => {
	picker.minDate = new Date();
	picker.maxDate = new Date(picker.minDate.getFullYear(), picker.minDate.getMonth() + 1, picker.minDate.getDate());
});

// Reusable blocks
const required: ApplyBlock<Input> = input => {
	input.validator = Validators.required;
	input.errorMessage = 'This field is required';
};

new Input('email', 'Email').apply(required);

```

## 🐳 Docker Support (for local development)

You can run this library in a Docker container to avoid dependency conflicts (e.g., Angular 11 with Node 14) and isolate it from other Angular projects.

### 🔧 Build Docker Image

Make sure you're in the root folder of the repo:

```bash
docker build -t angular11-dev -f Dockerfile .
```

> If you don’t have a `Dockerfile` yet, you can create one like this:

```Dockerfile
# Usa Node.js 14, compatible con Angular 11
FROM node:14

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala Angular CLI versión 11 de forma global
RUN npm install -g @angular/cli@11

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de archivos del proyecto
COPY . .

# Expone el puerto 4200 (Angular dev server)
EXPOSE 4200

# Comando por defecto (puede ser override en docker run)
CMD ["ng", "serve", "--host", "0.0.0.0"]
```

---

### 🚀 Run the Project in Docker

To serve the sandbox app locally (port 4200):

```bash
docker run -it --rm -v "$PWD":/app -w /app -p 4200:4200 --init angular11-dev ng serve --host 0.0.0.0
```

---

### 📦 Development Notes

- Changes to your local source files will be reflected in the running Docker container automatically, because you're mounting the code with `-v "$PWD":/app`.
- If you're using symlinks, make sure Git tracks them correctly (`core.symlinks=true`).
- If other collaborators use the project, recommend them to run the symlink command once after cloning.