export default class Server extends Error {
	public readonly error: string|null;

	constructor(error: string|null) {
		super();
		this.name = 'ServerError';
		Object.setPrototypeOf(this, new.target.prototype);
		this.error = error;
	}
}
