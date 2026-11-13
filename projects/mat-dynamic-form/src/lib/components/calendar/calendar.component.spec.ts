import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDynamicFormModule } from '../../mat-dynamic-form.module';
import { CalendarComponent } from './calendar.component';

describe('CalendarComponent', () => {
  let fixture: ComponentFixture<CalendarComponent>;
  let component: CalendarComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDynamicFormModule, NoopAnimationsModule]
    }).compileComponents();
  });

  function create(config: Partial<CalendarComponent> = {}) {
    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    Object.assign(component, config);
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  afterEach(() => fixture.destroy());

  function cell(day: number): HTMLElement {
    return Array.from(element.querySelectorAll('.mat-calendar-body-cell'))
      .find(c => c.textContent.trim() === day.toString()) as HTMLElement;
  }

  it('shows the month of the selected date', () => {
    create({ selectedDate: new Date(2025, 2, 15) });
    expect(element.querySelector('.mat-calendar-body-selected').textContent.trim()).toBe('15');
  });

  it('emits dateChange and dayClicked with the clicked day', () => {
    create({ selectedDate: new Date(2025, 2, 15) });
    const changed: Date[] = [];
    const clicked: Date[] = [];
    component.dateChange.subscribe(d => changed.push(d));
    component.dayClicked.subscribe(d => clicked.push(d));

    cell(20).click();

    expect(changed.length).toBe(1);
    expect(changed[0].getDate()).toBe(20);
    expect(clicked.length).toBe(1);
    expect(clicked[0].getDate()).toBe(20);
  });

  it('emits dayClicked when clicking the already selected day', () => {
    create({ selectedDate: new Date(2025, 2, 15) });
    const clicked: Date[] = [];
    component.dayClicked.subscribe(d => clicked.push(d));

    cell(15).click();
    expect(clicked.length).toBe(1);
    expect(clicked[0].getDate()).toBe(15);
  });

  it('does not emit dayClicked for days outside min/max', () => {
    create({ selectedDate: new Date(2025, 2, 15), minDate: new Date(2025, 2, 10) });
    const clicked = jasmine.createSpy('dayClicked');
    component.dayClicked.subscribe(clicked);

    cell(5).click();
    expect(clicked).not.toHaveBeenCalled();
  });

  it('does not emit dayClicked when choosing a month or a year', () => {
    create({ selectedDate: new Date(2025, 2, 15) });
    const clicked = jasmine.createSpy('dayClicked');
    component.dayClicked.subscribe(clicked);

    component.calendar.currentView = 'year';
    fixture.detectChanges();
    (element.querySelector('.mat-calendar-body-cell') as HTMLElement).click();
    fixture.detectChanges();

    expect(component.calendar.currentView).toBe('month');
    expect(clicked).not.toHaveBeenCalled();
  });

  it('activeDate moves the calendar to the given month', () => {
    create({ selectedDate: new Date(2025, 2, 15) });
    component.activeDate = new Date(2026, 6, 1);
    expect(component.activeDate.getMonth()).toBe(6);
    expect(component.activeDate.getFullYear()).toBe(2026);
  });

  it('highlights today only when nothing is selected', () => {
    create({ selectedDate: null });
    expect(component.dateClass(new Date())).toBe('mat-calendar-body-initial');
    component.selectedDate = new Date();
    expect(component.dateClass(new Date())).toBe('');
  });
});
