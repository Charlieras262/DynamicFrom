import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import * as moment from 'moment';
import { MaterialModule } from '../material-module';
import { DateTimePicker, TimePicker } from '../models/Node';
import { SinitizeHtmlPipe } from '../pipes/sinitize-html.pipe';
import { CalendarComponent } from './calendar/calendar.component';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker.component';
import { TimePickerComponent } from './time-picker/time-picker.component';

/**
 * Apps can replace the native DateAdapter (for example with MomentDateAdapter). The date-time components must
 * not assume the adapter works with JavaScript Date objects.
 */

@Component({
  template: `
    <form [formGroup]="form">
      <mat-date-time-picker formControlName="when" [node]="node" [timePickerOnly]="timePickerOnly"></mat-date-time-picker>
    </form>`
})
class HostComponent {
  form = new FormGroup({ when: new FormControl('') });
  node: DateTimePicker = new DateTimePicker('when', 'When', null, 'dd/MM/yyyy HH:mm');
  timePickerOnly = false;
}

function configure(formats: any = MAT_MOMENT_DATE_FORMATS) {
  return TestBed.configureTestingModule({
    imports: [MaterialModule, NoopAnimationsModule, ReactiveFormsModule],
    declarations: [HostComponent, DateTimePickerComponent, CalendarComponent, TimePickerComponent, SinitizeHtmlPipe],
    providers: [
      // Same setup as an app that works with moment
      { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
      { provide: MAT_DATE_FORMATS, useValue: formats },
    ]
  }).compileComponents();
}

describe('Date components with MomentDateAdapter', () => {

  afterEach(() => TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '');

  describe('CalendarComponent', () => {
    let fixture: ComponentFixture<CalendarComponent>;

    beforeEach(async () => configure());
    afterEach(() => fixture.destroy());

    function create(config: Partial<CalendarComponent>) {
      fixture = TestBed.createComponent(CalendarComponent);
      Object.assign(fixture.componentInstance, config);
      fixture.detectChanges();
      return fixture.componentInstance;
    }

    it('renders the month and highlights today when nothing is selected', () => {
      expect(() => create({ selectedDate: null })).not.toThrow();
      expect(fixture.nativeElement.querySelector('.mat-calendar-body-initial')).not.toBeNull();
    });

    it('opens with a moment minDate and maxDate', () => {
      expect(() => create({
        selectedDate: null,
        minDate: moment().subtract(1, 'day') as any,
        maxDate: moment().add(1, 'month') as any,
      })).not.toThrow();
    });

    it('highlights today only for the current day', () => {
      const calendar = create({ selectedDate: null });
      expect(calendar.dateClass(moment() as any)).toBe('mat-calendar-body-initial');
      expect(calendar.dateClass(moment().add(1, 'day') as any)).toBe('');
    });

    it('emits the clicked day', () => {
      const calendar = create({ selectedDate: moment([2025, 2, 15]) as any });
      const clicked: any[] = [];
      calendar.dayClicked.subscribe(d => clicked.push(d));

      const cell = Array.from(fixture.nativeElement.querySelectorAll('.mat-calendar-body-cell'))
        .find((c: HTMLElement) => c.textContent.trim() === '20') as HTMLElement;
      cell.click();

      expect(clicked.length).toBe(1);
      expect(moment(clicked[0]).date()).toBe(20);
    });
  });

  describe('DateTimePickerComponent', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let overlay: HTMLElement;

    function create(setup?: (h: HostComponent) => void) {
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      setup?.(host);
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();
      overlay = TestBed.inject(OverlayContainer).getContainerElement();
    }

    afterEach(() => {
      fixture?.destroy();
      fixture?.nativeElement.remove();
    });

    function input(): HTMLInputElement {
      return fixture.nativeElement.querySelector('input');
    }

    function openPicker() {
      (fixture.nativeElement.querySelector('#whenTodayIcon') as HTMLButtonElement).click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }

    function clickDay(day: number) {
      const cell = Array.from(overlay.querySelectorAll('.mat-calendar-body-cell'))
        .find(c => c.textContent.trim() === day.toString()) as HTMLElement;
      cell.click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }

    function confirmTime() {
      const ok = Array.from(overlay.querySelectorAll('.mdf-buttons button'))
        .find(b => b.textContent.trim() === 'OK') as HTMLButtonElement;
      ok.click();
      fixture.detectChanges();
      flush();
    }

    describe('with the moment formats', () => {
      beforeEach(async () => configure());

      it('starts empty without errors', () => {
        expect(() => create()).not.toThrow();
        expect(input().value).toBe('');
      });

      it('shows a moment control value', () => {
        create(h => h.form.setValue({ when: moment([2025, 4, 6, 14, 30]) }));
        expect(input().value).toBe('06/05/2025 14:30');
      });

      it('picks a day and a time starting from an empty value', fakeAsync(() => {
        create();
        openPicker();
        expect(overlay.querySelector('mdf-calendar .mat-calendar-body-selected')).not.toBeNull();

        clickDay(15);
        expect(overlay.querySelector('mdf-time-picker form')).not.toBeNull();
        confirmTime();

        const value = host.form.value.when;
        expect(value instanceof Date).toBeTrue();
        expect(value.getDate()).toBe(15);
      }));

      it('keeps the time of a moment value when changing the day', fakeAsync(() => {
        create(h => h.form.setValue({ when: moment([2025, 4, 6, 14, 30]) }));
        openPicker();
        clickDay(20);
        confirmTime();

        const value: Date = host.form.value.when;
        expect(value.getDate()).toBe(20);
        expect(value.getHours()).toBe(14);
        expect(value.getMinutes()).toBe(30);
      }));

      it('accepts moment minDate and maxDate on the node', fakeAsync(() => {
        const min = moment().startOf('day').add(10, 'hours');
        create(h => h.node.apply(n => {
          n.minDate = min as any;
          n.maxDate = moment().add(1, 'month') as any;
        }));

        openPicker();
        clickDay(moment().date());
        expect(overlay.querySelector('mdf-time-picker form')).not.toBeNull();
        confirmTime();

        const value: Date = host.form.value.when;
        expect(value.getTime()).toBeGreaterThanOrEqual(min.valueOf());
      }));

      it('opens a time-only picker with moment limits', fakeAsync(() => {
        create(h => {
          h.node = new TimePicker('when', 'Hour', null, 'HH:mm').apply(n => {
            n.minDate = moment().startOf('day').add(8, 'hours') as any;
            n.maxDate = moment().startOf('day').add(18, 'hours') as any;
          });
          h.timePickerOnly = true;
        });

        openPicker();
        expect(overlay.querySelector('mdf-time-picker form')).not.toBeNull();
        confirmTime();
        expect((host.form.value.when as Date).getHours()).toBe(8);
      }));
    });

    describe('with a dateTimeInput format', () => {
      beforeEach(async () => configure({
        ...MAT_MOMENT_DATE_FORMATS,
        display: { ...MAT_MOMENT_DATE_FORMATS.display, dateTimeInput: 'DD/MM/YYYY HH:mm' }
      }));

      it('formats the value with the adapter', () => {
        create(h => {
          h.node = new DateTimePicker('when', 'When');
          h.form.setValue({ when: moment([2025, 4, 6, 14, 30]) });
        });
        expect(input().value).toBe('06/05/2025 14:30');
      });
    });
  });

  describe('TimePickerComponent', () => {
    let fixture: ComponentFixture<TimePickerComponent>;

    beforeEach(async () => configure());
    afterEach(() => fixture.destroy());

    it('validates hours and minutes against moment limits', () => {
      fixture = TestBed.createComponent(TimePickerComponent);
      const picker = fixture.componentInstance;
      picker.node = new DateTimePicker('dt', 'When').apply({ minDate: moment([2025, 0, 10, 13, 20]) as any });
      picker.selectedDate = new Date(2025, 0, 10, 13, 20);

      expect(() => fixture.detectChanges()).not.toThrow();
      expect(picker.isInvalidHour(12)).toBeTrue();
      expect(picker.isInvalidMinute(10)).toBeTrue();
      expect(picker.isInvalidMeridiem('AM')).toBeTrue();
    });
  });
});
