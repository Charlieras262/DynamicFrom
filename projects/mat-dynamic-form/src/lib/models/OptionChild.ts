import { ObjectBase } from "./base/ObjectBase";

export class OptionChild extends ObjectBase {
    title: string;
    value?: string;
    selected?: boolean;

    constructor(title: string, value: string, selected?: boolean) {
        super();
        this.title = title;
        this.value = value;
        this.selected = selected ? selected : false;
    }
}