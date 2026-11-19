import { AfterViewInit, Component, ErrorHandler, Injector } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  AutoComplete, Button, Checkbox, CustomNode, DatePicker, DateRangePicker, DateTimePicker, Dropdown, FormStructure,
  Input, InputFile, InputNumber, InputPassword, OptionChild, RadioGroup, Switch, TextArea, TimePicker
} from 'mat-dynamic-form';

@Component({
  selector: 'app-custom-field',
  template: `<input class="custom-field" [formControl]="control" [placeholder]="label">`,
})
export class CustomFieldComponent {
  label = '';
  control!: FormControl;
}

const errors: string[] = [];
window.addEventListener('error', e => errors.push('window: ' + e.message));

type Results = { [check: string]: boolean | string | number };

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Component({
  selector: 'app-root',
  template: `
    <div class="first"><mat-dynamic-form [structure]="first"></mat-dynamic-form></div>
    <div class="second"><mat-dynamic-form [structure]="second"></mat-dynamic-form></div>
    <pre id="smoke-result">{{ result }}</pre>`,
})
export class AppComponent implements AfterViewInit {
  first = this.build('first');
  second = this.build('second');
  result = 'running';
  private clicks: string[] = [];

  constructor(private injector: Injector) {
    const handler = injector.get(ErrorHandler);
    const original = handler.handleError.bind(handler);
    handler.handleError = (error: any) => { errors.push(String(error?.message ?? error)); original(error); };
  }

  build(name: string): FormStructure {
    const options = [new OptionChild('One', '1'), new OptionChild('Two', '2')];
    return new FormStructure('Smoke ' + name, [
      new Input('name', 'Name').apply({ autoFocus: name === 'second', validator: Validators.required }),
      new InputNumber('amount', 'Amount'),
      new InputPassword('password', 'Password'),
      new TextArea('comments', 'Comments'),
      new Checkbox('agree', 'Agree'),
      new Switch('notify', 'Notify'),
      new RadioGroup('pet', 'Pet', options).apply({ selectedValue: '1' }),
      new Dropdown('status', 'Status', options).apply({ selectedValue: '2' }),
      new AutoComplete('country', 'Country', options).apply({ selectedValue: '1' }),
      new DatePicker('day', 'Day').apply({ minDate: new Date(2000, 0, 1) }),
      new DateRangePicker('range', 'Range'),
      new DateTimePicker('when', 'When', null, 'dd/MM/yyyy HH:mm').apply({ minDate: new Date(2000, 0, 1) }),
      new TimePicker('hour', 'Hour', null, 'HH:mm'),
      new InputFile('file', 'File').apply({ accept: ['png'] }),
      new CustomNode<CustomFieldComponent>('custom', CustomFieldComponent, { label: 'Custom' }),
    ], [
      new Button('save', 'Save', { style: 'primary', onEvent: () => this.clicks.push(name) }),
    ]);
  }

  async ngAfterViewInit() {
    await wait(500);
    const results: Results = {};
    try {
      await this.run(results);
    } catch (e: any) {
      errors.push('scenario: ' + (e?.message ?? e));
    }
    // Keys starting with "info" are details for debugging, not checks.
    const ok = errors.length === 0 && Object.keys(results).every(k => k.startsWith('info') || results[k] === true);
    this.result = JSON.stringify({ ok, adapter: this.adapterName(), results, errors }, null, 2);
  }

  private adapterName(): string {
    // Since 1.7.2 the library registers no app-wide DateAdapter: without moment there is none at the root.
    // Class names are minified in production builds: check the type instead.
    const adapter = this.injector.get<any>(DateAdapter as any, null);
    if (!adapter) return 'none (form uses its native fallback)';
    return adapter instanceof MomentDateAdapter ? 'MomentDateAdapter' : 'other';
  }

  private q<T extends Element>(selector: string, root: ParentNode = document): T {
    const element = root.querySelector(selector) as T | null;
    if (!element) throw new Error('missing ' + selector);
    return element;
  }

  // `any`: strict projects (Angular 13+) forbid dot access on index signatures.
  private async run(r: any) {
    const second = this.q<HTMLElement>('.second');
    const overlay = () => this.q<HTMLElement>('.cdk-overlay-container');

    // Rendering
    r.renders15Nodes = second.querySelectorAll('mat-form-field, mat-checkbox, mat-slide-toggle, mat-radio-group, input-file, mat-date-time-picker, app-custom-field').length >= 15;
    r.customNode = !!second.querySelector('app-custom-field input.custom-field');
    r.autoFocusInOwnForm = document.activeElement === this.q('input#name', second);

    // Typing and InputNumber with comma
    const amount = this.q<HTMLInputElement>('input#amount', second);
    amount.value = '1,5';
    amount.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
    r.numberComma = this.second.getControlById('amount')?.value === '1.5' && this.first.getControlById('amount')?.value === '';

    // Buttons act on their own form
    const name = this.q<HTMLInputElement>('input#name', second);
    name.value = 'Ana';
    name.dispatchEvent(new Event('input'));
    await wait(50);
    this.q<HTMLButtonElement>('button#save', second).click();
    r.buttonOwnForm = this.clicks.join() === 'second';

    // Material datepicker
    this.q<HTMLButtonElement>('mat-form-field button[aria-label="Open calendar"]', second).click();
    await wait(400);
    r.datepickerOpens = !!overlay().querySelector('mat-calendar');
    (overlay().querySelector('.cdk-overlay-backdrop') as HTMLElement)?.click();
    await wait(400);

    // Date-time picker: calendar -> time -> OK
    this.q<HTMLButtonElement>('button[id="whenTodayIcon"]', second).click();
    await wait(400);
    const cells = Array.from(overlay().querySelectorAll('mdf-calendar .mat-calendar-body-cell:not(.mat-calendar-body-disabled)')) as HTMLElement[];
    r.dateTimeCalendar = cells.length > 0;
    cells[cells.length - 1]?.click();
    await wait(400);
    r.dateTimeTimePanel = !!overlay().querySelector('mdf-time-picker form');
    this.clickOk(overlay());
    await wait(500);
    r.dateTimeValue = this.second.getValue<any>().when instanceof Date && this.q<HTMLInputElement>('mat-date-time-picker#when input', second).value.length > 0;

    // Typed date with dd/MM/yyyy
    const whenInput = this.q<HTMLInputElement>('mat-date-time-picker#when input', second);
    whenInput.value = '06/05/2025 14:30';
    whenInput.dispatchEvent(new Event('input'));
    whenInput.dispatchEvent(new Event('change'));
    const typed: Date = this.second.getValue<any>().when;
    r.typedDayFirst = typed instanceof Date && typed.getDate() === 6 && typed.getMonth() === 4;

    // Time picker
    this.q<HTMLButtonElement>('button[id="hourTodayIcon"]', second).click();
    await wait(400);
    r.timePicker = !!overlay().querySelector('mdf-time-picker form');
    this.clickOk(overlay());
    await wait(500);

    // File upload in the second form
    const file = this.q<HTMLInputElement>('input[type=file]', second);
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(10)], 'photo.png', { type: 'image/png' }));
    file.files = transfer.files;
    file.dispatchEvent(new Event('change'));
    await wait(100);
    r.fileOwnForm = (this.second.getValue<any>().file as File)?.name === 'photo.png' && !this.first.getValue<any>().file;
    r.fileInputHidden = getComputedStyle(file).display === 'none';

    // Layout: two columns
    const fields = Array.from(second.querySelectorAll('mat-form-field')) as HTMLElement[];
    r.twoColumns = Math.round(fields[0].getBoundingClientRect().top) === Math.round(fields[1].getBoundingClientRect().top);

    // Values
    const value = this.second.getValue<any>();
    r.selectedValues = value.pet === '1' && value.status === '2' && value.country?.value === '1';
    r.infoValues = JSON.stringify({ pet: value.pet, status: value.status, country: value.country });
  }

  private clickOk(overlay: HTMLElement) {
    const ok = Array.from(overlay.querySelectorAll('.mdf-buttons button')).find(b => (b.textContent || '').trim() === 'OK') as HTMLElement;
    ok?.click();
  }
}
