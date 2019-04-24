import WordToken from 'Lexer/Token/WordToken';
import ConjugationForms from 'Lexer/Conjugation/ConjugationForms';
import ConjugationForm from 'Lexer/Conjugation/ConjugationForm';
import Word from 'Dictionary/Word';

export default class VerbToken extends WordToken {
	public readonly verb: string;
	public readonly conjugation: string;
	public readonly forms: ReadonlyArray<ConjugationForm>;

	constructor(
		verb: string,
		conjugation: string,
		forms: ReadonlyArray<ConjugationForm>,
		words: ReadonlyArray<Word>,
	) {
		super(verb + conjugation, words);
		this.verb = verb;
		this.conjugation = conjugation;
		this.forms = forms;
	}
}
