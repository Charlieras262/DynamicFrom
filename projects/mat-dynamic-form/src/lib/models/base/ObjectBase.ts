export class ObjectBase {
    apply(options: this | {}): this {
        const keys = Object.keys(options)
        keys.map(option => {
            this[option] = options[option]
        });
        return this;
    }
}