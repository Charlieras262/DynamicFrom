/**
 * @deprecated Since version 1.4.0. Will be deleted in version 1.5.0. Use {@link Action.onEvent} instead
 */
export interface FormListener {
    onEvent(id: string, value: any): void
    onClick(actionId: string): void;
}