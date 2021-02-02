export class OptionChild {
    title: string;
    value?: string;
    selected?: boolean;

    constructor(title: string, value: string, selected?: boolean) {
        this.title = title;
        this.value = value;
        this.selected = selected ? selected : false;
    }
}