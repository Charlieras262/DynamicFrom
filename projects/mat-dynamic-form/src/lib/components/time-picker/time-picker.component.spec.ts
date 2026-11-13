import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDynamicFormModule } from '../../mat-dynamic-form.module';
import { DateTimePicker, TimePicker } from '../../models/Node';
import { TimePickerComponent } from './time-picker.component';

describe('TimePickerComponent', () => {
  let fixture: ComponentFixture<TimePickerComponent>;
  let component: TimePickerComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDynamicFormModule, NoopAnimationsModule]
    }).compileComponents();
  });

  function create(selectedDate: Date | null, node: DateTimePicker = new DateTimePicker('dt', 'When'), timePickerOnly = false) {
    fixture = TestBed.createComponent(TimePickerComponent);
    component = fixture.componentInstance;
    component.node = node;
    component.selectedDate = selectedDate;
    component.timePickerOnly = timePickerOnly;
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  afterEach(() => fixture.destroy());

  function value() {
    return component.internalFormGroup.value;
  }

  it('starts with the time of the selected date in 12h format', () => {
    create(new Date(2025, 0, 10, 15, 5));
    expect(value()).toEqual({ hours: '03', minutes: '05', meridiem: 'PM' });
    expect(element.querySelector('.mdf-pm').classList).toContain('selected');
  });

  it('starts at 12:00 AM for midnight', () => {
    create(new Date(2025, 0, 10, 0, 0));
    expect(value()).toEqual({ hours: '12', minutes: '00', meridiem: 'AM' });
  });

  it('renders nothing without a selected date', () => {
    create(null);
    expect(element.querySelector('form')).toBeNull();
  });

  it('does not fail without a selected date in time-only mode with limits', () => {
    const node = new TimePicker('t', 'Time').apply({ minDate: new Date(), maxDate: new Date() });
    expect(() => create(null, node, true)).not.toThrow();
  });

  it('confirm emits the selected date with the chosen time and a confirm close request', () => {
    create(new Date(2025, 0, 10, 9, 0));
    const emitted: Date[] = [];
    const closes: string[] = [];
    component.selectedDateChange.subscribe(d => emitted.push(d));
    component.onCloseRequest.subscribe(r => closes.push(r));

    component.selectHour(4);
    component.selectMinute(30);
    component.setAMPM(false);
    component.confirm();

    expect(closes).toEqual(['confirm']);
    expect(emitted.length).toBe(1);
    expect(emitted[0].getFullYear()).toBe(2025);
    expect(emitted[0].getDate()).toBe(10);
    expect(emitted[0].getHours()).toBe(16);
    expect(emitted[0].getMinutes()).toBe(30);
  });

  it('cancel button emits a cancel close request without changing the date', () => {
    create(new Date(2025, 0, 10, 9, 0));
    const emitted = jasmine.createSpy('selectedDateChange');
    const closes: string[] = [];
    component.selectedDateChange.subscribe(emitted);
    component.onCloseRequest.subscribe(r => closes.push(r));

    const cancel = Array.from(element.querySelectorAll('.mdf-buttons button'))
      .find(b => b.textContent.trim() === 'Cancel') as HTMLButtonElement;
    cancel.click();

    expect(closes).toEqual(['cancel']);
    expect(emitted).not.toHaveBeenCalled();
  });

  it('uses the configured labels', () => {
    create(new Date(), new DateTimePicker('dt', 'When').apply({ acceptLabel: 'Aceptar', cancelLabel: 'Cancelar', enterTimeLabel: 'Hora' }));
    expect(element.textContent).toContain('Aceptar');
    expect(element.textContent).toContain('Cancelar');
    expect(element.textContent).toContain('Hora');
  });

  describe('typed values', () => {
    function typeIn(selector: string, text: string, kind: 'H' | 'M') {
      const input = element.querySelector(selector) as HTMLInputElement;
      input.value = text;
      component.justNumbers({ target: input } as any, kind);
    }

    it('clamps hours to 1..12', () => {
      create(new Date(2025, 0, 10, 9, 0));
      typeIn('.hour input', '15', 'H');
      expect(value().hours).toBe('12');
      typeIn('.hour input', '00', 'H');
      expect(value().hours).toBe('01');
    });

    it('clamps minutes to 0..59', () => {
      create(new Date(2025, 0, 10, 9, 0));
      typeIn('.minute input', '75', 'M');
      expect(value().minutes).toBe('59');
    });

    it('waits for a second digit when the first one can still be completed', () => {
      create(new Date(2025, 0, 10, 9, 0));
      typeIn('.hour input', '1', 'H');
      expect(value().hours).toBe('09');
    });
  });

  describe('min and max limits', () => {
    it('moves the time up to minDate', () => {
      const min = new Date(2025, 0, 10, 10, 30);
      create(new Date(2025, 0, 10, 10, 30), new DateTimePicker('dt', 'When').apply({ minDate: min }));

      component.selectHour(8);
      expect(value()).toEqual({ hours: '10', minutes: '30', meridiem: 'AM' });
    });

    it('moves the time down to maxDate', () => {
      const max = new Date(2025, 0, 10, 14, 0);
      create(new Date(2025, 0, 10, 12, 0), new DateTimePicker('dt', 'When').apply({ maxDate: max }));

      component.selectHour(5);
      component.setAMPM(false);
      expect(value()).toEqual({ hours: '02', minutes: '00', meridiem: 'PM' });
    });

    it('marks hours, minutes and meridiem outside the limits as invalid', () => {
      const min = new Date(2025, 0, 10, 13, 20);
      create(new Date(2025, 0, 10, 13, 20), new DateTimePicker('dt', 'When').apply({ minDate: min }));

      expect(component.isInvalidMeridiem('AM')).toBeTrue();
      expect(component.isInvalidMeridiem('PM')).toBeFalse();
      expect(component.isInvalidHour(12)).toBeTrue();
      expect(component.isInvalidHour(2)).toBeFalse();
      expect(component.isInvalidMinute(10)).toBeTrue();
      expect(component.isInvalidMinute(25)).toBeFalse();
    });

    it('does not limit other days', () => {
      const min = new Date(2025, 0, 10, 13, 20);
      create(new Date(2025, 0, 11, 8, 0), new DateTimePicker('dt', 'When').apply({ minDate: min }));
      expect(component.isInvalidHour(1)).toBeFalse();
      expect(component.isInvalidMinute(0)).toBeFalse();
    });
  });

  describe('clock', () => {
    it('opens and closes the clock face', fakeAsync(() => {
      create(new Date(2025, 0, 10, 9, 0));
      expect(element.querySelector('.mdf-time-clock')).toBeNull();
      const initialHeight = component.getHeight();

      component.showClock();
      tick(150);
      fixture.detectChanges();
      expect(element.querySelector('.mdf-time-clock')).not.toBeNull();
      expect(element.querySelectorAll('.numbers.hour span').length).toBe(12);
      expect(component.getLabel()).toBe('Select Time');
      expect(component.getHeight()).not.toBe(initialHeight);

      component.showClock();
      fixture.detectChanges();
      tick(230);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(element.querySelector('.mdf-time-clock')).toBeNull();
      expect(component.getHeight()).toBe(initialHeight);
    }));

    it('starts with the clock open when showClockPicker is true', () => {
      create(new Date(2025, 0, 10, 9, 0), new DateTimePicker('dt', 'When').apply({ showClockPicker: true }));
      expect(element.querySelector('.mdf-time-clock')).not.toBeNull();
    });

    it('clicking a number on the clock selects that hour', () => {
      create(new Date(2025, 0, 10, 9, 0), new DateTimePicker('dt', 'When').apply({ showClockPicker: true }));
      const three = Array.from(element.querySelectorAll('.numbers.hour span')).find(s => s.textContent.trim() === '3') as HTMLElement;
      three.click();
      expect(value().hours).toBe('03');
    });

    it('rotates the hand through the shortest path', () => {
      create(new Date(2025, 0, 10, 11, 0));
      component.getHandTransform();
      component.selectHour(1);
      expect(component.getHandTransform()).toContain('rotate(30deg)');
    });
  });

  it('uses the landscape layout when configured', () => {
    create(new Date(), new DateTimePicker('dt', 'When').apply({ orientation: 'landscape' }));
    expect(element.querySelector('.mdf-time-picker-landscape')).not.toBeNull();
  });
});
