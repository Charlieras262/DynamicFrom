import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { isGreaterDate, to12HourFormat, to24HourFormat } from '../../utils/date-utils';
import { DateTimePicker, TimePicker } from '../../models/Node';
import { fadeScaleAnimation, fadeTransform } from '../../animations/clock.animation';

@Component({
  selector: 'mat-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  animations: [fadeScaleAnimation, fadeTransform]
})
export class TimePickerComponent implements OnInit {

  @Input() node!: DateTimePicker | TimePicker;
  @Input() selectedDate!: Date | null;
  @Output() selectedDateChange = new EventEmitter<Date | null>();
  @Output() onCloseRequest = new EventEmitter<'confirm' | 'cancel'>();

  showClockPicker: boolean = false;
  activePart: 'hour' | 'minute' | null = 'hour';
  isDragging = false;
  animating = false;

  readonly internalFormGroup: FormGroup;
  readonly hours = Array.from({ length: 12 }, (_, i) => i + 1);
  readonly minutes = Array.from({ length: 60 }, (_, i) => i);

  private previousDegreesHour = 0;
  private previousDegreesMinute = 0;
  private isMouseDown = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragThreshold = 5;
  private height = 0;

  constructor() {
    this.internalFormGroup = new FormGroup({
      hours: new FormControl('12', [Validators.required, Validators.min(1), Validators.max(12)]),
      minutes: new FormControl('00', [Validators.required, Validators.min(0), Validators.max(59)]),
      meridiem: new FormControl('AM', Validators.required),
    });
  }

  ngOnInit() {
    const _12Hour = to12HourFormat(this.selectedDate?.getHours() ?? 0);

    this.internalFormGroup.setValue({
      hours: _12Hour.hour12.toString().padStart(2, '0'),
      minutes: this.selectedDate?.getMinutes().toString().padStart(2, '0'),
      meridiem: _12Hour.meridiem,
    });

    this.normalizeTime();

    this.showClockPicker = this.node.showClockPicker ?? false;

    this.recalculateHeight();
  }

  justNumbers(event: Event, type: 'H' | 'M') {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    const valueNum = +value;

    if (valueNum <= (type === 'H' ? 1 : 5) && value.length < 2) return;

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

    this.normalizeTime();
  }

  setAMPM(am: boolean) {
    if (this.normalizeTime(am ? 'AM' : 'PM'))
      this.internalFormGroup.patchValue({
        meridiem: am ? 'AM' : 'PM'
      });
  }

  confirm() {
    const date = new Date(this.selectedDate);
    const _24Hour = +to24HourFormat(+this.internalFormGroup.value.hours, this.internalFormGroup.value.meridiem);

    date.setHours(_24Hour, this.internalFormGroup.value.minutes);

    this.onCloseRequest.emit('confirm');
    this.selectedDateChange.emit(date);
  }

  normalizeTime(newMeridiem: 'AM' | 'PM' = this.internalFormGroup.value.meridiem): boolean {
    if (this.selectedDate) {
      this.selectedDate.setHours(
        +to24HourFormat(+this.internalFormGroup.value.hours, newMeridiem),
        +this.internalFormGroup.value.minutes
      );

      const minHour12 = to12HourFormat(this.selectedDate.getHours());

      this.internalFormGroup.patchValue({
        hours: minHour12.hour12.toString().padStart(2, '0'),
        minutes: this.selectedDate?.getMinutes().toString().padStart(2, '0'),
        meridiem: minHour12.meridiem
      });
    }

    if (this.node.minDate && isGreaterDate(this.node.minDate, this.selectedDate ?? new Date())) {
      const minHour12 = to12HourFormat(this.node.minDate.getHours());
      this.internalFormGroup.patchValue({
        hours: minHour12.hour12.toString().padStart(2, '0'),
        minutes: this.node?.minDate.getMinutes().toString().padStart(2, '0'),
        meridiem: minHour12.meridiem
      });
      return false;
    }

    if (this.node.maxDate && isGreaterDate(this.selectedDate ?? new Date(), this.node.maxDate)) {
      const maxHour12 = to12HourFormat(this.node.maxDate.getHours());
      this.internalFormGroup.patchValue({
        hours: maxHour12.hour12.toString().padStart(2, '0'),
        minutes: this.node.maxDate.getMinutes().toString().padStart(2, '0'),
        meridiem: maxHour12.meridiem
      });
      return false;
    }

    return true;
  }

  showClock() {
    const newShowClockPicker = !this.showClockPicker;
    if (newShowClockPicker) {
      this.recalculateHeight(newShowClockPicker);
      setTimeout(() => this.showClockPicker = newShowClockPicker, 150);
    } else {
      this.showClockPicker = newShowClockPicker;
      setTimeout(() => { this.recalculateHeight(); }, 230);
    }
  }

  getLabel(): string {
    return this.showClockPicker ? this.node.enterTimeLabel : this.node.selectTimeLabel;
  }

  getCurrentHour(): number {
    return +this.internalFormGroup.value.hours;
  }

  getCurrentMinute(): number {
    return +this.internalFormGroup.value.minutes;
  }

  getHandTransform(): string {
    return `translate(-50%, -100%) rotate(${this.getHandDegrees()}deg)`;
  }

  selectHour(hour: number) {
    this.internalFormGroup.patchValue({ hours: hour.toString().padStart(2, '0') });
    this.normalizeTime();
  }

  selectMinute(minute: number) {
    this.internalFormGroup.patchValue({ minutes: minute.toString().padStart(2, '0') });
    this.normalizeTime();
  }

  onMouseDown(event: MouseEvent) {
    this.isMouseDown = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isMouseDown) return;

    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Force mouse release if cursor is outside the clock area
    const clock = (event.target as HTMLElement).closest('.mdf-time-clock');
    if (!clock) {
      this.onMouseUp();
      event.stopPropagation();
      event.target.dispatchEvent(new MouseEvent('mouseup'));
      return;
    }

    // Just start dragging after exceeding the threshold
    if (!this.isDragging && distance > this.dragThreshold) {
      this.isDragging = true;
    }

    if (this.isDragging) {
      this.updateMinuteByMouse(event);
    }
  }

  onMouseUp() {
    this.isMouseDown = false;

    // If dragging, wait a frame before disabling the animation
    if (this.isDragging) {
      setTimeout(() => (this.isDragging = false));
    }
  }

  updateMinuteByMouse(event: MouseEvent) {
    const clock = (event.target as HTMLElement).closest('.mdf-time-clock');
    if (!clock) return;

    const rect = clock.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;

    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;

    if (this.activePart === 'hour') {
      this.selectHour(Math.round((degrees / 360) * 12) || 12);
    } else if (this.activePart === 'minute') {
      this.selectMinute(Math.round((degrees / 360) * 60) % 60);
    }
  }

  getHeight() {
    return `${this.height}px`;
  }

  private getHandDegrees(): number {
    const isHour = this.activePart === 'hour';
    const value = isHour ? this.getCurrentHour() : this.getCurrentMinute();
    const max = isHour ? 12 : 60;

    // Normaliza el valor para evitar 12 → 360 conflicto
    const normalizedValue = value % max;
    const targetDegrees = (normalizedValue / max) * 360;

    // Escoge el ángulo previo según el tipo de manecilla
    const prevDeg = isHour ? this.previousDegreesHour : this.previousDegreesMinute;

    // Normaliza ambos a [0,360)
    const prevNorm = ((prevDeg % 360) + 360) % 360;
    const targetNorm = ((targetDegrees % 360) + 360) % 360;

    // Diferencia cruda
    let delta = targetNorm - prevNorm;

    // Mapea delta a la ruta más corta
    if (delta > 180) delta -= 360;
    else if (delta < -180) delta += 360;

    // Acumula sobre el valor previo
    const newDeg = prevDeg + delta;

    // Guarda en la variable correspondiente
    if (isHour) this.previousDegreesHour = newDeg;
    else this.previousDegreesMinute = newDeg;
    return newDeg;
  }

  private recalculateHeight(showClockPicker: boolean = this.showClockPicker) {
    const baseHeight = this.node.orientation === 'landscape' ? 200 : 202;
    this.height = showClockPicker ? baseHeight + 280 : baseHeight;
  }
}
