import { Component, ElementRef, Inject, Input, LOCALE_ID, OnInit, Optional, Self, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { DateTimePicker } from '../../models/Node';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
  selector: 'mat-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None
})
export class DateTimePickerComponent implements OnInit, ControlValueAccessor {

  @Input() node!: DateTimePicker;
  @Input() appearance: string = 'standard';
  @Input() timePickerOnly: boolean = false;

  @ViewChild('matDFCalendar') calendar!: CalendarComponent;
  @ViewChild('calendarPanel') calendarPanel!: TemplateRef<any>;
  @ViewChild('timePanel') timePanel!: TemplateRef<any>;

  control!: FormControl;
  readonly internalControl: FormControl = new FormControl();

  selectedDate: Date | null = null;

  private onChangeFn: (value: any) => void = () => { };
  private onTouchedFn: () => void = () => { };
  private calendarOverlayRef!: OverlayRef | null;
  private timeOverlayRef!: OverlayRef | null;

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
        const date = new Date(this.control.value);

        this.internalControl.setValue(this.formatDateTime(date));
        this.selectedDate = date;
      } else {
        const date = this.dateAdapter.createDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        date.setHours(0, 0, 0, 0);
        this.internalControl.setValue(this.formatDateTime(date));
        this.selectedDate = date;
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

  showDatePicker(type: 'date' | 'time') {
    const show = () => {
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

      if (type === 'date') {
        this.calendarOverlayRef = this.overlay.create({
          positionStrategy,
          scrollStrategy: this.overlay.scrollStrategies.close(),
          hasBackdrop: true,
          backdropClass: 'cdk-overlay-transparent-backdrop'
        });
      } else {
        this.timeOverlayRef = this.overlay.create({
          positionStrategy,
          scrollStrategy: this.overlay.scrollStrategies.close(),
          hasBackdrop: true,
          backdropClass: 'cdk-overlay-transparent-backdrop'
        });
      }

      const portal = new TemplatePortal(type === 'date' ? this.calendarPanel : this.timePanel, this.viewContainerRef);
      const overlayRef = type === 'date' ? this.calendarOverlayRef : this.timeOverlayRef;

      positionStrategy.positionChanges.subscribe(change => {
        const overlayEl = overlayRef?.overlayElement;
        if (!overlayEl) return;

        overlayEl.classList.remove('mdf-from-top', 'mdf-from-bottom', 'mdf-enter', 'mdf-leave');

        if (change.connectionPair.originY === 'bottom') {
          overlayEl?.classList.add('mdf-from-top', 'mdf-enter');
        } else {
          overlayEl?.classList.add('mdf-from-bottom', 'mdf-enter');
        }
      });
      overlayRef.attach(portal);
      overlayRef.backdropClick().subscribe(() => this.close(type, 'cancel'));

      setTimeout(() => {
        if (type === 'date' && this.selectedDate) this.calendar.activeDate = this.selectedDate;
      });

      document.getElementById(`${this.node.id}TodayIcon`).classList.add('active');
    }

    if (this.calendarOverlayRef || this.timeOverlayRef) {
      this.close();
      return show();
    }

    show();
  }

  onDateChange(date: Date) {
    this.selectedDate = date;

    this.showDatePicker('time');
  }

  onTimeSelected(selectedDate: Date) {
    this.internalControl.setValue(this.formatDateTime(selectedDate));
    this.onChangeFn(selectedDate);
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

  onHeightUpdated() {
    this.timeOverlayRef?.updatePosition();
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  writeValue(_: any): void {
    if (_?.toString()?.length <= 0) return;
    this.internalControl.setValue(this.formatDateTime(_));
  }

  private close(type: 'date' | 'time' | 'all' = 'all', result: 'confirm' | 'cancel' = 'confirm') {
    if (result === 'cancel') {
      this.selectedDate = this.control.value ? new Date(this.control.value) : null;
    }
    if (type === 'all') {
      this.close('date');
      this.close('time');
      return;
    }

    const overlayRef = type === 'date' ? this.calendarOverlayRef : this.timeOverlayRef;
    const element = overlayRef?.overlayElement;
    element?.classList.remove('mdf-enter');
    element?.classList.add('mdf-leave');

    element?.addEventListener('animationend', () => {
      overlayRef?.detach();
      overlayRef?.dispose();
      if (type === 'date') {
        this.calendarOverlayRef = null;
      } else {
        this.timeOverlayRef = null;
      }
    }, { once: true });

    document.getElementById(`${this.node.id}TodayIcon`).classList.remove('active');
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
