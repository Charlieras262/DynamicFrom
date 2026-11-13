import { Validators } from '@angular/forms';
import { ApplyBlock } from '../../../public-api';
import { FormStructure } from '../FormStructure';
import { Button, DatePicker, Dropdown, Input } from '../Node';
import { OptionChild } from '../OptionChild';

describe('ObjectBase.apply', () => {

  describe('with an object', () => {
    it('assigns every property and returns the same instance', () => {
      const node = new Input('name', 'Name');
      const result = node.apply({ icon: 'person', maxCharCount: 10 });

      expect(result).toBe(node);
      expect(node.icon).toBe('person');
      expect(node.maxCharCount).toBe(10);
    });

    it('assigns function-valued properties instead of calling them', () => {
      const validation = jasmine.createSpy('validation').and.returnValue(false);
      const button = new Button('save', 'Save', {}).apply({ validation });

      expect(button.validation).toBe(validation);
      expect(validation).not.toHaveBeenCalled();
    });

    it('goes through setters', () => {
      const structure = new FormStructure().apply({ nodeGrid: 9 });
      expect(structure.nodeGrid).toBe(4);
    });
  });

  describe('with a callback', () => {
    it('calls the block once with the instance and returns the same instance', () => {
      const node = new Input('name', 'Name');
      const block = jasmine.createSpy('block');

      const result = node.apply(block);

      expect(block).toHaveBeenCalledOnceWith(node);
      expect(result).toBe(node);
    });

    it('lets the block change the instance through its parameter', () => {
      const node = new Input('name', 'Name').apply(input => {
        input.icon = 'person';
        input.maxCharCount = 100;
        input.readonly();
      });

      expect(node.icon).toBe('person');
      expect(node.maxCharCount).toBe(100);
      expect(node.readOnly).toBeTrue();
    });

    it('binds this to the instance for function expressions, like Kotlin apply', () => {
      const node = new Input('name', 'Name').apply(function () {
        this.hint = 'Your full name';
      });

      expect(node.hint).toBe('Your full name');
    });

    it('allows logic that an object literal cannot express', () => {
      const today = new Date(2025, 0, 15);
      const node = new DatePicker('end', 'End').apply(picker => {
        picker.minDate = today;
        picker.maxDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        if (picker.maxDate.getMonth() === 1) picker.hint = 'Until February';
      });

      expect(node.maxDate).toEqual(new Date(2025, 1, 15));
      expect(node.hint).toBe('Until February');
    });

    it('ignores the value returned by the block', () => {
      const node = new Input('name', 'Name');
      const result = node.apply(() => 'something else' as any);
      expect(result).toBe(node);
    });

    it('propagates errors thrown by the block', () => {
      const node = new Input('name', 'Name');
      expect(() => node.apply(() => { throw new Error('boom'); })).toThrowError('boom');
    });

    it('works on every class of the library', () => {
      const option = new OptionChild('One', '1').apply(o => o.title = 'Uno');
      const structure = new FormStructure().apply(s => {
        s.title = 'Sign Up';
        s.globalValidators = Validators.required;
        s.nodes = [new Dropdown('status', 'Status', [option])];
      });

      expect(option.title).toBe('Uno');
      expect(structure.title).toBe('Sign Up');
      expect(structure.nodes.length).toBe(1);
    });

    it('accepts reusable blocks typed with ApplyBlock', () => {
      const required: ApplyBlock<Input> = input => {
        input.validator = Validators.required;
        input.errorMessage = 'This field is required';
      };

      const name = new Input('name', 'Name').apply(required);
      const email = new Input('email', 'Email').apply(required);

      expect(name.validator).toBe(Validators.required);
      expect(email.errorMessage).toBe('This field is required');
    });

    it('can be chained with the object form', () => {
      const node = new Input('name', 'Name')
        .apply({ icon: 'person' })
        .apply(input => input.maxCharCount = input.icon.length);

      expect(node.maxCharCount).toBe(6);
    });
  });
});
