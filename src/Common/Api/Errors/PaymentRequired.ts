export default class PaymentRequired {
	public readonly error: string;

	constructor(error: string) {
		this.error = error;
	}
}
