import Token from './Token';
import VerbForms from '../Verb/VerbForms';
import VerbForm from '../Verb/VerbForm';

export default class VerbToken extends Token {
	protected verb: string;
	protected conjugation: string;

	constructor(verb: string, conjugation: string) {
		super('');
		this.verb = verb;
		this.conjugation = conjugation;
		this.computeText();
	}

	getVerb() {
		return this.verb;
	}

	getConjugation() {
		return this.conjugation;
	}

	private computeText() {
		this.text = this.verb + this.conjugation;
	}

	getDictionaryConjugationForms(): ReadonlyArray<VerbForm> {
		return VerbForms.getForms(this.conjugation);
	}

	appendToConjugation (text: string) {
		this.conjugation += text;
		this.computeText();
	}

	setVerb (verb: string) {
		this.verb = verb;
		this.computeText();
	}
}
