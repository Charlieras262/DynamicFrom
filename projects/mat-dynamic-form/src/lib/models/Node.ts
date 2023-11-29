import { Type } from "@angular/core";
import { ValidatorFn, AbstractControlOptions, AsyncValidatorFn } from "@angular/forms"
import { Action, ActionEvent } from "./Action";
import { ObjectBase } from "./base/ObjectBase";
import { OptionChild } from "./OptionChild";
import { Observable, BehaviorSubject } from 'rxjs';
import { FileChange } from "../interfaces/FileChange.interface";

export type Node = Input | Checkbox | RadioGroup | Dropdown | TextArea | DatePicker | InputFile | InputNumber | InputPassword
export type Validator = ValidatorFn | ValidatorFn[] | null;
export type AsyncValidator = AsyncValidatorFn | AsyncValidatorFn[] | null;
type NodeType = 'input' | 'checkbox' | 'dropdown' | 'button' | 'date' | 'radiogroup' | 'textarea' | 'file' | 'password' | 'number' | 'switch' | 'custom' | 'autocomplete';

/**
 * @description Esta es la estructura general del nodo que se quiere mostrar en el DOM. 
 * 
 * @param T Es el tipo de evento que se quiere implementar al nodo.
 */
class NodeBase extends ObjectBase {
    public id: string;
    public placeholder?: string;
    public type?: NodeType;
    public action?: Action | Action[];
    public singleLine?: boolean;
    public icon?: string;
    public errorMessage?: string;
    public disabled?: boolean;
    public validator?: Validator | AbstractControlOptions;
    public asyncValidator?: AsyncValidatorFn;
    public hint?: string;

    /**
     * @description Crea una instancia de un nodo con los parametros que se le envien.
     * 
     * @param id Es el identificador del nodo en el DOM
     * @param placeholder Es el texto que se muestra como sugerencia.
     * @param type Es el tipo de nodo ({@link NodeType}) que se creará en el DOM.
     * @param value Es el valor inicial que tendra el nodo al crearce en el DOM, este parametro es opcional
     * sino se desea utilizar se deberá enviar {@link undefined} en su lugar.
     * @param action Es la acción {@link Action} a ejecutar dependiendo del evento asignado, este parametro es opcional
     * sino se desea utilizar se deberá enviar {@link undefined} en su lugar.
     */
    constructor(id, placeholder, type: NodeType, singleLine, icon, errorMessage, disabled, validator, asyncValidator, action) {
        super();
        this.id = id;
        this.placeholder = placeholder;
        this.type = type;
        this.singleLine = singleLine ?? false;
        this.icon = icon;
        this.errorMessage = errorMessage;
        this.disabled = disabled;
        this.validator = validator;
        this.asyncValidator = asyncValidator
        this.action = action;
    }

    getNativeElement() {
        return document.getElementById(this.id);
    }
}

export class CustomNode<T> extends NodeBase {
    public component: Type<T>;
    public instance: T;
    public properties?: { [key: string]: any };

    constructor(id, component, properties?, placeholder?, singleLine?, icon?, errorMessage?, disabled?, validator?, asyncValidator?, action?) {
        super(id, placeholder, 'custom', singleLine, icon, errorMessage, validator, disabled, asyncValidator, action);
        this.properties = properties;
        this.component = component;
    }
}

class SelectableNode extends NodeBase {
    public selectedValue?: string;
    private _value: OptionChild[];

    constructor(id, placeholder, value, selectedValue, singleLine, icon, errorMessage, disabled, validator, asyncValidator, action) {
        super(id, placeholder, 'button', singleLine, icon, errorMessage, validator, disabled, asyncValidator, action);
        this.value = value
        this.selectedValue = selectedValue
    }

    public set value(v: OptionChild[] | Promise<OptionChild[]> | Observable<OptionChild[]>) {
        if (v instanceof Promise) this.handlePromise(v);
        else if (v instanceof Observable) this.handleObservable(v);
        else this.onOptionLoaded(v);
    }


    public get value() {
        return this._value;
    }

    getOptions() {
        return this._value;
    }

    private handleObservable(value: Observable<OptionChild[]>): OptionChild[] {
        const obs = value.subscribe(res => {
            this.onOptionLoaded(res)
            obs.unsubscribe();
        });

        return this._value;
    }

    private handlePromise(value: Promise<OptionChild[]>): OptionChild[] {
        value.then(res => {
            this.onOptionLoaded(res)
        });

        return this._value;
    }

    protected onOptionLoaded(options: OptionChild[]) {
        this._value = options;
    }
}

export class Checkbox extends NodeBase {
    public value?: boolean;

    constructor(id, placeholder?, value?, singleLine?, icon?, errorMessage?, disabled?, validator?, asyncValidator?, action?) {
        super(id, placeholder, 'checkbox', singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.value = value
    }
}

export class Switch extends NodeBase {
    public value?: boolean;

    constructor(id, placeholder?, value?, singleLine?, icon?, errorMessage?, disabled?, validator?, asyncValidator?, action?) {
        super(id, placeholder, 'switch', singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.value = value
    }
}

export class Input extends NodeBase {
    public value?: string;
    public maxCharCount?: number;
    public minCharCount?: number;
    public readOnly: boolean;

    constructor(id, placeholder?, value?, maxCharCount?, singleLine?, icon?, errorMessage?, disabled?, readOnly?, validator?, asyncValidator?, action?) {
        super(id, placeholder, 'input', singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.value = value;
        this.maxCharCount = maxCharCount;
        this.readOnly = readOnly;
    }

    editable() {
        this.readOnly = false;
    }

    readonly() {
        this.readOnly = true;
    }
}

export class InputFile extends NodeBase {
    public value?: string;
    public accept?: string[];
    public filename?: string;
    public maxSize?: number;
    public dragLabel?: string;
    public downloadHint?: string;
    public removeHint?: string;
    public retryHint?: string;
    public onStatusChange?: (value: FileChange) => void;

    constructor(id, placeholder?, value?, accept?, singleLine?, icon?, errorMessage?, disabled?, validator?, asyncValidator?, action?) {
        super(id, placeholder, 'file', singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.accept = accept;
        this.value = value;
    }

    executeStatusChange(value: FileChange) {
        this.onStatusChange?.(value);
    }
}

export class InputPassword extends Input {

    constructor(id, placeholder?, value?, maxCharCount?, singleLine?, icon?, errorMessage?, disabled?, readOnly?, validator?, asyncValidator?, action?) {
        super(id, placeholder, value, maxCharCount, singleLine, icon, errorMessage, disabled, readOnly, validator, asyncValidator, action);
        this.type = 'password';
    }
}

export class TextArea extends Input {
    constructor(id, placeholder?, value?, maxCharCount?, singleLine?, icon?, errorMessage?, disabled?, readOnly?, validator?, asyncValidator?, action?) {
        super(id, placeholder, value, maxCharCount, singleLine, icon, errorMessage, disabled, readOnly, validator, asyncValidator, action);
        this.type = 'textarea';
    }
}

export class InputNumber extends Input {
    min?: number;
    max?: number;
    decimalCount?: number;

    constructor(id, placeholder?, value?, maxCharCount?, singleLine?, icon?, errorMessage?, disabled?, readOnly?, validator?, asyncValidator?, action?) {
        super(id, placeholder, value, maxCharCount, singleLine, icon, errorMessage, disabled, readOnly, validator, asyncValidator, action);
        this.type = 'number';
    }
}

export class RadioGroup extends SelectableNode {

    constructor(id, placeholder?, value?, selected?, singleLine?, icon?, errorMessage?, disabled?, validator?, asyncValidator?, action?) {
        super(id, placeholder, value, selected, singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.type = 'radiogroup';
    }
}

export class Dropdown extends SelectableNode {
    multiple: boolean;

    constructor(id, placeholder?, value?, selected?, multiple?, singleLine?, icon?, errorMessage?, disabled?, validator?, asyncValidator?, action?) {
        super(id, placeholder, value, selected, singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.type = 'dropdown';
        this.multiple = multiple ?? false;
    }
}

export class AutoComplete extends SelectableNode {
    multiple: boolean;
    filteredOptions: BehaviorSubject<OptionChild[] | undefined> = new BehaviorSubject([]);

    constructor(id, placeholder?, value?, selected?, multiple?, singleLine?, icon?, errorMessage?, disabled?, validator?, asyncValidator?, action?) {
        super(id, placeholder, value, selected, singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.filteredOptions
        this.type = 'autocomplete';
        this.multiple = multiple ?? false;
        super.value = value;
    }

    protected onOptionLoaded(options: OptionChild[]): void {
        super.onOptionLoaded(options);
        this.filteredOptions?.next(options);
    }
}

export class DatePicker extends NodeBase {
    public value?: string;
    public minDate: Date;
    public maxDate: Date;

    constructor(id, placeholder?, value?, singleLine?, icon?, errorMessage?, disabled?, validator?, asyncValidator?, action?, minDate?, maxDate?) {
        super(id, placeholder, 'date', singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.value = value;
        this.minDate = minDate;
        this.maxDate = maxDate;
    }
}

export class Button extends NodeBase {
    public validateForm?: boolean;
    public validation?: (param: ActionEvent) => boolean;

    constructor(id: string, placeholder: string, action: Action, singleLine?: boolean, icon?, diabled?: boolean, validateForm?: boolean, validation?: (param: ActionEvent) => boolean) {
        super(id, placeholder, 'button', singleLine, icon, undefined, diabled, undefined, undefined, action);
        this.validateForm = validateForm;
        this.validation = validation ?? (() => true);
    }
}
