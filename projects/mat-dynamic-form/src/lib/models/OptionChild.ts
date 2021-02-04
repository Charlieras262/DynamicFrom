import { ObjectBase } from "./base/ObjectBase";

export class OptionChild extends ObjectBase {
    title: string;
    value?: string;

    constructor(title: string, value: string) {
        super();
        this.title = title;
        this.value = value;
    }
}