import WordToken from './WordToken';
import VerbForms from '../Verb/VerbForms';
import VerbForm from '../Verb/VerbForm';
import Word from '../../Dictionary/Word';

export default class VerbToken extends WordToken {
	public readonly verb: string;
	public readonly conjugation: string;
	public readonly forms: ReadonlyArray<VerbForm>;

	constructor(
		verb: string,
		conjugation: string,
		forms: ReadonlyArray<VerbForm>,
		words: ReadonlyArray<Word>,
	) {
		super(verb + conjugation, words);
		this.verb = verb;
		this.conjugation = conjugation;
		this.forms = forms;
	}
}
