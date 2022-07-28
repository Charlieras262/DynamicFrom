import { ActionType, ActionStyle } from "../types/ActionEnums";
import { FormListener } from "../interfaces/FormListener";
import { FormStructure } from './FormStructure';

export class Action {
    type?: ActionType = 'click';
    style?: ActionStyle;
    /**
     * @deprecated Since version 1.4.0. Will be deleted in version 1.5.0. Use {@link Action.onEvent} instead
     */
    callback?: FormListener;
    onEvent?: (param: ActionEvent) => void;

    constructor(type: ActionType, style?: ActionStyle, callback?: FormListener, onEvent?: (param: ActionEvent) => void) {
        this.type = type;
        this.style = style == undefined ? 'primary' : style;
        this.callback = callback;
        this.onEvent = onEvent;
    }
}

export interface ActionEvent {
    event: Event | any;
    structure: FormStructure;
}