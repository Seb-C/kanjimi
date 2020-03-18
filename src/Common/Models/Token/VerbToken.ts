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
}
