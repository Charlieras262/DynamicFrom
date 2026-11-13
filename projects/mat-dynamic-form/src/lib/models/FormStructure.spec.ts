import { discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormGroup, Validators } from '@angular/forms';
import { ReferenceException } from '../exceptions/Exceptions';
import { AUTO_COMPLETE_VALUE_DELAY, AUTO_COMPLETE_VALUE_TIMEOUT } from '../utils/constants';
import { FormStructure } from './FormStructure';
import { AutoComplete, Button, Checkbox, DateRangePicker, Dropdown, Input, RadioGroup } from './Node';
import { OptionChild } from './OptionChild';

const countries = () => [new OptionChild('Guatemala', 'GT'), new OptionChild('Mexico', 'MX'), new OptionChild('Spain', 'ES')];

function build(nodes: any[], configure?: (s: FormStructure) => void): FormStructure {
  const structure = new FormStructure('Title', nodes);
  configure?.(structure);
  structure.setFromGroup(new FormGroup({}));
  structure.remapValues();
  return structure;
}

describe('FormStructure', () => {

  afterEach(() => document.querySelectorAll('[data-test-node]').forEach(e => e.remove()));

  function domInput(id: string): HTMLInputElement {
    const input = document.createElement('input');
    input.id = id;
    input.setAttribute('data-test-node', '');
    document.body.appendChild(input);
    return input;
  }

  describe('constructor', () => {
    it('stores title, nodes and actions and shows the title by default', () => {
      const nodes = [new Input('a')];
      const actions = [new Button('b', 'B', {})];
      const structure = new FormStructure('Title', nodes, actions);

      expect(structure.title).toBe('Title');
      expect(structure.nodes).toBe(nodes);
      expect(structure.validateActions).toBe(actions);
      expect(structure.showTitle).toBeTrue();
    });

    it('rejects more than 4 validate actions', () => {
      const actions = [1, 2, 3, 4, 5].map(i => new Button(`b${i}`, 'B', {}));
      expect(() => new FormStructure('t', [], actions)).toThrowError('No more than 4 actions are allowed.');
    });
  });

  describe('nodeGrid', () => {
    it('clamps values between 1 and 4', () => {
      const structure = new FormStructure();
      structure.nodeGrid = 0;
      expect(structure.nodeGrid).toBe(1);
      structure.nodeGrid = 9;
      expect(structure.nodeGrid).toBe(4);
      structure.nodeGrid = 3;
      expect(structure.nodeGrid).toBe(3);
    });
  });

  describe('form controls', () => {
    it('creates one control per value node with its initial value', () => {
      const structure = build([
        new Input('name', 'Name', 'John'),
        new Checkbox('agree', 'Agree', true),
        new Dropdown('status', 'Status', [new OptionChild('Single', 'SI')], 'SI'),
        new RadioGroup('pet', 'Pet', [new OptionChild('Yes', 'y')], 'y'),
      ]);

      expect(structure.fromGroupSize()).toBe(4);
      expect(structure.getValue()).toEqual({ name: 'John', agree: true, status: 'SI', pet: 'y' });
    });

    it('does not create controls for buttons', fakeAsync(() => {
      const structure = build([new Input('name'), new Button('go', 'Go', {})]);
      tick();
      expect(structure.fromGroupSize()).toBe(1);
      expect(structure.getControlById('go')).toBeNull();
    }));

    it('creates disabled controls for disabled nodes and exposes them only in the raw value', () => {
      const structure = build([new Input('a', 'A', 'x').apply({ disabled: true }), new Input('b', 'B', 'y')]);

      expect(structure.getControlById('a').disabled).toBeTrue();
      expect(structure.getValue()).toEqual({ b: 'y' } as any);
      expect(structure.getRawValue()).toEqual({ a: 'x', b: 'y' } as any);
    });

    it('creates a start/end group for DateRangePicker', () => {
      const start = new Date(2025, 0, 1);
      const structure = build([new DateRangePicker('range', 'Range').apply({ startDate: start as any })]);
      const group = structure.getControlById('range') as FormGroup;

      expect(group instanceof FormGroup).toBeTrue();
      expect(group.get('start').value).toBe(start);
      expect(group.get('end').value).toBeNull();
    });

    it('combines node validators with global validators', () => {
      const structure = build(
        [new Input('a', 'A', 'abcdef').apply({ validator: Validators.maxLength(3) }), new Input('b')],
        s => s.globalValidators = Validators.required
      );

      expect(structure.getControlById('a').hasError('maxlength')).toBeTrue();
      expect(structure.getControlById('b').hasError('required')).toBeTrue();
      expect(structure.isInvalid()).toBeTrue();
      expect(structure.isValid()).toBeFalse();
    });

    it('addValidators keeps existing validators', () => {
      const structure = build([new Input('a', 'A', '').apply({ validator: Validators.required })]);
      structure.patchValue({ a: 'abcdef' });
      structure.addValidators('a', Validators.maxLength(3));

      expect(structure.getControlById('a').hasError('maxlength')).toBeTrue();
      structure.patchValue({ a: '' });
      expect(structure.getControlById('a').hasError('required')).toBeTrue();
    });

    it('setValidator replaces existing validators', () => {
      const structure = build([new Input('a', 'A', '').apply({ validator: Validators.required })]);
      structure.setValidator('a', Validators.maxLength(3));

      expect(structure.getControlById('a').valid).toBeTrue();
    });

    it('remapValues restores the initial node values after reset', () => {
      const structure = build([new Input('a', 'A', 'initial')]);
      structure.patchValue({ a: 'changed' });
      expect(structure.reset()).toBeTrue();
      expect(structure.getValue()).toEqual({ a: null } as any);

      structure.remapValues();
      expect(structure.getValue()).toEqual({ a: 'initial' } as any);
    });

    it('remapValues applies the current disabled flag of each node', () => {
      const node = new Input('a', 'A', 'x');
      const structure = build([node]);
      node.disabled = true;
      structure.remapValues();
      expect(structure.getControlById('a').disabled).toBeTrue();
    });
  });

  describe('patchValue', () => {
    it('returns false when there is no form group', () => {
      expect(new FormStructure('t', []).patchValue({ a: 1 })).toBeFalse();
    });

    it('sets known controls and throws ReferenceException for unknown ids', () => {
      const structure = build([new Input('a')]);
      expect(structure.patchValue({ a: 'v' })).toBeTrue();
      expect(structure.getValue()).toEqual({ a: 'v' } as any);
      expect(() => structure.patchValue({ missing: 'v' })).toThrowError(ReferenceException);
    });
  });

  describe('getNodeById / getActionById', () => {
    it('returns the node with the current control value', () => {
      const structure = build([new Input('a', 'A', 'x')]);
      structure.patchValue({ a: 'y' });
      expect(structure.getNodeById<Input>('a').value).toBe('y');
    });

    it('returns undefined for unknown ids instead of throwing', () => {
      const structure = build([new Input('a')]);
      structure.getFormGroup().addControl('orphan', new FormGroup({}));
      expect(() => structure.getNodeById('orphan')).not.toThrow();
      expect(structure.getNodeById('nope')).toBeUndefined();
    });

    it('finds validate actions by id', () => {
      const save = new Button('save', 'Save', {});
      const structure = new FormStructure('t', [], [save]);
      expect(structure.getActionById('save')).toBe(save);
    });
  });

  describe('dynamic nodes', () => {
    it('createNodes inserts nodes at the position and creates their controls', () => {
      const structure = build([new Input('a'), new Input('c')]);
      structure.createNodes(1, [new Input('b', 'B', 'vb')]);

      expect(structure.nodes.map(n => n.id)).toEqual(['a', 'b', 'c']);
      expect(structure.getControlById('b').value).toBe('vb');
    });

    it('createNodes does not duplicate an existing node', () => {
      const structure = build([new Input('a')]);
      structure.createNodes(0, [new Input('a')]);
      expect(structure.nodes.length).toBe(1);
    });

    it('removeNodes removes the node and its control', () => {
      const b = new Input('b');
      const structure = build([new Input('a'), b]);
      structure.removeNodes([b]);

      expect(structure.nodes.map(n => n.id)).toEqual(['a']);
      expect(structure.getControlById('b')).toBeNull();
    });

    it('createValidateActions / removeValidateActions manage the actions list', fakeAsync(() => {
      const structure = new FormStructure('t', []);
      const save = new Button('save', 'Save', {});
      structure.createValidateActions(0, [save]);
      structure.createValidateActions(0, [save]);
      tick();
      expect(structure.validateActions).toEqual([save]);

      structure.removeValidateActions([save]);
      expect(structure.validateActions).toEqual([]);
    }));
  });

  describe('node events', () => {
    it('fires valueChange actions on every value change, including back to the initial value', fakeAsync(() => {
      const onEvent = jasmine.createSpy('onEvent');
      const structure = build([new Input('a', 'A', 'initial').apply({ action: { type: 'valueChange', onEvent } })]);
      tick();

      structure.patchValue({ a: 'other' });
      structure.patchValue({ a: 'initial' });

      expect(onEvent).toHaveBeenCalledTimes(2);
      expect(onEvent.calls.mostRecent().args[0].event).toBe('initial');
      expect(onEvent.calls.mostRecent().args[0].structure).toBe(structure);
    }));

    it('fires DOM event actions registered on the node element', fakeAsync(() => {
      const input = domInput('dom-event-node');
      const onEvent = jasmine.createSpy('onEvent');
      const structure = build([new Input('dom-event-node', 'A', '').apply({ action: { type: 'change', onEvent } })]);
      tick();

      structure.patchValue({ 'dom-event-node': 'typed' });
      input.dispatchEvent(new Event('change'));
      expect(onEvent).toHaveBeenCalledTimes(1);
    }));

    it('supports an array of actions', fakeAsync(() => {
      const first = jasmine.createSpy('first');
      const second = jasmine.createSpy('second');
      const structure = build([new Input('a').apply({
        action: [{ type: 'valueChange', onEvent: first }, { type: 'valueChange', onEvent: second }]
      })]);
      tick();
      structure.patchValue({ a: 'x' });

      expect(first).toHaveBeenCalled();
      expect(second).toHaveBeenCalled();
    }));

    it('fires button click actions once per click', fakeAsync(() => {
      const button = document.createElement('button');
      button.id = 'go';
      button.setAttribute('data-test-node', '');
      document.body.appendChild(button);
      const onEvent = jasmine.createSpy('onEvent');
      const onClick = jasmine.createSpy('onClick');
      build([new Button('go', 'Go', { onEvent, callback: { onClick, onEvent: () => { } } })]);
      tick();

      button.click();
      expect(onEvent).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledOnceWith('go');
    }));
  });

  describe('AutoComplete', () => {
    it('selects the option matching selectedValue once options are loaded', fakeAsync(() => {
      const structure = build([new AutoComplete('country', 'Country', Promise.resolve(countries()), 'mx')]);
      tick(AUTO_COMPLETE_VALUE_DELAY * 2);

      expect(structure.getControlById('country').value).toEqual(jasmine.objectContaining({ value: 'MX' }));
    }));

    it('filters options by the typed text', fakeAsync(() => {
      const node = new AutoComplete('country', 'Country', countries());
      const structure = build([node]);
      tick(AUTO_COMPLETE_VALUE_DELAY);

      structure.patchValue({ country: 'gua' });
      expect(node.filteredOptions.value.map(o => o.value)).toEqual(['GT']);
    }));

    it('filters options without a value', fakeAsync(() => {
      const node = new AutoComplete('x', 'X', [new OptionChild('Only title', undefined)]);
      const structure = build([node]);
      tick(AUTO_COMPLETE_VALUE_DELAY);

      expect(() => structure.patchValue({ x: 'only' })).not.toThrow();
      expect(node.filteredOptions.value.length).toBe(1);
    }));

    it('does not raise errors when options never load', fakeAsync(() => {
      const errors: any[] = [];
      const original = window.onerror;
      build([new AutoComplete('country', 'Country', new Promise(() => { }), 'GT')]);

      expect(() => {
        tick(AUTO_COMPLETE_VALUE_DELAY * (AUTO_COMPLETE_VALUE_TIMEOUT + 2));
        flush();
      }).not.toThrow();
      window.onerror = original;
      expect(errors).toEqual([]);
    }));

    it('does not fail when selectedValue is not set', fakeAsync(() => {
      const structure = build([new AutoComplete('country', 'Country', Promise.resolve(countries()))]);
      expect(() => {
        tick(AUTO_COMPLETE_VALUE_DELAY * 2);
        flush();
      }).not.toThrow();
      expect(structure.getControlById('country').value).toBe('');
      discardPeriodicTasks();
    }));
  });
});
