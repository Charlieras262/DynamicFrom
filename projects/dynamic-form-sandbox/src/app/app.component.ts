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
    this.formStructure.appearance = 'standard';
    this.formStructure.globalValidators = Validators.required;
    this.formStructure.nodes = [
      new Input('name', 'Name').apply({
        icon: 'person'
      }),
      new Button('find', 'Find', {callback: this, style: 'primary'}).apply({
        icon: "search",
        singleLine: true
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
    if (id == 'hasPet') {
      console.log(id)
      const nodes = [
        new Dropdown('petType', 'Pet Type', [
          new OptionChild('Dog', 'PD'),
          new OptionChild('Cat', 'PC')
        ]),
        new Input('breed', 'Pet Breed'),
        new Input('petName', 'Pet Name')
      ]
      if (value == 'y') {
        this.formStructure.createNodes(7, nodes)
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
        console.log(this.formStructure.getValue())
        break;
      case 'cancel':
        console.log(this.formStructure)
        this.formStructure?.reset();
        this.formStructure?.remapValues();
        break;
    }
  }
}