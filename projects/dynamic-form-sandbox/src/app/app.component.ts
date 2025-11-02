import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActionEvent, Button, Checkbox, CustomNode, DatePicker, Dropdown, FormStructure, Input, InputFile, InputPassword, OptionChild, RadioGroup, Switch, TextArea, InputNumber, AutoComplete, SelectableNode, DateRangePicker, DateTimePicker } from 'projects/mat-dynamic-form/src/public-api';
import { InputComponent } from './input/input.component';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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
          console.log(param.structure.getControlById('contry')?.value);
        }
      }).apply({
        icon: "search",
        validateForm: false,
        disabled: false,
        validation: (param) => {
          return param.structure.getControlById('name')?.value?.length > 0;
        }
      }),
      new Checkbox('subscribe', 'Subscribe to newsletter', true).apply({
        hint: 'Select if you want to receive our newsletter'
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
      new AutoComplete('contry', 'Contry', this.getContries()).apply({ hint: "This is a hint for the country field", selectedValue: 'gb' }).apply({
        action: { onEvent: (param) => console.log(param), type: 'valueChange' },
      }),
      new InputFile('profPic', 'Profile Picture').apply({
        accept: ['png'],
        onStatusChange: (param) => console.log(param),
        filename: 'MyFile',
        maxSize: 100,
        hint: 'Select your profile picture',
        errorMessage: 'File selected is not valid',
        dragLabel: 'File Drag & Drop here',
        downloadHint: 'Download the file',
        removeHint: 'Remove the file',
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
      new DateRangePicker('dateRange', 'Date Range').apply({
        minDate: new Date(),
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      }),
      new DateTimePicker('appointment', 'Appointment', null, 'dd/MM/yyyy hh:mm a').apply({
        value: new Date(),
        minDate: new Date(),
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        orientation: 'landscape',
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
        `I have read and agree to the terms of DynamicForm License Agreement, <strong><a href='https://www.google.com' class="primary">Read the license here.</a></strong>`,
        false
      ).apply({
      }),
      new CustomNode<InputComponent>('custom3', InputComponent, { label: 'Custom 3', placeholder: 'Custom Placeholder 2' }),
    ];
    this.formStructure.validateActions = [
      new Button('delete', 'Delete', {
        onEvent: (param) => {
          param.structure?.reset();
          param.structure?.remapValues();
        }, style: 'warn'
      }).apply({
        icon: 'delete'
      }),
      new Button('cancel', 'Cancel', {
        onEvent: (param) => {
          param.structure?.reset();
          param.structure?.remapValues();
        }, style: 'warn'
      }).apply({
        icon: 'close'
      }),
      new Button('back', 'Preview', {
        onEvent: (param) => {
          console.log(param.structure?.getValue<any>());
          const control = param.structure?.getControlById('appointment');
          control?.setErrors({ error: true })
        }, style: 'primary',
      }).apply({
        disabled: false,
        icon: 'visibility'
      }),
      new Button('save', 'Save', { style: 'primary' }).apply({
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
      this.formStructure.createNodes(9, nodes)
      param.structure.getControlById('hasPet')?.setErrors({ 'error': true });
    } else this.formStructure.removeNodes(nodes)
  }

  private getContries(): Observable<OptionChild[]> {
    return this.http.get<any[]>('https://restcountries.com/v3.1/all?fields=name,flags,cca2').pipe(
      map(item => {
        return item.map((i) => new OptionChild(i.name.common, i.cca2))
      })
    );
  }
}