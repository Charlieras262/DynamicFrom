import { AfterViewInit, Component, ElementRef, Inject, Input, LOCALE_ID, OnInit, Optional, Self, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { DateTimePicker } from '../../models/Node';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'mat-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [DatePipe]
})
export class DateTimePickerComponent implements OnInit, AfterViewInit, ControlValueAccessor {

  @Input() node!: DateTimePicker;
  @Input() appearance: string = 'standard';
  @Input() dateFormat?: string;

  @ViewChild('calendarPanel') calendarPanel!: TemplateRef<any>;

  control!: FormControl;
  internalControl: FormControl = new FormControl();

  formattedValue?: string;

  hour: string = '07';
  minute: string = '00';
  isAM: boolean = true;
  activePart: 'hour' | 'minute' | null = null;

  setAMPM(am: boolean) {
    this.isAM = am;
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
  }

  ngOnInit() {
    if (!this.control && this.ngControl?.control) {
      this.control = this.ngControl.control as FormControl;

      if (this.control.value) {
        this.formattedValue = this.formatDateTime(new Date(this.control.value));
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
    if (this.overlayRef) {
      this.close();
      return;
    }

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.elementRef.nativeElement)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 8
        }
      ])
      .withFlexibleDimensions(false)
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    this.overlayRef.backdropClick().subscribe(() => this.close());

    const portal = new TemplatePortal(this.calendarPanel, this.viewContainerRef);
    this.overlayRef.attach(portal);
  }

  close() {
    this.overlayRef?.detach();
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  onDateChange(date: Date) {
    //this.selectedDate = date;
  }

  confirm() {
    /* const date = new Date(this.selectedDate);
    date.setHours(this.hours, this.minutes, this.seconds);
    this.formattedDate = this.dateAdapter.format(date, 'MMM d, y, HH:mm:ss'); */
    this.close();
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
    this.dateAdapter.setLocale(this.locale);
    return this.dateFormat ? this.datePipe.transform(date, this.dateFormat, this.locale) : this.dateAdapter.format(date, this.dateFormats.display.dateTimeInput);
  }

  private setErrorState(hasError: boolean) {
    if (hasError) {
      this.internalControl.setErrors({ invalidDate: true });
    } else {
      this.internalControl.setErrors(null);
    }
  }
}
