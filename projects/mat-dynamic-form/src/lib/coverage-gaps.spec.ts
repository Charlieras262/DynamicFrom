import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DateTimePickerComponent } from './components/date-time-picker/date-time-picker.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { TimePickerComponent } from './components/time-picker/time-picker.component';
import { MaterialModule } from './material-module';
import { MatDynamicFormModule } from './mat-dynamic-form.module';
import { FormStructure } from './models/FormStructure';
import { CustomNode, DateRangePicker, DateTimePicker, Input, InputNumber } from './models/Node';
import { SinitizeHtmlPipe } from './pipes/sinitize-html.pipe';

/** Paths that real apps reach but the component specs did not cover. */

@Component({ template: `<mat-dynamic-form [structure]="structure"></mat-dynamic-form>` })
class HostComponent {
  structure: FormStructure;
}

@Component({ template: `<span class="bare-custom">{{ control?.value }}</span>` })
class BareCustomComponent {
  control: FormControl;
}

const taken = (control: AbstractControl): Observable<ValidationErrors | null> =>
  of(control.value === 'admin' ? { taken: true } : null).pipe(delay(10));

describe('Paths reached by real apps', () => {

  describe('FormStructure', () => {
    function build(nodes: any[]): FormStructure {
      const structure = new FormStructure('Form', nodes);
      structure.setFromGroup(new FormGroup({}));
      structure.remapValues();
      return structure;
    }

    it('addAsyncValidators keeps the existing async validators', fakeAsync(() => {
      const other = (c: AbstractControl) => of(c.value === 'root' ? { reserved: true } : null).pipe(delay(10));
      const structure = build([new Input('user', 'User').apply({ asyncValidator: taken as any })]);
      structure.addAsyncValidators('user', other as any);

      structure.patchValue({ user: 'admin' });
      tick(20);
      expect(structure.getControlById('user').hasError('taken')).toBeTrue();

      structure.patchValue({ user: 'root' });
      tick(20);
      expect(structure.getControlById('user').hasError('reserved')).toBeTrue();
    }));

    it('addAsyncValidators works on a control without async validators', fakeAsync(() => {
      const structure = build([new Input('user', 'User')]);
      structure.addAsyncValidators('user', taken as any);
      structure.patchValue({ user: 'admin' });
      tick(20);
      expect(structure.getControlById('user').hasError('taken')).toBeTrue();
    }));

    it('setAsyncValidator replaces the async validators', fakeAsync(() => {
      const structure = build([new Input('user', 'User').apply({ asyncValidator: taken as any })]);
      structure.setAsyncValidator('user', null);
      structure.patchValue({ user: 'admin' });
      tick(20);
      expect(structure.getControlById('user').valid).toBeTrue();
    }));

    it('keeps the deprecated pathValue and isInalid working', () => {
      const structure = build([new Input('a', 'A').apply({ validator: Validators.required })]);
      expect(structure.isInalid()).toBeTrue();
      expect(structure.pathValue({ a: 'x' })).toBeTrue();
      expect(structure.isInalid()).toBeFalse();
      expect(() => structure.pathValue({ missing: 1 })).toThrow();
      expect(new FormStructure('t', []).pathValue({ a: 1 })).toBeFalse();
    });

    it('remapValues enables and disables an existing date range', () => {
      const range = new DateRangePicker('range', 'Range');
      const structure = build([range]);
      range.disabled = true;
      structure.remapValues();
      expect(structure.getControlById('range').disabled).toBeTrue();
      range.disabled = false;
      structure.remapValues();
      expect(structure.getControlById('range').enabled).toBeTrue();
    });

    it('remapValues enables again a node that was disabled, without registering its events twice', fakeAsync(() => {
      const onEvent = jasmine.createSpy('onEvent');
      const node = new Input('a', 'A').apply({ disabled: true, action: { type: 'valueChange', onEvent } });
      const structure = build([node]);
      tick();
      node.disabled = false;
      structure.remapValues();
      tick();
      expect(structure.getControlById('a').enabled).toBeTrue();

      onEvent.calls.reset();
      structure.patchValue({ a: 'x' });
      expect(onEvent).toHaveBeenCalledTimes(1);
    }));

    it('counts controls inside nested groups and arrays', () => {
      const structure = build([new Input('a', 'A')]);
      structure.getFormGroup().addControl('list', new FormArray([new FormControl(1), new FormControl(2)]));
      expect(structure.fromGroupSize()).toBe(3);
    });

    it('createNodes before the form is rendered only adds the nodes', () => {
      const structure = new FormStructure('Form', [new Input('a', 'A')]);
      structure.createNodes(1, [new Input('b', 'B')]);
      expect(structure.nodes.map(n => n.id)).toEqual(['a', 'b']);
      expect(structure.isValid()).toBeUndefined();
    });
  });

  describe('form component', () => {
    let fixture: ComponentFixture<HostComponent>;
    let structure: FormStructure;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatDynamicFormModule, NoopAnimationsModule],
        declarations: [HostComponent, BareCustomComponent]
      }).compileComponents();
    });

    afterEach(() => {
      fixture.destroy();
      fixture.nativeElement.remove();
    });

    function render(s: FormStructure) {
      structure = s;
      fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.structure = s;
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }

    function typeNumber(value: string) {
      const input = fixture.nativeElement.querySelector('input#n') as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
      return input;
    }

    it('InputNumber limits the length with maxCharCount', fakeAsync(() => {
      render(new FormStructure('Form', [new InputNumber('n', 'N').apply({ maxCharCount: 3 })]));
      typeNumber('12345');
      expect(structure.getControlById('n').value).toBe('123');
      flush();
    }));

    it('InputNumber removes a trailing decimal point on blur', fakeAsync(() => {
      render(new FormStructure('Form', [new InputNumber('n', 'N')]));
      const input = typeNumber('12.');
      input.dispatchEvent(new FocusEvent('blur'));
      expect(structure.getControlById('n').value).toBe('12');
      flush();
    }));

    it('resizing the window recalculates the scrollable height', fakeAsync(() => {
      render(new FormStructure('Form', [new Input('a', 'A')]).apply({ onlyScrollContent: true, maxParentHeight: '300px' }));
      flush();
      const content = fixture.nativeElement.querySelector('#mdf_content') as HTMLElement;
      content.style.maxHeight = '';
      window.dispatchEvent(new Event('resize'));
      expect(content.style.maxHeight).toMatch(/calc\(.*px\)/);
    }));

    it('creates a custom node without properties and gives it the control', fakeAsync(() => {
      const node = new CustomNode<BareCustomComponent>('bare', BareCustomComponent);
      render(new FormStructure('Form', [node]));
      flush();
      expect(node.instance.control).toBe(structure.getControlById('bare') as FormControl);
    }));
  });

  describe('DateTimePickerComponent', () => {
    @Component({
      template: `<form [formGroup]="form"><mat-date-time-picker formControlName="when" [node]="node"></mat-date-time-picker></form>`
    })
    class DtpHostComponent {
      form = new FormGroup({ when: new FormControl('') });
      node = new DateTimePicker('when', 'When', null, 'dd/MM/yyyy HH:mm');
    }

    let fixture: ComponentFixture<DtpHostComponent>;
    let picker: DateTimePickerComponent;

    function setup(formats = MAT_NATIVE_DATE_FORMATS) {
      TestBed.configureTestingModule({
        imports: [MaterialModule, NoopAnimationsModule, ReactiveFormsModule],
        declarations: [DtpHostComponent, DateTimePickerComponent, CalendarComponent, TimePickerComponent, SinitizeHtmlPipe],
        providers: [{ provide: MAT_DATE_FORMATS, useValue: formats }],
      });
      fixture = TestBed.createComponent(DtpHostComponent);
      fixture.detectChanges();
      picker = fixture.debugElement.query(By.directive(DateTimePickerComponent)).componentInstance;
    }

    afterEach(() => fixture.destroy());

    it('clears the error of the input when the outer control becomes valid again', () => {
      setup();
      const control = fixture.componentInstance.form.get('when');
      control.setValidators(Validators.required);
      control.updateValueAndValidity();
      expect(picker.internalControl.invalid).toBeTrue();

      control.setValue(new Date(2025, 0, 1));
      expect(picker.internalControl.valid).toBeTrue();
    });

    it('shows nothing for a value that is not a date', () => {
      setup();
      fixture.componentInstance.form.setValue({ when: 'garbage' });
      expect(picker.internalControl.value).toBe('');
    });

    it('reads typed text with MAT_DATE_FORMATS.parse.dateTimeInput when the node has no dateFormat', () => {
      setup({ ...MAT_NATIVE_DATE_FORMATS, parse: { ...MAT_NATIVE_DATE_FORMATS.parse, dateTimeInput: 'any' } } as any);
      fixture.componentInstance.node.dateFormat = undefined;
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      input.value = '2025-03-04T10:20:00';
      input.dispatchEvent(new Event('change'));
      expect((fixture.componentInstance.form.value.when as Date).getHours()).toBe(10);
    });
  });
});
