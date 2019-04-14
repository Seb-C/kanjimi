import CharType from 'Misc/CharType';

export default class Token {
	public readonly text: string;

	constructor(text: string) {
		this.text = text;
	}

	public getFurigana(): string {
		return '';
	}

	public getTranslation(): string {
		return '';
	}
}
