import WordToken from 'Server/Lexer/Token/WordToken';
import ConjugationForms from 'Server/Lexer/Conjugation/ConjugationForms';
import ConjugationForm from 'Server/Lexer/Conjugation/ConjugationForm';
import Word from 'Server/Dictionary/Word';

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
