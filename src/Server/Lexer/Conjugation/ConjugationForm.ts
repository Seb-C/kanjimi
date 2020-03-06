import ConjugationType from 'Server/Lexer/Conjugation/ConjugationType';

export default class ConjugationForm {
	readonly conjugation: string;
	readonly dictionaryForm: string;
	readonly type: ConjugationType;

	constructor (conjugation: string, dictionaryForm: string, type: ConjugationType) {
		this.conjugation = conjugation;
		this.dictionaryForm = dictionaryForm;
		this.type = type;
	}
}
