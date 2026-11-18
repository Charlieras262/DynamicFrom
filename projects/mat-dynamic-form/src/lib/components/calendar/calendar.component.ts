import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatCalendar } from '@angular/material/datepicker';
import { DATE_FALLBACK_PROVIDERS } from '../../utils/date-adapter-providers';

@Component({
  selector: 'mdf-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  providers: [DATE_FALLBACK_PROVIDERS],
})
/**
 * Calendar of the date-time picker. Works with whatever DateAdapter the app provides (native Date, moment, ...):
 * dates are only read and compared through the adapter. Inputs accept any value the adapter can deserialize
 * (for example a JavaScript Date), and the outputs emit the adapter's date type.
 */
export class CalendarComponent<D = any> implements AfterViewInit, OnDestroy {

  @Input() minDate!: D | Date | null;
  @Input() maxDate!: D | Date | null;
  @Input() selectedDate: D | Date | null = null;

  @Output() dateChange = new EventEmitter<D | null>();
  @Output() dayClicked = new EventEmitter<D | null>();

  @ViewChild(MatCalendar) calendar: MatCalendar<D>;

  private removeCaptureListener?: () => void;

  private readonly today: D = this.dateAdapter.today();

  set activeDate(date: D | Date) {
    // MatCalendar.activeDate does not deserialize: convert to the adapter's type first.
    const value = this.dateAdapter.deserialize(date);
    if (value && this.dateAdapter.isValid(value)) this.calendar.activeDate = value;
  }

  get activeDate(): D | Date {
    return this.calendar.activeDate;
  }

  readonly dateClass = (date: D) => {
    if (this.selectedDate != null) return '';
    return this.dateAdapter.sameDate(date, this.today) ? 'mat-calendar-body-initial' : '';
  }

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private dateAdapter: DateAdapter<D>
  ) { }

  ngAfterViewInit() {
    this.setupDayClickHandler();
  }

  ngOnDestroy() {
    this.removeCaptureListener?.();
  }

  onChange(date: D | null) {
    this.dateChange.emit(date);
    this.selectedDate = date;

    this.calendar.updateTodaysDate();
  }

  setupDayClickHandler(): void {
    const host: HTMLElement = this.el.nativeElement;
    let dayCellClicked = false;

    // Capture phase: runs before MatCalendar handles the click, so the current view and the
    // disabled state still describe the cell the user clicked (a month/year click switches the view).
    const capture = (event: MouseEvent) => {
      const cell = (event.target as HTMLElement).closest('.mat-calendar-body-cell');
      dayCellClicked = !!cell
        && this.calendar?.currentView === 'month'
        && !cell.classList.contains('mat-calendar-body-disabled');
    };
    host.addEventListener('click', capture, true);
    this.removeCaptureListener = () => host.removeEventListener('click', capture, true);

    this.renderer.listen(host, 'click', () => {
      if (!dayCellClicked) return;
      dayCellClicked = false;
      this.handleDayClick(this.selectedDate);
    });
  }

  handleDayClick(date: D | Date | null): void {
    this.dayClicked.emit(date == null ? null : this.dateAdapter.deserialize(date));
  }
}