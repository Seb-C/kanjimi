export default class Conflict extends Error {
	public readonly error: string;

	constructor(error: string) {
		super();
		this.name = 'ConflictError';
		Object.setPrototypeOf(this, new.target.prototype);
		this.error = error;
	}
}
