import { Component, Input, OnInit, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { DateTimePicker } from '../../models/Node';

@Component({
  selector: 'mat-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})
export class DateTimePickerComponent implements OnInit, ControlValueAccessor {

  control!: FormControl;
  controlName: string = "file";

  @Input() node!: DateTimePicker;
  @Input() appearance: string = 'stardard';

  constructor(
    @Self() @Optional() private ngControl: NgControl
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    if (!this.control) {
      this.control = this.ngControl.control as FormControl;
    }

    if (!this.control && this.ngControl.control) {
      this.control = this.ngControl.control as FormControl;
    }

    this.controlName = this.ngControl?.name as string ?? Date.now().toString();
  }

  getControl(): FormControl {
    return this.control;
  }

  showDatePicker() {
    
  }

  registerOnChange(_: any): void { }
  writeValue(_: any) { }
  registerOnTouched(_: any) { }
}
