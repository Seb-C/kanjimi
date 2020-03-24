import WordToken from 'Common/Models/Token/WordToken';
import Conjugations from 'Server/Lexer/Conjugations';
import Conjugation from 'Common/Models/Conjugation';
import Word from 'Common/Models/Word';

export default class VerbToken extends WordToken {
	public readonly verb: string;
	public readonly conjugation: string;
	public readonly forms: ReadonlyArray<Conjugation>;

	constructor(
		verb: string,
		conjugation: string,
		forms: ReadonlyArray<Conjugation>,
		words: ReadonlyArray<Word>,
	) {
		super(verb + conjugation, words);
		this.verb = verb;
		this.conjugation = conjugation;
		this.forms = forms;
	}

	public getFurigana(): string {
		let reading = super.getFurigana();

		if (this.forms.length > 0) {
			// We have to conjugate the reading as well
			reading = reading.substring(0, reading.length - this.forms[0].dictionaryForm.length);
			reading = reading + this.forms[0].conjugation;
		}

		return reading;
	}

	public toApi(): Object {
		return {
			...super.toApi(),
			type: 'VerbToken',
			verb: this.verb,
			conjugation: this.conjugation,
			forms: this.forms.map(form => form.toApi()),
		};
	}

	public static fromApi(data: Object): Token {
		return new WordToken(
			<string>data.verb,
			<string>data.conjugation,
			<ReadonlyArray<Conjugation>>data.forms.map(form => Conjugation.fromApi(form)),
			<ReadonlyArray<Word>>data.words.map(word => Word.fromApi(word)),
		);
	}
}
