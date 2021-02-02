export class ReferenceException extends Error {
    constructor(message: string) {
        super(message)

        this.name = 'ReferenceException';
        this.message = message
    }
}