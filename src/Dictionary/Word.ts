export default class Word {
	public id: number;
	public word: string;

	constructor(attributes: Word) {
		super();
		Object.assign(this, attributes);
	}
}
