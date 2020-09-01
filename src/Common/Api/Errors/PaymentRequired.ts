export default class PaymentRequired extends Error {
	public readonly error: string;

	constructor(error: string) {
		super();
		this.name = 'PaymentRequiredError';
		Object.setPrototypeOf(this, new.target.prototype);
		this.error = error;
	}
}
