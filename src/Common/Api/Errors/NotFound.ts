export default class NotFound extends Error {
	public readonly error: string;

	constructor(error: string) {
		super();
		this.name = 'NotFoundError';
		Object.setPrototypeOf(this, new.target.prototype);
		this.error = error;
	}
}
