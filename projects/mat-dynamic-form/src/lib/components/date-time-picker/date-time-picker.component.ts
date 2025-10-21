import { AfterViewInit, Component, Inject, Input, LOCALE_ID, OnInit, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { DateTimePicker } from '../../models/Node';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

@Component({
  selector: 'mat-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [DatePipe]
})
export class DateTimePickerComponent implements OnInit, AfterViewInit, ControlValueAccessor {

  @Input() node!: DateTimePicker;
  @Input() appearance: string = 'standard';
  @Input() dateFormat: string = 'yyyy-MM-dd HH:mm';

  control!: FormControl;
  internalControl: FormControl = new FormControl();

  formattedValue?: string;

  private onChangeFn: (value: any) => void = () => { };
  private onTouchedFn: () => void = () => { };

  constructor(
    @Self() @Optional() private ngControl: NgControl,
    private datePipe: DatePipe,
    @Inject(LOCALE_ID) private locale: string,
    @Inject(MAT_DATE_FORMATS) private dateFormats: any,
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    if (!this.control && this.ngControl?.control) {
      this.control = this.ngControl.control as FormControl;

      if (this.control.value) {
        this.formattedValue = this.formatDateTime(new Date(this.control.value));
      }

      this.control.statusChanges.subscribe(status => {
        if(this.internalControl.errors == this.control.errors) return;
        if (status === 'INVALID') {
          this.internalControl.setErrors(this.control.errors);
          this.internalControl.markAsTouched();
          this.internalControl.markAsDirty();
        } else {
          this.internalControl.setErrors(null);
          this.internalControl.markAsPristine();
          this.internalControl.markAsUntouched();
          this.internalControl.updateValueAndValidity();
        }
      });

      this.internalControl.statusChanges.subscribe(status => {
        if(this.control.errors == this.internalControl.errors) return;
        if (status === 'INVALID') {
          this.control.setErrors(this.internalControl.errors)
          this.control.markAsTouched();
          this.control.markAsDirty();
        } else {
          this.control.setErrors(null);
          this.control.markAsPristine();
          this.control.markAsUntouched();
          this.control.updateValueAndValidity();
        }
      });
    }
  }

  ngAfterViewInit() {
    const dateInput = document.getElementById(`${this.node.id}Date`) as HTMLInputElement;
    const facadeInput = document.getElementById(`${this.node.id}`) as HTMLInputElement;

    if (!dateInput || !facadeInput) return;

    dateInput.value = this.control.value ? this.toInputValue(new Date(this.control.value)) : '';

    dateInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const newValue = target.value ? new Date(target.value) : null;

      this.onChangeFn(newValue);
      this.onTouchedFn();
      this.internalControl.setValue(newValue ? this.formatDateTime(newValue) : '');

      this.formattedValue = newValue ? this.formatDateTime(newValue) : '';
    });
  }

  showDatePicker() {
    const dateInput = document.getElementById(`${this.node.id}Date`) as any;
    dateInput?.showPicker?.() ?? dateInput?.click();
  }

  processChange(event: any) {
    const dateInput = document.getElementById(`${this.node.id}Date`) as HTMLInputElement;

    try {
      dateInput.value = this.toInputValue(new Date(event.target.value));
      this.onChangeFn(new Date(event.target.value));
    } catch (error) {
      console.error('Invalid date format', error);
      this.setErrorState(true);
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  writeValue(_: any): void { 
    this.internalControl.setValue(this.formatDateTime(new Date(_)));
  }

  private toInputValue(date: Date): string {
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  }

  private formatDateTime(date: Date): string {
    return this.datePipe.transform(date, this.dateFormat || this.dateFormats.display.dateTimeInput, this.locale) || '';
  }

  private setErrorState(hasError: boolean) {
    if (hasError) {
      this.internalControl.setErrors({ invalidDate: true });
    } else {
      this.internalControl.setErrors(null);
    }
  }
}
