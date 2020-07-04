export default class Server {
	public readonly error: string|null;

	constructor(error: string|null) {
		this.error = error;
	}
}
