/**
 * @deprecated Since version 1.4.0. Will be deleted in version 2.0.0. Use {@link Action.onEvent} instead
 */
export interface FormListener {
    onEvent(id: string, value: any): void
    onClick(actionId: string): void;
}