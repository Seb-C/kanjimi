import Token from './Token'
import VerbForms from '../Verb/VerbForms'
import VerbForm from '../Verb/VerbForm'

export default class VerbToken extends Token {
	protected verb: string
	protected conjugation: string

	constructor(verb: string, conjugation: string) {
		super('')
		this.verb = verb
		this.conjugation = conjugation
		this.computeText()
	}

	private computeText() {
		this.text = this.verb + this.conjugation
	}

	getVerbForm(): VerbForm[] {
		return VerbForms.getForms(this.conjugation)
	}

	appendToConjugation (text: string) {
		this.conjugation += text
		this.computeText()
	}

	setVerb (verb: string) {
		this.verb = verb
		this.computeText()
	}
}
