import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatCalendar } from '@angular/material/datepicker';

@Component({
  selector: 'mdf-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements AfterViewInit, OnInit, OnDestroy {

  @Input() minDate!: Date | null;
  @Input() maxDate!: Date | null;
  @Input() selectedDate: Date | null = null;

  @Output() dateChange = new EventEmitter<Date | null>();
  @Output() dayClicked = new EventEmitter<Date | null>();

  @ViewChild(MatCalendar) calendar: MatCalendar<Date>;

  private removeCaptureListener?: () => void;

  private today: Date = this.dateAdapter.createDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  set activeDate(date: Date) {
    this.calendar.activeDate = date;
  }

  get activeDate(): Date {
    return this.calendar.activeDate;
  }

  readonly dateClass = (date: Date) => {
    if (this.selectedDate != null) return '';
    if (
      this.selectedDate === null &&
      this.today &&
      date.toDateString() === this.today.toDateString()
    ) {
      return 'mat-calendar-body-initial';
    }
    return '';
  }

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private dateAdapter: DateAdapter<Date>
  ) { }

  ngOnInit() {
    if (this.minDate) {
      this.today.setHours(
        this.minDate?.getHours() ?? 12,
        this.minDate?.getMinutes() ?? 0
      );
    }
  }

  ngAfterViewInit() {
    this.setupDayClickHandler();
  }

  ngOnDestroy() {
    this.removeCaptureListener?.();
  }

  onChange(date: Date | null) {
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

  handleDayClick(date: Date | null): void {
    this.dayClicked.emit(date);
  }
}