import PartOfSpeech from './PartOfSpeech';
import Translation from './Translation';

export default class Sense {
	public readonly id: number;
	public readonly info: string|null;
	public readonly dialect: ReadonlyArray<string>;
	public readonly context: ReadonlyArray<string>;
	public readonly type: ReadonlyArray<string>;
	public readonly partOfSpeech: ReadonlyArray<PartOfSpeech>;
	public readonly translations: ReadonlyArray<Translation>;

	constructor(attributes: Sense) {
		Object.assign(this, attributes);
	}

	public getBestTranslation(): Translation|null {
		return this.translations[0] || null; // TODO
	}
}
