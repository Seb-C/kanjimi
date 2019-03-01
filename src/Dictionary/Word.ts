export default class Word {
	public readonly id: number;
	public readonly word: string;

	constructor(attributes: Word) {
		Object.assign(this, attributes);
	}
}
