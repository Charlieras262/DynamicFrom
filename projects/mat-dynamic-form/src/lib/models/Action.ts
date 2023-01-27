import { ActionType, ActionStyle } from "../types/ActionEnums";
import { FormListener } from "../interfaces/FormListener";
import { FormStructure } from './FormStructure';

export interface Action {
    type?: ActionType;
    style?: ActionStyle;
    /**
     * @deprecated Since version 1.4.0. Will be deleted in version 2.0.0. Use {@link Action.onEvent} instead
     */
    callback?: FormListener;
    onEvent?: (param: ActionEvent) => void;
}

export interface ActionEvent {
    event: Event | any;
    structure: FormStructure;
}