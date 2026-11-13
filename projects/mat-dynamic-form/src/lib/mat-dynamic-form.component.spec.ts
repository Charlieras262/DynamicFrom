import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDynamicFormComponent } from './mat-dynamic-form.component';
import { MatDynamicFormModule } from './mat-dynamic-form.module';
import { FormStructure } from './models/FormStructure';
import {
  AutoComplete, Button, Checkbox, CustomNode, DatePicker, DateRangePicker, DateTimePicker, Dropdown, Input,
  InputFile, InputNumber, InputPassword, RadioGroup, Switch, TextArea, TimePicker
} from './models/Node';
import { OptionChild } from './models/OptionChild';

@Component({
  selector: 'test-custom-input',
  template: `<label>{{label}}</label><input class="custom-input" [formControl]="control">`
})
class TestCustomInputComponent {
  label: string;
  control: FormControl;
}

@Component({
  template: `<mat-dynamic-form *ngIf="structure" [structure]="structure"></mat-dynamic-form>`
})
class HostComponent {
  structure: FormStructure;
}

describe('MatDynamicFormComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDynamicFormModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [HostComponent, TestCustomInputComponent]
    }).compileComponents();
  });

  afterEach(() => fixture?.destroy());

  function render(structure: FormStructure) {
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.structure = structure;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    host = fixture.nativeElement;
  }

  function component(): MatDynamicFormComponent {
    return fixture.debugElement.query(By.directive(MatDynamicFormComponent)).componentInstance;
  }

  function el<T extends HTMLElement = HTMLElement>(selector: string): T {
    return host.querySelector(selector) as T;
  }

  function type(input: HTMLInputElement, value: string, inputType = 'insertText') {
    input.value = value;
    input.dispatchEvent(new InputEvent('input', { inputType }));
    fixture.detectChanges();
  }

  describe('rendering', () => {
    it('shows the title unless showTitle is false', fakeAsync(() => {
      const structure = new FormStructure('Sign Up', [new Input('a', 'A')]);
      render(structure);
      expect(el('#mdf_title').textContent).toContain('Sign Up');

      structure.showTitle = false;
      fixture.detectChanges();
      expect(el('#mdf_title')).toBeNull();
      flush();
    }));

    it('renders an element for every supported node type', fakeAsync(() => {
      const options = [new OptionChild('One', '1'), new OptionChild('Two', '2')];
      render(new FormStructure('Form', [
        new Input('input', 'Input'),
        new InputNumber('number', 'Number'),
        new InputPassword('password', 'Password'),
        new TextArea('textarea', 'TextArea'),
        new InputFile('file', 'File').apply({ accept: ['png'] }),
        new Switch('switch', 'Switch'),
        new AutoComplete('autocomplete', 'Auto', options),
        new Dropdown('dropdown', 'Dropdown', options),
        new Checkbox('checkbox', 'Check'),
        new RadioGroup('radiogroup', 'Radio', options),
        new DatePicker('date', 'Date'),
        new DateTimePicker('datetime', 'DateTime'),
        new TimePicker('timepicker', 'Time'),
        new DateRangePicker('daterange', 'Range'),
        new Button('button', 'Button', { style: 'primary' }),
      ]));

      expect(el('input#input')).not.toBeNull();
      expect(el('input#number.no-arrows')).not.toBeNull();
      expect(el<HTMLInputElement>('input#password').type).toBe('password');
      expect(el('textarea#textarea')).not.toBeNull();
      expect(el('input-file#file')).not.toBeNull();
      expect(el('mat-slide-toggle#switch')).not.toBeNull();
      expect(el('input#autocomplete[aria-autocomplete]')).not.toBeNull();
      expect(el('mat-select#dropdown')).not.toBeNull();
      expect(el('mat-checkbox#checkbox')).not.toBeNull();
      expect(host.querySelectorAll('mat-radio-group#radiogroup mat-radio-button').length).toBe(2);
      expect(el('input#date')).not.toBeNull();
      expect(el('mat-date-time-picker#datetime')).not.toBeNull();
      expect(el('mat-date-time-picker#timepicker')).not.toBeNull();
      expect(el('mat-date-range-input')).not.toBeNull();
      expect(el('button#button')).not.toBeNull();
      expect(host.textContent).not.toContain('not supported');
      flush();
    }));

    it('shows a message for unsupported node types', fakeAsync(() => {
      const node = new Input('x', 'X');
      (node as any).type = 'weird';
      render(new FormStructure('Form', [node]));
      expect(host.textContent).toContain('Node type "weird" not supported.');
      flush();
    }));

    it('does not fail with an empty node list', fakeAsync(() => {
      expect(() => { render(new FormStructure('Form', [])); flush(); }).not.toThrow();
    }));

    it('uses the full row for singleLine nodes', fakeAsync(() => {
      render(new FormStructure('Form', [new Input('a', 'A').apply({ singleLine: true }), new Input('b', 'B')]));
      expect(el('input#a').closest('mat-form-field').classList).toContain('col-sm-12');
      expect(el('input#b').closest('mat-form-field').classList).toContain('col-sm-6');
      flush();
    }));
  });

  describe('inputs', () => {
    it('binds the typed value to the form', fakeAsync(() => {
      const structure = new FormStructure('Form', [new Input('name', 'Name')]);
      render(structure);
      type(el('input#name'), 'Jane');
      expect(structure.getValue()).toEqual({ name: 'Jane' } as any);
      flush();
    }));

    it('shows the char counter when maxCharCount is set', fakeAsync(() => {
      const structure = new FormStructure('Form', [new Input('name', 'Name', 'abc').apply({ maxCharCount: 10 })]);
      render(structure);
      expect(host.textContent).toContain('3 / 10');
      flush();
    }));

    it('shows the error message when the control is invalid and touched', fakeAsync(() => {
      const structure = new FormStructure('Form', [
        new Input('name', 'Name').apply({ validator: Validators.required, errorMessage: 'Required field' })
      ]);
      render(structure);
      structure.getControlById('name').markAsTouched();
      fixture.detectChanges();
      expect(el('mat-error').textContent).toContain('Required field');
      flush();
    }));

    it('toggles the password visibility', fakeAsync(() => {
      render(new FormStructure('Form', [new InputPassword('pass', 'Password')]));
      const input = el<HTMLInputElement>('input#pass');
      expect(input.type).toBe('password');

      el<HTMLButtonElement>('button[aria-label="Hide password"]').click();
      fixture.detectChanges();
      expect(input.type).toBe('text');
      flush();
    }));

    it('reflects readOnly on the native input', fakeAsync(() => {
      render(new FormStructure('Form', [new Input('a', 'A').apply({ readOnly: true })]));
      expect(el<HTMLInputElement>('input#a').readOnly).toBeTrue();
      flush();
    }));
  });

  describe('InputNumber', () => {
    let structure: FormStructure;

    function renderNumber(config: Partial<InputNumber>) {
      structure = new FormStructure('Form', [new InputNumber('num', 'Number').apply(config)]);
      render(structure);
      return el<HTMLInputElement>('input#num');
    }

    it('removes non numeric characters', fakeAsync(() => {
      const input = renderNumber({});
      type(input, '12a');
      expect(structure.getControlById('num').value).toBe('12');
      flush();
    }));

    it('limits decimals to decimalCount', fakeAsync(() => {
      const input = renderNumber({ decimalCount: 2 });
      type(input, '1.234');
      expect(structure.getControlById('num').value).toBe('1.23');
      flush();
    }));

    it('removes decimals when decimalCount is 0', fakeAsync(() => {
      const input = renderNumber({ decimalCount: 0 });
      type(input, '7.5');
      expect(structure.getControlById('num').value).toBe('7');
      flush();
    }));

    it('clamps to max and min', fakeAsync(() => {
      const input = renderNumber({ min: 5, max: 10 });
      type(input, '50');
      expect(structure.getControlById('num').value).toBe('10');
      type(input, '1');
      expect(structure.getControlById('num').value).toBe('5');
      flush();
    }));

    it('allows negative numbers', fakeAsync(() => {
      const input = renderNumber({});
      type(input, '-3');
      expect(structure.getControlById('num').value).toBe('-3');
      flush();
    }));

    it('does not touch the value while deleting', fakeAsync(() => {
      const input = renderNumber({ min: 5 });
      type(input, '1', 'deleteContentBackward');
      expect(structure.getControlById('num').value).toBe('1');
      flush();
    }));
  });

  describe('buttons and validate actions', () => {
    it('disables validateForm actions while the form is invalid', fakeAsync(() => {
      const structure = new FormStructure('Form', [new Input('name', 'Name').apply({ validator: Validators.required })], [
        new Button('save', 'Save', { style: 'primary' }).apply({ validateForm: true }),
        new Button('cancel', 'Cancel', { style: 'warn' }),
      ]);
      render(structure);

      expect(el<HTMLButtonElement>('button#save').disabled).toBeTrue();
      expect(el<HTMLButtonElement>('button#cancel').disabled).toBeFalse();

      type(el('input#name'), 'ok');
      expect(el<HTMLButtonElement>('button#save').disabled).toBeFalse();
      flush();
    }));

    it('disables actions whose validation returns false', fakeAsync(() => {
      const structure = new FormStructure('Form', [new Input('name', 'Name')], [
        new Button('find', 'Find', {}).apply({ validation: p => p.structure.getControlById('name').value?.length > 0 })
      ]);
      render(structure);
      expect(el<HTMLButtonElement>('button#find').disabled).toBeTrue();

      type(el('input#name'), 'x');
      expect(el<HTMLButtonElement>('button#find').disabled).toBeFalse();
      flush();
    }));

    it('checks disabled controls when validateEvenDisabled is true', fakeAsync(() => {
      const structure = new FormStructure('Form', [
        new Input('locked', 'Locked').apply({ disabled: true, validator: Validators.required })
      ], [new Button('save', 'Save', {}).apply({ validateForm: true })]);
      structure.validateEvenDisabled = true;
      render(structure);

      expect(el<HTMLButtonElement>('button#save').disabled).toBeTrue();
      expect(structure.getControlById('locked').disabled).toBeTrue();
      flush();
    }));

    ['standard', 'outline', 'fill'].forEach((appearance: any) => {
      it(`runs a validate action once per click (${appearance})`, fakeAsync(() => {
        const onEvent = jasmine.createSpy('onEvent');
        const structure = new FormStructure('Form', [new Input('a', 'A')], [new Button('go', 'Go', { onEvent })]);
        structure.appearance = appearance;
        render(structure);
        flush();

        el<HTMLButtonElement>('button#go').click();
        expect(onEvent).toHaveBeenCalledTimes(1);
      }));

      it(`runs a node button deprecated callback once per click (${appearance})`, fakeAsync(() => {
        const onClick = jasmine.createSpy('onClick');
        const structure = new FormStructure('Form', [new Button('go', 'Go', { callback: { onClick, onEvent: () => { } } })]);
        structure.appearance = appearance;
        render(structure);
        flush();

        el<HTMLButtonElement>('button#go').click();
        expect(onClick).toHaveBeenCalledTimes(1);
      }));

      it(`renders validate actions without action config (${appearance})`, fakeAsync(() => {
        const structure = new FormStructure('Form', [new Input('a', 'A')], [new Button('go', 'Go', undefined)]);
        structure.appearance = appearance;
        expect(() => { render(structure); flush(); }).not.toThrow();
        expect(el('button#go')).not.toBeNull();
      }));
    });

    it('does not fail clicking a node button whose callback has no onClick', fakeAsync(() => {
      const onEvent = jasmine.createSpy('onEvent');
      render(new FormStructure('Form', [new Button('go', 'Go', { onEvent, callback: {} as any })]));
      flush();

      expect(() => el<HTMLButtonElement>('button#go').click()).not.toThrow();
      expect(onEvent).toHaveBeenCalledTimes(1);
    }));
  });

  describe('custom nodes', () => {
    it('creates the component with its properties and the form control', fakeAsync(() => {
      const node = new CustomNode<TestCustomInputComponent>('custom', TestCustomInputComponent, { label: 'Custom label' });
      const structure = new FormStructure('Form', [node]);
      render(structure);
      flush();
      fixture.detectChanges();

      expect(node.instance instanceof TestCustomInputComponent).toBeTrue();
      expect(node.instance.control).toBe(structure.getControlById('custom') as FormControl);
      expect(host.textContent).toContain('Custom label');

      const input = el<HTMLInputElement>('input.custom-input');
      input.value = 'from custom';
      input.dispatchEvent(new Event('input'));
      expect(structure.getValue()).toEqual({ custom: 'from custom' } as any);
    }));
  });

  describe('focus and layout', () => {
    it('focuses the node marked with autoFocus', fakeAsync(() => {
      const focus = spyOn(HTMLElement.prototype, 'focus');
      render(new FormStructure('Form', [new Input('a', 'A'), new Input('b', 'B').apply({ autoFocus: true })]));
      flush();
      expect(focus.calls.mostRecent().object.id).toBe('b');
    }));

    it('limits the content height when onlyScrollContent is true', fakeAsync(() => {
      const structure = new FormStructure('Form', [new Input('a', 'A')]);
      structure.onlyScrollContent = true;
      structure.maxParentHeight = '500px';
      render(structure);
      flush();

      expect(el('#mdf_content').style.overflowY).toBe('auto');
      expect(el('#mdf_content').style.maxHeight).toMatch(/calc\(.*px\)/);
    }));

    it('stops listening to window resize after being destroyed', fakeAsync(() => {
      const add = spyOn(window, 'addEventListener').and.callThrough();
      const remove = spyOn(window, 'removeEventListener').and.callThrough();
      render(new FormStructure('Form', [new Input('a', 'A')]));
      flush();

      const listener = add.calls.all().find(c => c.args[0] === 'resize')?.args[1];
      expect(listener).toBeDefined();

      fixture.componentInstance.structure = null;
      fixture.detectChanges();
      expect(remove).toHaveBeenCalledWith('resize', listener);
    }));
  });

  describe('component helpers', () => {
    it('displayFn shows the option title', fakeAsync(() => {
      render(new FormStructure('Form', [new Input('a', 'A')]));
      expect(component().displayFn(new OptionChild('Title', 'v'))).toBe('Title');
      expect(component().displayFn(undefined)).toBe('');
      flush();
    }));
  });
});
