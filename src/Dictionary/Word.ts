import Tag from 'Dictionary/Tag';

export default class Word {
	public readonly id: number;
	public readonly word: string;
	public readonly reading: string;
	public readonly tags: ReadonlyArray<Tag>;
	public readonly translationLang: string;
	public readonly translation: string;

	constructor(attributes: Word) {
		Object.assign(this, attributes);
	}

	getShortTranslation(): string {
		return this.translation.replace(/^([^{(]+).*$/, '$1').trim();
	}
}
