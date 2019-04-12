import PartOfSpeech from './PartOfSpeech';

export default class Word {
	public readonly id: number;
	public readonly word: string;
	public readonly reading: string;
	public readonly partOfSpeech: ReadonlyArray<PartOfSpeech>;
	public readonly translationLang: string;
	public readonly translation: string;

	constructor(attributes: Word) {
		Object.assign(this, attributes);
	}
}
