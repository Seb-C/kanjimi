import CharType from '../CharType';

export default class Token {
	protected text: string;

	constructor(text: string) {
		this.text = text;
	}

	getText() {
		return this.text;
	}

	append(text: string) {
		this.text += text;
	}

	getLastChar(): string {
		if (this.text.length === 0) {
			return '';
		}

		return this.text[this.text.length - 1];
	}
}
