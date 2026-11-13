/**
 * A block that configures an object, like the lambda of Kotlin's `apply`.
 * The object is received as parameter and, for `function` expressions, also as `this`.
 */
export type ApplyBlock<T> = (this: T, self: T) => void;

export class ObjectBase {
    /**
     * Configures the object in place and returns it, so it can be used inline (like Kotlin's `apply`).
     *
     * @example
     * // Assign properties from an object
     * new Input('name', 'Name').apply({ icon: 'person', maxCharCount: 100 });
     *
     * @example
     * // Run a block with the object (useful for logic, method calls or derived values)
     * new DatePicker('end', 'End').apply(picker => {
     *   picker.minDate = new Date();
     *   picker.maxDate = addMonths(picker.minDate, 1);
     * });
     *
     * @param block A function that receives the object (also bound to `this`). Its return value is ignored.
     * @returns The same instance.
     */
    apply(block: ApplyBlock<this>): this;
    /**
     * @param options The properties to assign. Function-valued properties are assigned, not called.
     * @returns The same instance.
     */
    apply(options: this | {}): this;
    apply(blockOrOptions: ApplyBlock<this> | this | {}): this {
        if (typeof blockOrOptions === 'function') {
            (blockOrOptions as ApplyBlock<this>).call(this, this);
            return this;
        }

        Object.keys(blockOrOptions).forEach(option => {
            this[option] = blockOrOptions[option];
        });
        return this;
    }
}
