import TokenType from 'Common/Types/TokenType';
import Word from 'Common/Models/Word';
import Conjugation from 'Common/Models/Conjugation';

export default class Token {
	public readonly text: string;
	public readonly type: TokenType;
	public readonly words: ReadonlyArray<Word>;
	public readonly verb: string|null;
	public readonly conjugation: string|null;
	public readonly forms: ReadonlyArray<Conjugation>;

	constructor(
		text: string,
		type: TokenType,
		words: ReadonlyArray<Word> = [],
		verb: string|null = null,
		conjugation: string|null = null,
		forms: ReadonlyArray<Conjugation> = [],
	) {
		this.text = text;
		this.type = type;
		this.words = [...words];
		this.verb = verb;
		this.conjugation = conjugation;
		this.forms = [...forms];
	}

	public getFurigana(): string|null {
		let reading = '';
		if (this.words.length > 0) {
			reading = this.words[0].reading;
		}

		if (this.forms.length > 0) {
			// We have to conjugate the reading as well
			reading = reading.substring(0, reading.length - this.forms[0].dictionaryForm.length);
			reading = reading + this.forms[0].conjugation;
		}

		return reading === '' ? null : reading;
	}

	public getTranslation(): string|null {
		if (this.words.length === 0) {
			return null;
		}

		return this.words[0].getShortTranslation();
	}

	public toApi(): Object {
		return {
			type: this.type,
			text: this.text,
			words: this.words.map(word => word.toApi()),
			verb: this.verb,
			conjugation: this.conjugation,
			forms: this.forms.map(form => form.toApi()),
		};
	}

	public static fromApi(data: any): Token {
		return new Token(
			<string>data.text,
			<TokenType>data.type,
			<ReadonlyArray<Word>>data.words.map((word: any) => Word.fromApi(word)),
			<string>data.verb,
			<string>data.conjugation,
			<ReadonlyArray<Conjugation>>data.forms.map((form: any) => Conjugation.fromApi(form)),
		);
	}
}
