import { Component, ElementRef, Inject, Input, LOCALE_ID, OnInit, Optional, Self, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NgControl } from '@angular/forms';
import { DateTimePicker } from '../../models/Node';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { to12HourFormat, to24HourFormat } from '../../utils/date-utils';

@Component({
  selector: 'mat-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [DatePipe]
})
export class DateTimePickerComponent implements OnInit, ControlValueAccessor {

  @Input() node!: DateTimePicker;
  @Input() appearance: string = 'standard';

  @ViewChild('calendarPanel') calendarPanel!: TemplateRef<any>;

  control!: FormControl;
  readonly internalControl: FormControl = new FormControl();
  readonly internalFormGroup: FormGroup;

  activePart: 'hour' | 'minute' | null = null;
  selectedDate: Date = new Date();

  setAMPM(am: boolean) {
    this.internalFormGroup.patchValue({
      meridiem: am ? 'AM' : 'PM'
    });
  }

  private onChangeFn: (value: any) => void = () => { };
  private onTouchedFn: () => void = () => { };
  private overlayRef!: OverlayRef | null;

  constructor(
    @Self() @Optional() private ngControl: NgControl,
    private datePipe: DatePipe,
    @Inject(LOCALE_ID) private locale: string,
    @Inject(MAT_DATE_FORMATS) private dateFormats: any,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private elementRef: ElementRef,
    private dateAdapter: DateAdapter<any>
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.internalFormGroup = new FormGroup({
      hours: new FormControl("00"),
      minutes: new FormControl("00"),
      meridiem: new FormControl("AM"),
    });
  }

  ngOnInit() {
    if (!this.control && this.ngControl?.control) {
      this.control = this.ngControl.control as FormControl;

      if (this.control.value) {
        const date = new Date(this.control.value);
        const _12Hour = to12HourFormat(date.getHours());

        this.internalControl.setValue(this.formatDateTime(date));
        this.internalFormGroup.setValue({
          hours: _12Hour.hour12.toString().padStart(2, '0'),
          minutes: date.getMinutes().toString().padStart(2, '0'),
          meridiem: _12Hour.meridiem,
        });
      }

      this.control.statusChanges.subscribe(status => {
        if (this.internalControl.errors == this.control.errors) return;
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
        if (this.control.errors == this.internalControl.errors) return;
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

  showDatePicker() {
    if (this.overlayRef) {
      this.close();
      return;
    }

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.elementRef.nativeElement)
      .withFlexibleDimensions(true)
      .withPush(true)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 8
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetY: -8
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    const portal = new TemplatePortal(this.calendarPanel, this.viewContainerRef);

    positionStrategy.positionChanges.subscribe(change => {
      const overlayEl = this.overlayRef?.overlayElement;
      const element = document.getElementById(`${this.node.id}DateTimePicker`);
      if (!overlayEl) return;

      overlayEl.classList.remove('from-top', 'from-bottom', 'enter', 'leave');

      if (change.connectionPair.originY === 'bottom') {
        element?.classList.add('from-top', 'enter');
      } else {
        element?.classList.add('from-bottom', 'enter');
      }
    });
    this.overlayRef.attach(portal);
    this.overlayRef.backdropClick().subscribe(() => this.close());

    document.getElementById(`${this.node.id}TodayIcon`).classList.add('active');
  }

  close() {
    const element = document.getElementById(`${this.node.id}DateTimePicker`);
    element?.classList.remove('enter');
    element?.classList.add('leave');

    element?.addEventListener('animationend', () => {
      this.overlayRef?.detach();
      this.overlayRef?.dispose();
      this.overlayRef = null;
    }, { once: true });

    document.getElementById(`${this.node.id}TodayIcon`).classList.remove('active');
  }

  onDateChange(date: Date) {
    this.selectedDate = date;
  }

  confirm() {
    const date = new Date(this.selectedDate);
    const _24Hour = +to24HourFormat(+this.internalFormGroup.value.hours, this.internalFormGroup.value.meridiem);

    date.setHours(_24Hour, this.internalFormGroup.value.minutes);
    this.internalControl.setValue(this.formatDateTime(date));
    this.onChangeFn(date);
    this.close();
  }

  processChange(event: any) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value ? new Date(input.value) : null;

    if (!newValue.getDate()) {
      this.setErrorState(true);
      return;
    }

    this.onChangeFn(newValue);
    this.onTouchedFn();
  }

  justNumbers(event: Event, type: 'H' | 'M') {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    const valueNum = +value;

    // Validate range
    if (type === 'H') {
      if (valueNum > 12) value = '12';
      else if (valueNum === 0) value = '01';
      else value = valueNum.toString();
    } else {
      if (valueNum > 59) value = '59';
      else value = valueNum.toString();
    }

    input.value = value.padStart(2, '0');
    this.internalFormGroup.patchValue({
      [type === 'H' ? 'hours' : 'minutes']: input.value
    });
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

  private formatDateTime(date: Date): string {
    return this.node.dateFormat ? this.datePipe.transform(date, this.node.dateFormat, this.locale) : this.dateAdapter.format(date, this.dateFormats.display.dateTimeInput);
  }

  private setErrorState(hasError: boolean) {
    if (hasError) {
      this.internalControl.setErrors({ invalidDate: true });
    } else {
      this.internalControl.setErrors(null);
    }
  }
}
