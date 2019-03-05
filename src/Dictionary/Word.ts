import Sense from './Sense';

export default class Word {
	public readonly id: number;
	public readonly word: string;
	public readonly frequency: number|null;
	public readonly ateji: boolean;
	public readonly irregularKanji: boolean;
	public readonly irregularKana: boolean;
	public readonly outDatedKanji: boolean;
	public readonly senses: ReadonlyArray<Sense>;

	constructor(attributes: Word) {
		Object.assign(this, attributes);
	}
}
