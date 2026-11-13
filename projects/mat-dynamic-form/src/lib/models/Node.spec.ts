import { fakeAsync, tick } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  AutoComplete, Button, Checkbox, CustomNode, DatePicker, DateRangePicker, DateTimePicker, Dropdown,
  Input, InputFile, InputNumber, InputPassword, RadioGroup, Switch, TextArea, TimePicker
} from './Node';
import { OptionChild } from './OptionChild';

class DummyComponent { }

const options = () => [new OptionChild('One', '1'), new OptionChild('Two', '2')];

describe('Node models', () => {

  describe('ObjectBase.apply', () => {
    it('assigns every given property and returns the same instance', () => {
      const node = new Input('name', 'Name');
      const result = node.apply({ hint: 'hint', icon: 'person', maxCharCount: 10 });

      expect(result).toBe(node);
      expect(node.hint).toBe('hint');
      expect(node.icon).toBe('person');
      expect(node.maxCharCount).toBe(10);
    });
  });

  describe('Input family positional constructor arguments', () => {
    const action = { type: 'change' as const };

    it('Input maps every argument to its own property', () => {
      const node = new Input('id', 'Label', 'val', 20, true, 'icon', 'err', true, true, Validators.required, null, action);

      expect(node.type).toBe('input');
      expect(node.value).toBe('val');
      expect(node.maxCharCount).toBe(20);
      expect(node.singleLine).toBeTrue();
      expect(node.icon).toBe('icon');
      expect(node.errorMessage).toBe('err');
      expect(node.disabled).toBeTrue();
      expect(node.readOnly).toBeTrue();
      expect(node.validator).toBe(Validators.required);
      expect(node.action).toBe(action);
    });

    it('InputPassword, TextArea and InputNumber keep the Input mapping with their own type', () => {
      const password = new InputPassword('p', 'Pass', 'secret', 8, false, 'lock', 'err', false, true);
      const textArea = new TextArea('t', 'Text', 'hello', 100);
      const number = new InputNumber('n', 'Number', 5, 3);

      expect(password.type).toBe('password');
      expect(password.value).toBe('secret');
      expect(password.icon).toBe('lock');
      expect(password.readOnly).toBeTrue();
      expect(textArea.type).toBe('textarea');
      expect(textArea.maxCharCount).toBe(100);
      expect(number.type).toBe('number');
      expect(number.value).toBe(5);
    });

    it('Input exposes editable/readonly toggles', () => {
      const node = new Input('id');
      node.readonly();
      expect(node.readOnly).toBeTrue();
      node.editable();
      expect(node.readOnly).toBeFalse();
    });

    it('InputFile maps value, accept, icon, errorMessage and disabled', () => {
      const node = new InputFile('f', 'File', null, ['png'], true, 'icon', 'err', true);

      expect(node.type).toBe('file');
      expect(node.accept).toEqual(['png']);
      expect(node.singleLine).toBeTrue();
      expect(node.icon).toBe('icon');
      expect(node.errorMessage).toBe('err');
      expect(node.disabled).toBeTrue();
    });

    it('InputFile.executeStatusChange forwards to onStatusChange when defined', () => {
      const node = new InputFile('f');
      expect(() => node.executeStatusChange({ state: 'none' })).not.toThrow();

      const spy = jasmine.createSpy('onStatusChange');
      node.onStatusChange = spy;
      node.executeStatusChange({ state: 'valid' });
      expect(spy).toHaveBeenCalledWith({ state: 'valid' });
    });

    it('DatePicker maps value, disabled, validator, min and max dates', () => {
      const min = new Date(2020, 0, 1);
      const max = new Date(2030, 0, 1);
      const value = new Date(2025, 5, 5);
      const node = new DatePicker('d', 'Date', value, false, 'icon', 'err', true, Validators.required, null, undefined, min, max);

      expect(node.type).toBe('date');
      expect(node.value).toBe(value);
      expect(node.icon).toBe('icon');
      expect(node.errorMessage).toBe('err');
      expect(node.disabled).toBeTrue();
      expect(node.validator).toBe(Validators.required);
      expect(node.minDate).toBe(min);
      expect(node.maxDate).toBe(max);
    });

    it('DateTimePicker maps arguments and applies label defaults', () => {
      const node = new DateTimePicker('dt', 'When', null, 'dd/MM/yyyy', false, 'icon', 'err', true);

      expect(node.type).toBe('datetime');
      expect(node.dateFormat).toBe('dd/MM/yyyy');
      expect(node.icon).toBe('icon');
      expect(node.errorMessage).toBe('err');
      expect(node.disabled).toBeTrue();
      expect(node.acceptLabel).toBe('OK');
      expect(node.cancelLabel).toBe('Cancel');
      expect(node.showClockPicker).toBeFalse();
      expect(node.orientation).toBe('portrait');
    });

    it('TimePicker is a DateTimePicker with type timepicker', () => {
      const node = new TimePicker('t', 'Hour', null, 'hh:mm a');
      expect(node instanceof DateTimePicker).toBeTrue();
      expect(node.type).toBe('timepicker');
      expect(node.dateFormat).toBe('hh:mm a');
    });

    it('DateRangePicker maps start/end dates and disabled', () => {
      const node = new DateRangePicker('r', 'Range', '2025-01-01', '2025-01-31', false, 'icon', 'err', true);

      expect(node.type).toBe('daterange');
      expect(node.startDate).toBe('2025-01-01');
      expect(node.endDate).toBe('2025-01-31');
      expect(node.icon).toBe('icon');
      expect(node.disabled).toBeTrue();
    });
  });

  describe('Checkbox and Switch', () => {
    it('map value, disabled and validator', () => {
      const checkbox = new Checkbox('c', 'Check', true, false, 'icon', 'err', true, Validators.requiredTrue);
      const toggle = new Switch('s', 'Switch', false, true, undefined, undefined, true);

      expect(checkbox.type).toBe('checkbox');
      expect(checkbox.value).toBeTrue();
      expect(checkbox.disabled).toBeTrue();
      expect(checkbox.validator).toBe(Validators.requiredTrue);
      expect(toggle.type).toBe('switch');
      expect(toggle.value).toBeFalse();
      expect(toggle.singleLine).toBeTrue();
      expect(toggle.disabled).toBeTrue();
    });
  });

  describe('Selectable nodes', () => {
    it('Dropdown maps options, selected value, multiple, disabled and validator', () => {
      const node = new Dropdown('d', 'Pick', options(), '1', true, false, 'icon', 'err', true, Validators.required);

      expect(node.type).toBe('dropdown');
      expect(node.getOptions().length).toBe(2);
      expect(node.selectedValue).toBe('1');
      expect(node.multiple).toBeTrue();
      expect(node.disabled).toBeTrue();
      expect(node.validator).toBe(Validators.required);
    });

    it('RadioGroup maps disabled and validator to the right properties', () => {
      const node = new RadioGroup('r', 'Radio', options(), '2', false, undefined, undefined, true, Validators.required);

      expect(node.type).toBe('radiogroup');
      expect(node.selectedValue).toBe('2');
      expect(node.disabled).toBeTrue();
      expect(node.validator).toBe(Validators.required);
    });

    it('resolves options given as a Promise', fakeAsync(() => {
      const node = new Dropdown('d', 'Pick', Promise.resolve(options()));
      tick();
      expect(node.getOptions().length).toBe(2);
    }));

    it('resolves options given as an Observable', () => {
      const node = new Dropdown('d', 'Pick', of(options()));
      expect(node.getOptions().length).toBe(2);
    });

    it('AutoComplete subscribes only once to an options Observable (e.g. a single HTTP request)', () => {
      let subscriptions = 0;
      const source = new Observable<OptionChild[]>(observer => {
        subscriptions++;
        observer.next(options());
        observer.complete();
      });
      const node = new AutoComplete('a', 'Auto', source);

      expect(subscriptions).toBe(1);
      expect(node.filteredOptions.value.length).toBe(2);
    });

    it('AutoComplete exposes synchronous options in filteredOptions', () => {
      const node = new AutoComplete('a', 'Auto', options());
      expect(node.filteredOptions.value.length).toBe(2);
    });

    it('AutoComplete pushes loaded options to filteredOptions', fakeAsync(() => {
      const node = new AutoComplete('a', 'Auto', Promise.resolve(options()), '1');
      tick();
      expect(node.type).toBe('autocomplete');
      expect(node.filteredOptions.value.length).toBe(2);
    }));
  });

  describe('CustomNode', () => {
    it('maps component, properties, disabled and validator', () => {
      const node = new CustomNode('c', DummyComponent, { a: 1 }, 'Custom', false, undefined, undefined, true, Validators.required);

      expect(node.type).toBe('custom');
      expect(node.component).toBe(DummyComponent);
      expect(node.properties).toEqual({ a: 1 });
      expect(node.disabled).toBeTrue();
      expect(node.validator).toBe(Validators.required);
    });
  });

  describe('Button', () => {
    it('defaults validation to always true', () => {
      const button = new Button('b', 'Save', { style: 'primary' });

      expect(button.type).toBe('button');
      expect(button.validation({ event: null, structure: null })).toBeTrue();
    });

    it('keeps validateForm, disabled and a custom validation', () => {
      const validation = () => false;
      const button = new Button('b', 'Save', { style: 'primary' }, false, 'save', true, true, validation);

      expect(button.icon).toBe('save');
      expect(button.disabled).toBeTrue();
      expect(button.validateForm).toBeTrue();
      expect(button.validation).toBe(validation);
    });
  });
});
