import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Button, Checkbox, DatePicker, Dropdown, FormListener, FormStructure, Input, InputFile, InputPassword, OptionChild, RadioGroup, TextArea } from 'projects/mat-dynamic-form/src/public-api';

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
	      new OptionChild('Single', 'SI', true), 
	      new OptionChild('Maried', 'MR')
      ]).apply({ 
	      disabled: true 
      }),
      new InputFile('profPic', 'Profile Picture').apply({ 
	      accept: '.png, .jpg, .jpeg' 
      }),
      new RadioGroup('hasPet', 'Has Pet', [
	      new OptionChild('Yes', 'y'), 
	      new OptionChild('Not', 'n', true)
      ]).apply({ 
	      action: { type: 'change', callback: this } 
      }),
      new InputPassword('pass', 'Password'),
      new TextArea('comments', 'Comments').apply({ 
	      singleLine: true, 
	      validator: Validators.maxLength(100), 
	      maxCharCount: 100 
      }),
      new Checkbox(
	      'terms', 
	      `Terminos y condiciones, <strong><a href='https://www.google.com'>mas.<a </strong>`
      ).apply({ 
	      singleLine: true, 
	      validator: Validators.requiredTrue 
      })
    ];
    this.formStructure.confirmActions = [
      new Button('guardar', 'Guardar', { 
	      callback: this, style: 'primary' 
      }).apply({ 
	      validateForm: false 
      }),
      new Button('cancelar', 'Cancelar', { 
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
	        new  OptionChild('Dog',  'PD'),
	        new  OptionChild('Cat',  'PC')
        ]),
        new Input('raza', 'Raza de la Mascota'),
        new Input('nombreMascota', 'Nombre de la Mascota')
      ]
      if (value == 'y') {
        this.formStructure.createNodes(6, nodes)
      } else this.formStructure.removeNodes(nodes)
    }
  }

  onClick(actionId: string): void {
    switch (actionId) {
      case 'guardar':
        this.formStructure?.setValue([
	        { key: 'nombre', value: 'Carlos' }, 
	        { key: 'tieneMascota', value: 'y' }
        ]);
        break;
      case 'cancelar':
        this.formStructure?.reset();
        break;
    }
  }
}