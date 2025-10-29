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
type NodeType = 'input' | 'checkbox' | 'dropdown' | 'button' | 'date' | 'radiogroup' | 'textarea' | 'file' | 'password' | 'number' | 'switch' | 'custom' | 'autocomplete' | 'datetime' | 'daterange';

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
    public autoFocus?: boolean;

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
    constructor(id, placeholder, type: NodeType, singleLine, icon, errorMessage, disabled, validator, asyncValidator, action, autoFocus = false) {
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
        this.autoFocus = autoFocus;
    }

    getNativeElement() {
        return document.getElementById(this.id);
    }
}

export class InputBaseNode extends NodeBase {
    public value?: any;
    public readOnly: boolean;
    
    constructor(id, placeholder, type: NodeType, value?, singleLine?, icon?, errorMessage?, disabled?, readOnly?, validator?, asyncValidator?, action?) {
        super(id, placeholder, type, singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.value = value;
        this.readOnly = readOnly ?? false;
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

export class SelectableNode extends NodeBase {
    public selectedValue?: string;
    private _value: OptionChild[];

    /**
     * Creates an instance of a selectable node.
     * 
     * Disclaimer: It is not posible to create an instance of this class directly, use one of its subclasses instead.
     * 
     * @param id The id of the node in the DOM.
     * @param placeholder The placeholder text to display.
     * @param value The options to display in the selectable node. This can be an array of {@link OptionChild}, a Promise that resolves to an array of {@link OptionChild}, or an Observable that emits an array of {@link OptionChild}.
     * @param selectedValue The initial selected value of the node.
     * @param singleLine Whether the node should be displayed in a single line.
     * @param icon The icon to display in the node.
     * @param errorMessage The error message to display when the node is invalid.
     * @param disabled Whether the node is disabled.
     * @param validator The synchronous validators to apply to the node.
     * @param asyncValidator The asynchronous validators to apply to the node.
     * @param action The action(s) to execute when an event occurs on the node.
     */
    protected constructor(id, placeholder, value, selectedValue, singleLine, icon, errorMessage, disabled, validator, asyncValidator, action) {
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

export class Input extends InputBaseNode {
    public maxCharCount?: number;
    public minCharCount?: number;

    constructor(id, placeholder?, value?, maxCharCount?, singleLine?, icon?, errorMessage?, disabled?, readOnly?, validator?, asyncValidator?, action?) {
        super(id, placeholder, 'input', singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.value = value;
        this.maxCharCount = maxCharCount;
    }

    editable() {
        this.readOnly = false;
    }

    readonly() {
        this.readOnly = true;
    }
}

export class InputFile extends InputBaseNode {
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
        this.type = 'autocomplete';
        this.multiple = multiple ?? false;
        super.value = value;
    }

    protected onOptionLoaded(options: OptionChild[]): void {
        super.onOptionLoaded(options);
        this.filteredOptions?.next(options);
    }
}

export class DatePicker extends InputBaseNode {
    public minDate: Date;
    public maxDate: Date;

    constructor(id, placeholder?, value?, singleLine?, icon?, errorMessage?, disabled?, validator?, asyncValidator?, action?, minDate?, maxDate?) {
        super(id, placeholder, 'date', singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.value = value;
        this.minDate = minDate;
        this.maxDate = maxDate;
    }
}

export class DateTimePicker extends InputBaseNode {
    public minDate: Date;
    public maxDate: Date;
    /**
     * The date format to display the selected dates.
     * @example 'dd-MM-yyyy hh:mm a'
     */
    public dateFormat?: string;
    public acceptLabel?: string;
    public cancelLabel?: string;

    constructor(id, placeholder?, value?, dateFormat?, singleLine?, icon?, errorMessage?, disabled?, validator?, asyncValidator?, action?, minDate?, maxDate?, acceptLabel?, cancelLabel?) {
        super(id, placeholder, 'datetime', singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.value = value;
        this.minDate = minDate;
        this.maxDate = maxDate;
        this.dateFormat = dateFormat;
        this.acceptLabel = acceptLabel ?? 'Accept';
        this.cancelLabel = cancelLabel ?? 'Cancel';
    }
}

export class DateRangePicker extends InputBaseNode {
    public startDate?: string
    public endDate?: string
    public minDate: Date;
    public maxDate: Date;

    constructor(id, placeholder?, startDate?, endDate?, singleLine?, icon?, errorMessage?, disabled?, validator?, asyncValidator?, action?, minDate?, maxDate?) {
        super(id, placeholder, 'daterange', singleLine, icon, errorMessage, disabled, validator, asyncValidator, action);
        this.startDate = startDate;
        this.endDate = endDate;
        this.minDate = minDate;
        this.maxDate = maxDate;
    }
}

export class Button extends NodeBase {
    public validateForm?: boolean;
    public validation?: (param: ActionEvent) => boolean;

    constructor(id: string, placeholder: string, action: Action, singleLine?: boolean, icon?, disabled?: boolean, validateForm?: boolean, validation?: (param: ActionEvent) => boolean) {
        super(id, placeholder, 'button', singleLine, icon, undefined, disabled, undefined, undefined, action);
        this.validateForm = validateForm;
        this.validation = validation ?? (() => true);
    }
}
