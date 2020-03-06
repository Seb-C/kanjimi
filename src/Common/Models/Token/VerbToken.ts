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
}
