import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDynamicFormModule } from '../../mat-dynamic-form.module';
import { DateTimePicker } from '../../models/Node';
import { TimePickerComponent } from './time-picker.component';

describe('TimePickerComponent clock and limits', () => {
  let fixture: ComponentFixture<TimePickerComponent>;
  let component: TimePickerComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MatDynamicFormModule, NoopAnimationsModule] }).compileComponents();
  });

  function create(selectedDate: Date, node: DateTimePicker = new DateTimePicker('dt', 'When').apply({ showClockPicker: true })) {
    fixture = TestBed.createComponent(TimePickerComponent);
    component = fixture.componentInstance;
    component.node = node;
    component.selectedDate = selectedDate;
    fixture.detectChanges();
    element = fixture.nativeElement;
    document.body.appendChild(element);
  }

  afterEach(() => {
    fixture.destroy();
    element.remove();
  });

  function clock(): HTMLElement {
    return element.querySelector('.mdf-time-clock') as HTMLElement;
  }

  /** Mouse event at the given angle (0 = 12 o'clock, clockwise) from the clock center. */
  function at(type: string, degrees: number, target: Element = clock()): MouseEvent {
    const rect = clock().getBoundingClientRect();
    const radians = (degrees - 90) * Math.PI / 180;
    const event = new MouseEvent(type, {
      bubbles: true,
      clientX: rect.left + rect.width / 2 + Math.cos(radians) * 80,
      clientY: rect.top + rect.height / 2 + Math.sin(radians) * 80,
    });
    target.dispatchEvent(event);
    return event;
  }

  function value() {
    return component.internalFormGroup.value;
  }

  it('dragging on the clock selects the hour under the pointer', fakeAsync(() => {
    create(new Date(2025, 0, 10, 9, 0));
    at('mousedown', 0);
    at('mousemove', 90);                 // 3 o'clock
    expect(component.isDragging).toBeTrue();
    expect(value().hours).toBe('03');

    at('mouseup', 90);
    flush();
    expect(component.isDragging).toBeFalse();
  }));

  it('dragging in minute mode selects the minute under the pointer', fakeAsync(() => {
    create(new Date(2025, 0, 10, 9, 0));
    component.activePart = 'minute';
    fixture.detectChanges();

    at('mousedown', 0);
    at('mousemove', 180);                // 30 minutes
    expect(value().minutes).toBe('30');
    at('mouseup', 180);
    flush();
  }));

  it('ignores moves without a pressed button and small moves while pressed', fakeAsync(() => {
    create(new Date(2025, 0, 10, 9, 0));
    at('mousemove', 90);
    expect(value().hours).toBe('09');

    const down = at('mousedown', 0);
    clock().dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: down.clientX + 2, clientY: down.clientY + 2 }));
    expect(component.isDragging).toBeFalse();
    at('mouseup', 0);
    flush();
  }));

  it('releases the drag when a move happens outside the clock', fakeAsync(() => {
    create(new Date(2025, 0, 10, 9, 0));
    at('mousedown', 0);
    const outside = element.querySelector('.mdf-overlay-footer') as HTMLElement;
    component.onMouseMove({ clientX: 0, clientY: 0, target: outside, stopPropagation: () => { } } as any);

    at('mousemove', 90);
    expect(value().hours).toBe('09');
    flush();
  }));

  it('accepts typed single-digit minutes after the first digit', () => {
    create(new Date(2025, 0, 10, 9, 0));
    const minute = element.querySelector('.minute input') as HTMLInputElement;
    minute.value = '7';
    component.justNumbers({ target: minute } as any, 'M');
    expect(value().minutes).toBe('07');

    const hour = element.querySelector('.hour input') as HTMLInputElement;
    hour.value = '5';
    component.justNumbers({ target: hour } as any, 'H');
    expect(value().hours).toBe('05');
  });

  describe('maxDate on the same day', () => {
    const max = new Date(2025, 0, 10, 9, 30);

    it('marks later hours, minutes and PM as invalid', () => {
      create(new Date(2025, 0, 10, 9, 0), new DateTimePicker('dt', 'When').apply({ maxDate: max }));
      expect(component.isInvalidHour(10)).toBeTrue();
      expect(component.isInvalidHour(8)).toBeFalse();
      expect(component.isInvalidMinute(45)).toBeTrue();
      expect(component.isInvalidMinute(15)).toBeFalse();
      expect(component.isInvalidMeridiem('PM')).toBeTrue();
      expect(component.isInvalidMeridiem('AM')).toBeFalse();
    });

    it('cannot switch to PM past the limit', () => {
      create(new Date(2025, 0, 10, 9, 0), new DateTimePicker('dt', 'When').apply({ maxDate: max }));
      component.setAMPM(false);
      expect(value().meridiem).toBe('AM');
      expect(value().hours).toBe('09');
      expect(value().minutes).toBe('30');
    });
  });

  it('rotates the minute hand through the shortest path', () => {
    create(new Date(2025, 0, 10, 9, 55));
    component.activePart = 'minute';
    expect(component.getHandTransform()).toContain('rotate(-30deg)');   // 55 min, reached going back from 0
    component.selectMinute(5);
    expect(component.getHandTransform()).toContain('rotate(30deg)');    // forward 60deg, not back 300deg
  });
});
