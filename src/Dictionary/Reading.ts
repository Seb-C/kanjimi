export default class Reading {
	public readonly id: number;
	public readonly reading: string;
	public readonly trueReading: boolean;
	public readonly frequency: number|null;
	public readonly irregular: boolean;
	public readonly outDated: boolean;

	constructor(attributes: Reading) {
		Object.assign(this, attributes);
	}
}
