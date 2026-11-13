import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material-module';
import { SinitizeHtmlPipe } from '../../pipes/sinitize-html.pipe';
import { CalendarComponent } from '../calendar/calendar.component';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { DateTimePicker, TimePicker } from '../../models/Node';
import { DateTimePickerComponent } from './date-time-picker.component';

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

describe('DateTimePickerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let component: DateTimePickerComponent;
  let element: HTMLElement;
  let overlay: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [HostComponent, DateTimePickerComponent, CalendarComponent, TimePickerComponent, SinitizeHtmlPipe]
    }).compileComponents();
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
  });

  function create(configure?: (h: HostComponent) => void) {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    configure?.(host);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    component = fixture.debugElement.query(By.directive(DateTimePickerComponent)).componentInstance;
    element = fixture.nativeElement;
  }

  afterEach(() => {
    fixture.destroy();
    fixture.nativeElement.remove();
    overlay.innerHTML = '';
  });

  function input(): HTMLInputElement {
    return element.querySelector('input');
  }

  function openPicker() {
    (element.querySelector('#whenTodayIcon') as HTMLButtonElement).click();
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

  function clickTimeButton(label: string) {
    const button = Array.from(overlay.querySelectorAll('.mdf-buttons button'))
      .find(b => b.textContent.trim() === label) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
  }

  describe('display', () => {
    it('shows the initial value with the configured format', () => {
      create(h => h.form.setValue({ when: new Date(2025, 4, 6, 14, 30) }));
      expect(input().value).toBe('06/05/2025 14:30');
    });

    it('shows date and time when no format is configured', () => {
      create(h => {
        h.node = new DateTimePicker('when', 'When');
        h.form.setValue({ when: new Date(2025, 4, 6, 14, 30) });
      });
      expect(input().value).toMatch(/5\/6\/25|6\/5\/25|2025/);
      expect(input().value).toMatch(/2:30|14:30/);
    });

    it('shows only the time for a TimePicker without format', () => {
      create(h => {
        h.node = new TimePicker('when', 'Hour');
        h.timePickerOnly = true;
        h.form.setValue({ when: new Date(2025, 4, 6, 14, 30) });
      });
      expect(input().value).toMatch(/2:30|14:30/);
      expect(input().value).not.toMatch(/25/);
    });

    it('stays empty when the control has no value', () => {
      create();
      expect(input().value).toBe('');
      expect(host.form.value.when).toBe('');
    });

    it('updates when the control value changes from outside', () => {
      create();
      host.form.setValue({ when: new Date(2024, 0, 2, 3, 4) });
      expect(input().value).toBe('02/01/2024 03:04');
    });

    it('clears the text when the form is reset', () => {
      create(h => h.form.setValue({ when: new Date(2025, 4, 6, 14, 30) }));
      host.form.reset();
      expect(input().value).toBe('');
    });

    it('shows the time icon in time-only mode', () => {
      create(h => h.timePickerOnly = true);
      expect(element.querySelector('#whenTodayIcon mat-icon').textContent.trim()).toBe('access_time');
    });
  });

  describe('picking a date and time', () => {
    it('opens the calendar, then the time panel and saves the chosen date and time', fakeAsync(() => {
      create(h => h.form.setValue({ when: new Date(2025, 4, 6, 14, 30) }));
      openPicker();
      expect(overlay.querySelector('mdf-calendar')).not.toBeNull();

      clickDay(20);
      expect(overlay.querySelector('mdf-time-picker form')).not.toBeNull();

      clickTimeButton('OK');
      flush();
      fixture.detectChanges();

      const value: Date = host.form.value.when;
      expect(value instanceof Date).toBeTrue();
      expect(value.getDate()).toBe(20);
      expect(value.getMonth()).toBe(4);
      expect(value.getHours()).toBe(14);
      expect(value.getMinutes()).toBe(30);
      expect(input().value).toBe('20/05/2025 14:30');
      expect(overlay.querySelector('mdf-time-picker')).toBeNull();
    }));

    it('picks a date when the control starts empty', fakeAsync(() => {
      create();
      openPicker();
      clickDay(15);
      clickTimeButton('OK');
      flush();

      const value: Date = host.form.value.when;
      expect(value instanceof Date).toBeTrue();
      expect(value.getDate()).toBe(15);
    }));

    it('opens the time panel directly in time-only mode', fakeAsync(() => {
      create(h => {
        h.node = new TimePicker('when', 'Hour', null, 'HH:mm');
        h.timePickerOnly = true;
      });
      openPicker();
      expect(overlay.querySelector('mdf-calendar')).toBeNull();
      expect(overlay.querySelector('mdf-time-picker form')).not.toBeNull();
      flush();
    }));

    it('cancel keeps the previous value and closes the panel', fakeAsync(() => {
      const initial = new Date(2025, 4, 6, 14, 30);
      create(h => h.form.setValue({ when: initial }));
      openPicker();
      clickDay(20);
      clickTimeButton('Cancel');
      flush();
      fixture.detectChanges();

      expect(host.form.value.when).toBe(initial);
      expect(overlay.querySelector('mdf-time-picker')).toBeNull();
    }));

    it('can be opened again after cancelling with an empty value in time-only mode with limits', fakeAsync(() => {
      create(h => {
        h.node = new TimePicker('when', 'Hour', null, 'HH:mm').apply({ minDate: new Date(), maxDate: new Date() });
        h.timePickerOnly = true;
      });
      openPicker();
      clickTimeButton('Cancel');
      flush();

      expect(() => { openPicker(); flush(); }).not.toThrow();
      expect(overlay.querySelector('mdf-time-picker form')).not.toBeNull();
    }));

    it('closes the panel on backdrop click', fakeAsync(() => {
      create();
      openPicker();
      (overlay.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
      fixture.detectChanges();
      flush();
      expect(overlay.querySelector('mdf-calendar')).toBeNull();
    }));

    it('closes the panel even if the leave animation never runs', fakeAsync(() => {
      create();
      openPicker();
      overlay.querySelectorAll('.cdk-overlay-pane').forEach(p => (p as HTMLElement).style.animation = 'none');
      (overlay.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
      tick(1000);
      fixture.detectChanges();
      expect(overlay.querySelector('mdf-calendar')).toBeNull();
    }));
  });

  describe('typing', () => {
    it('accepts a typed date', () => {
      create();
      input().value = '2025-03-04T10:20';
      input().dispatchEvent(new Event('change'));

      const value: Date = host.form.value.when;
      expect(value.getFullYear()).toBe(2025);
      expect(value.getHours()).toBe(10);
    });

    it('marks an invalid typed date as an error', () => {
      create();
      input().value = 'not a date';
      input().dispatchEvent(new Event('input'));
      input().dispatchEvent(new Event('change'));
      expect(component.internalControl.hasError('invalidDate')).toBeTrue();
    });

    it('clears the value when the text is deleted', () => {
      create(h => h.form.setValue({ when: new Date(2025, 4, 6, 14, 30) }));
      input().value = '';
      input().dispatchEvent(new Event('input'));
      expect(() => input().dispatchEvent(new Event('change'))).not.toThrow();
      expect(host.form.value.when).toBeNull();
    });
  });

  describe('validation', () => {
    it('shows the node error message when the outer control is invalid', () => {
      create(h => {
        h.node.errorMessage = 'Required date';
        h.form.get('when').setValidators(Validators.required);
      });
      host.form.get('when').updateValueAndValidity();
      fixture.detectChanges();

      expect(component.internalControl.invalid).toBeTrue();
      expect(element.querySelector('mat-error').textContent).toContain('Required date');
    });
  });
});
