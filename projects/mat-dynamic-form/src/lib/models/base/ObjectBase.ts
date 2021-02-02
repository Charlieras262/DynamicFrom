export class ObjectBase{
    apply<T extends ObjectBase>(options): T {
        return this.applyOption<T>(this, options)
    };

    private applyOption<T extends ObjectBase>(object: ObjectBase, options) {
        const keys = Object.keys(options)
        keys.map(option => {
            object[option] = options[option]
        });
        return object as T;
    }
}