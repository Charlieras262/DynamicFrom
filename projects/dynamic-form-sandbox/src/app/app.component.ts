import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActionEvent, Button, Checkbox, CustomNode, DatePicker, Dropdown, FormStructure, Input, InputFile, InputPassword, OptionChild, RadioGroup, Switch, TextArea, InputNumber, AutoComplete } from 'projects/mat-dynamic-form/src/public-api';
import { InputComponent } from './input/input.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  formStructure: FormStructure;

  constructor(
    private http: HttpClient
  ) {
    this.formStructure = new FormStructure();

    this.formStructure.title = 'Sign Up';
    this.formStructure.appearance = 'standard';
    this.formStructure.globalValidators = Validators.required;
    this.formStructure.onlyScrollContent = true;
    this.formStructure.nodes = [
      new Input('name', 'Name').apply({
        icon: 'person',
        maxCharCount: 100,
        hint: 'Enter your name',
        errorMessage: "Error message"
      }),
      new Button('find', 'Find', {
        style: 'primary', type: "click", onEvent: param => {
          param.structure.getControlById('hasPet')?.setErrors({ 'error': true });
        }
      }).apply({
        icon: "search",
        singleLine: false
      }),
      new Input('tel', 'Phone Number').apply({
        icon: 'phone'
      }),
      new DatePicker('start', 'Start').apply({
        action: {
          onEvent(param) {
            const end = param.structure.getNodeById<DatePicker>('end');
            end.minDate = param.event;
          }, type: 'valueChange'
        }
      }),
      new DatePicker('end', 'End').apply({
        action: { callback: this, type: 'change' }
      }),
      new Dropdown('cStatus', 'Civil Status', [
        new OptionChild('Single', 'SI',),
        new OptionChild('Maried', 'MR')
      ]).apply({
        selectedValue: 'SI',
        hint: 'Select your civil status',
      }),
      new AutoComplete('contry', 'Contry', this.getContries()),
      new InputFile('profPic', 'Profile Picture').apply({
        accept: ['png', 'jpg', 'jpeg', 'docx', 'xlsx', 'gif', 'rar', 'zip'],
        onStatusChange: (param) => console.log(param),
      }),
      new RadioGroup('hasPet', 'Has Pet', [
        new OptionChild('Yes', 'y'),
        new OptionChild('Not', 'n'),
      ]).apply({
        selectedValue: 'n',
        action: { type: 'valueChange', onEvent: (param) => this.onHasPetValueChange(param) },
        hint: 'Do you have a pet?',
        errorMessage: 'Error message'
      }),
      new InputPassword('pass', 'Password'),
      new Switch('switch', 'Toggle Switch', false),
      new InputNumber('idNumber', 'Number').apply({
        action: { type: 'change', onEvent: (param) => console.log(param) }
      }),
      new TextArea('comments', 'Comments').apply({
        singleLine: true,
        validator: Validators.maxLength(100),
        maxCharCount: 100
      }),
      new CustomNode<InputComponent>('custom1', InputComponent, { label: 'Custom 1', placeholder: 'Custom Placeholder 1' }),
      new CustomNode<InputComponent>('custom2', InputComponent, { label: 'Custom 2', placeholder: 'Custom Placeholder 2' }),
      new Checkbox(
        'agreement',
        `I have read and agree to the terms of DynamicForm License Agreement, <strong><a href='https://www.google.com'>Read the license here.</a></strong>`,
        false
      ).apply({
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
      ]).apply({ multiple: true }),
      new Input('breed', 'Pet Breed'),
      new Input('petName', 'Pet Name')
    ]
    if (param.event == 'y') {
      this.formStructure.createNodes(7, nodes)
      param.structure.getControlById('hasPet')?.setErrors({ 'error': true });
    } else this.formStructure.removeNodes(nodes)
  }

  private getContries(): Observable<OptionChild[]> {
    return this.http.get<any[]>('https://restcountries.com/v3.1/all').pipe(
      map(item => {
        return item.map((i) => new OptionChild(i.name.common, i.cca2))
      })
    );
  }
}