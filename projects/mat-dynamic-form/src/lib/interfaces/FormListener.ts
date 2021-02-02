export interface FormListener {
    onEvent(id: string, value: any): void
    onClick(actionId: string): void;
}