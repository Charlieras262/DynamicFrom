import { ActionType, ActionStyle } from "../types/ActionEnums";
import { FormListener } from "../interfaces/FormListener";

export class Action{
    type?: ActionType = 'click';
    style?: ActionStyle;
    callback: FormListener;

    constructor(type: ActionType, style?: ActionStyle, callback?: FormListener){
        this.type = type;
        this.style = style == undefined ? 'primary' : style;
        this.callback = callback;
    }
}