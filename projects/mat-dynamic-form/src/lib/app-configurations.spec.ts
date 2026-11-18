import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDynamicFormComponent } from './mat-dynamic-form.component';
import { MatDynamicFormModule } from './mat-dynamic-form.module';
import { FormStructure } from './models/FormStructure';
import { Button, DatePicker, DateRangePicker, DateTimePicker, Input, InputFile, InputNumber, TimePicker } from './models/Node';
import { FileUtils } from './utils/file-utils';

/**
 * Behaviors that depend on how the host application is configured: several forms on one page, Shadow DOM,
 * its own DateAdapter, its locale, no Bootstrap, missing assets...
 */

@Component({
  template: `
    <div class="first"><mat-dynamic-form [structure]="first"></mat-dynamic-form></div>
    <div class="second"><mat-dynamic-form [structure]="second"></mat-dynamic-form></div>`
})
class TwoFormsHostComponent {
  first: FormStructure;
  second: FormStructure;
}

@Component({
  template: `<mat-dynamic-form [structure]="structure"></mat-dynamic-form>`,
  encapsulation: ViewEncapsulation.ShadowDom
})
class ShadowHostComponent {
  structure: FormStructure;
}

@Component({ template: `<mat-dynamic-form [structure]="structure"></mat-dynamic-form>` })
class SingleHostComponent {
  structure: FormStructure;
}

/** An app module that configures moment for the whole app, imported before MatDynamicFormModule. */
@NgModule({
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ]
})
class AppDatesModule { }

const png = (name = 'photo.png') => new File([new Uint8Array(10)], name, { type: 'image/png' });

function type(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
}

describe('App configurations', () => {

  afterEach(() => {
    try { TestBed.inject(OverlayContainer).getContainerElement().innerHTML = ''; } catch { }
  });

  describe('two forms on the same page with the same node ids', () => {
    let fixture: ComponentFixture<TwoFormsHostComponent>;
    let first: FormStructure;
    let second: FormStructure;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatDynamicFormModule, NoopAnimationsModule, ReactiveFormsModule],
        declarations: [TwoFormsHostComponent]
      }).compileComponents();
    });

    afterEach(() => {
      fixture.destroy();
      fixture.nativeElement.remove();
    });

    function render(build: () => FormStructure) {
      fixture = TestBed.createComponent(TwoFormsHostComponent);
      first = build();
      second = build();
      fixture.componentInstance.first = first;
      fixture.componentInstance.second = second;
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }

    function inSecond<T extends HTMLElement>(selector: string): T {
      return fixture.nativeElement.querySelector(`.second ${selector}`);
    }

    it('runs DOM event actions of the form the user interacts with', fakeAsync(() => {
      const calls: string[] = [];
      let index = 0;
      render(() => {
        const name = index++ === 0 ? 'first' : 'second';
        return new FormStructure('Form', [
          new Input('name', 'Name').apply({ action: { type: 'change', onEvent: () => calls.push(name) } })
        ]);
      });
      flush();

      const input = inSecond<HTMLInputElement>('input#name');
      input.value = 'typed';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('change'));

      expect(calls).toEqual(['second']);
    }));

    it('runs the button action of its own form', fakeAsync(() => {
      const calls: string[] = [];
      let index = 0;
      render(() => {
        const name = index++ === 0 ? 'first' : 'second';
        return new FormStructure('Form', [new Input('a', 'A')], [new Button('save', 'Save', { onEvent: () => calls.push(name) })]);
      });
      flush();

      inSecond<HTMLButtonElement>('button#save').click();
      expect(calls).toEqual(['second']);
    }));

    it('filters InputNumber typing in its own form', fakeAsync(() => {
      render(() => new FormStructure('Form', [new InputNumber('amount', 'Amount')]));
      flush();

      type(inSecond<HTMLInputElement>('input#amount'), '12a');
      expect(second.getControlById('amount').value).toBe('12');
      expect(first.getControlById('amount').value).toBe('');
    }));

    it('focuses the autoFocus node of each form inside that form', fakeAsync(() => {
      const focused: HTMLElement[] = [];
      spyOn(HTMLElement.prototype, 'focus').and.callFake(function (this: HTMLElement) { focused.push(this); });
      render(() => new FormStructure('Form', [new Input('a', 'A'), new Input('b', 'B').apply({ autoFocus: true })]));
      flush();

      expect(focused.length).toBe(2);
      expect(focused.every(e => e.id === 'b')).toBeTrue();
      expect(focused.some(e => fixture.nativeElement.querySelector('.second').contains(e))).toBeTrue();
    }));

    it('sizes the scrollable content of every form', fakeAsync(() => {
      render(() => new FormStructure('Form', [new Input('a', 'A')]).apply({ onlyScrollContent: true, maxParentHeight: '400px' }));
      flush();

      expect(inSecond<HTMLElement>('#mdf_content').style.overflowY).toBe('auto');
      expect(fixture.nativeElement.querySelector('.first #mdf_content').style.overflowY).toBe('auto');
    }));

    it('keeps each InputFile in its own form', fakeAsync(() => {
      render(() => new FormStructure('Form', [new InputFile('avatar', 'Avatar').apply({ accept: ['png'] })]));
      flush();

      const input = inSecond<HTMLInputElement>('input[type=file]');
      input.files = FileUtils.createFileList([png()]);
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect((second.getValue<any>().avatar as File).name).toBe('photo.png');

      inSecond<HTMLButtonElement>('button.close').click();
      fixture.detectChanges();
      expect(second.getValue<any>().avatar).toBeNull();
      expect(input.value).toBe('');
    }));

    it('highlights the date-time picker icon of its own form', fakeAsync(() => {
      render(() => new FormStructure('Form', [new DateTimePicker('when', 'When')]));
      flush();

      inSecond<HTMLButtonElement>('button[id="whenTodayIcon"]').click();
      fixture.detectChanges();
      tick();

      expect(inSecond<HTMLElement>('button[id="whenTodayIcon"]').classList).toContain('active');
      expect(fixture.nativeElement.querySelector('.first button[id="whenTodayIcon"]').classList).not.toContain('active');
      flush();
    }));
  });

  describe('inside a Shadow DOM', () => {
    let fixture: ComponentFixture<ShadowHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatDynamicFormModule, NoopAnimationsModule],
        declarations: [ShadowHostComponent]
      }).compileComponents();
    });

    afterEach(() => fixture.destroy());

    it('runs button actions and DOM event actions', fakeAsync(() => {
      const onSave = jasmine.createSpy('onSave');
      const onChange = jasmine.createSpy('onChange');
      fixture = TestBed.createComponent(ShadowHostComponent);
      fixture.componentInstance.structure = new FormStructure('Form', [
        new Input('name', 'Name').apply({ action: { type: 'change', onEvent: onChange } })
      ], [new Button('save', 'Save', { onEvent: onSave })]);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      const root: ShadowRoot = fixture.nativeElement.shadowRoot;
      const input = root.querySelector('input#name') as HTMLInputElement;
      input.value = 'x';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('change'));
      (root.querySelector('button#save') as HTMLButtonElement).click();

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledTimes(1);
    }));
  });

  describe('date adapters', () => {
    afterEach(() => TestBed.resetTestingModule());

    it('does not replace the DateAdapter the app configured, whatever the import order', () => {
      TestBed.configureTestingModule({ imports: [AppDatesModule, MatDynamicFormModule] });
      expect(TestBed.inject(DateAdapter) instanceof MomentDateAdapter).toBeTrue();
      expect(TestBed.inject(MAT_DATE_FORMATS)).toBe(MAT_MOMENT_DATE_FORMATS);
    });

    it('uses the app DateAdapter inside the form', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [AppDatesModule, MatDynamicFormModule, NoopAnimationsModule],
        declarations: [SingleHostComponent]
      });
      const fixture = TestBed.createComponent(SingleHostComponent);
      fixture.componentInstance.structure = new FormStructure('Form', [new DatePicker('day', 'Day')]);
      fixture.detectChanges();
      flush();

      const form = fixture.debugElement.query(By.directive(MatDynamicFormComponent));
      expect(form.injector.get(DateAdapter) instanceof MomentDateAdapter).toBeTrue();
      fixture.destroy();
    }));

    it('works with the native DateAdapter when the app configures none', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatDynamicFormModule, NoopAnimationsModule],
        declarations: [SingleHostComponent]
      });
      const fixture = TestBed.createComponent(SingleHostComponent);
      fixture.componentInstance.structure = new FormStructure('Form', [new DatePicker('day', 'Day'), new DateTimePicker('when', 'When')]);
      fixture.detectChanges();
      flush();

      const form = fixture.debugElement.query(By.directive(MatDynamicFormComponent));
      expect(form.injector.get(DateAdapter) instanceof NativeDateAdapter).toBeTrue();

      (fixture.nativeElement.querySelector('button[aria-label="Open calendar"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      tick();
      expect(TestBed.inject(OverlayContainer).getContainerElement().querySelector('mat-calendar')).not.toBeNull();
      fixture.destroy();
      flush();
    }));
  });

  describe('locale and typed values', () => {
    let fixture: ComponentFixture<SingleHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatDynamicFormModule, NoopAnimationsModule],
        declarations: [SingleHostComponent]
      }).compileComponents();
    });

    afterEach(() => {
      fixture.destroy();
      fixture.nativeElement.remove();
    });

    function render(structure: FormStructure) {
      fixture = TestBed.createComponent(SingleHostComponent);
      fixture.componentInstance.structure = structure;
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      return structure;
    }

    it('accepts a comma as decimal separator in InputNumber', fakeAsync(() => {
      const structure = render(new FormStructure('Form', [new InputNumber('amount', 'Amount')]));
      type(fixture.nativeElement.querySelector('input#amount'), '1,5');
      expect(structure.getControlById('amount').value).toBe('1.5');
      flush();
    }));

    it('reads typed date-time text with the node dateFormat (day before month)', fakeAsync(() => {
      const structure = render(new FormStructure('Form', [new DateTimePicker('when', 'When', null, 'dd/MM/yyyy HH:mm')]));
      const input = fixture.nativeElement.querySelector('mat-date-time-picker input') as HTMLInputElement;
      input.value = '06/05/2025 14:30';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('change'));

      const value: Date = structure.getValue<any>().when;
      expect(value.getDate()).toBe(6);
      expect(value.getMonth()).toBe(4);
      expect(value.getHours()).toBe(14);
      expect(value.getMinutes()).toBe(30);
      flush();
    }));

    it('reads typed 12-hour time with the node dateFormat', fakeAsync(() => {
      const structure = render(new FormStructure('Form', [new TimePicker('hour', 'Hour', null, 'hh:mm a')]));
      const input = fixture.nativeElement.querySelector('mat-date-time-picker input') as HTMLInputElement;
      input.value = '02:15 PM';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('change'));

      const value: Date = structure.getValue<any>().hour;
      expect(value.getHours()).toBe(14);
      expect(value.getMinutes()).toBe(15);
      expect(value.getDate()).toBe(new Date().getDate());
      flush();
    }));

    it('lets the app translate the date range and file upload texts', fakeAsync(() => {
      render(new FormStructure('Form', [
        new DateRangePicker('range', 'Range').apply({ startPlaceholder: 'Start date', endPlaceholder: 'End date' } as any),
        new InputFile('file', 'File').apply({ selectLabel: 'Choose file', allFilesLabel: 'Any file' } as any),
      ]));

      const element: HTMLElement = fixture.nativeElement;
      expect((element.querySelector('input[matStartDate]') as HTMLInputElement).placeholder).toBe('Start date');
      expect((element.querySelector('input[matEndDate]') as HTMLInputElement).placeholder).toBe('End date');
      expect(element.textContent).toContain('Choose file');
      expect(element.textContent).toContain('Any file');
      flush();
    }));

    it('keeps the current texts by default', fakeAsync(() => {
      render(new FormStructure('Form', [new DateRangePicker('range', 'Range'), new InputFile('file', 'File')]));
      const element: HTMLElement = fixture.nativeElement;
      expect((element.querySelector('input[matStartDate]') as HTMLInputElement).placeholder).toBe('Fecha Inicio');
      expect(element.textContent).toContain('Seleccionar');
      flush();
    }));
  });

  describe('without Bootstrap and without the library assets', () => {
    let fixture: ComponentFixture<SingleHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatDynamicFormModule, NoopAnimationsModule],
        declarations: [SingleHostComponent]
      }).compileComponents();
    });

    afterEach(() => {
      fixture.destroy();
      fixture.nativeElement.remove();
    });

    function render(structure: FormStructure) {
      fixture = TestBed.createComponent(SingleHostComponent);
      fixture.componentInstance.structure = structure;
      fixture.nativeElement.style.width = '1000px';
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }

    it('lays out two columns and right-aligned actions with its own styles', fakeAsync(() => {
      render(new FormStructure('Form', [new Input('a', 'A'), new Input('b', 'B'), new Input('c', 'C').apply({ singleLine: true })],
        [new Button('cancel', 'Cancel', {}), new Button('save', 'Save', {})]));
      flush();

      const field = (id: string) => (fixture.nativeElement.querySelector(`input#${id}`) as HTMLElement).closest('mat-form-field') as HTMLElement;
      const a = field('a').getBoundingClientRect();
      const b = field('b').getBoundingClientRect();
      const c = field('c').getBoundingClientRect();
      expect(Math.round(a.top)).toBe(Math.round(b.top));          // same row
      expect(b.left).toBeGreaterThan(a.left);
      expect(c.width).toBeGreaterThan(a.width * 1.8);              // full row

      const save = (fixture.nativeElement.querySelector('button#save') as HTMLElement).getBoundingClientRect();
      const cancel = (fixture.nativeElement.querySelector('button#cancel') as HTMLElement).getBoundingClientRect();
      const form = (fixture.nativeElement.querySelector('form') as HTMLElement).getBoundingClientRect();
      expect(save.left - cancel.right).toBeGreaterThan(4);         // spaced
      expect(form.right - save.right).toBeLessThan(40);            // right aligned
    }));

    it('falls back to the generic file icon once and then hides it instead of retrying forever', fakeAsync(() => {
      render(new FormStructure('Form', [new InputFile('file', 'File')]));
      const img = fixture.nativeElement.querySelector('input-file img') as HTMLImageElement;
      expect(img.getAttribute('onerror')).toBeNull();               // no inline handler (CSP)

      img.dispatchEvent(new Event('error'));
      fixture.detectChanges();
      expect(img.src).toContain('assets/img/file.png');

      img.dispatchEvent(new Event('error'));
      fixture.detectChanges();
      expect(img.src).toContain('assets/img/file.png');
      expect(img.style.visibility).toBe('hidden');
      flush();
    }));
  });
});
