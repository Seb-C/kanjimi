import Tag from 'Dictionary/Tag';

export default class Word {
	public readonly word: string;
	public readonly reading: string;
	public readonly translationLang: string;
	public readonly translation: string;
	public readonly tags: ReadonlyArray<Tag>;

	constructor(attributes: Word) {
		Object.assign(this, attributes);
	}

	getShortTranslation(): string {
		return this.translation.replace(/^([^{(]+).*$/, '$1').trim();
	}
}
