import ConjugationType from 'Common/Types/ConjugationType';

export default class Conjugation {
	readonly conjugation: string;
	readonly dictionaryForm: string;
	readonly type: ConjugationType;

	constructor (conjugation: string, dictionaryForm: string, type: ConjugationType) {
		this.conjugation = conjugation;
		this.dictionaryForm = dictionaryForm;
		this.type = type;
	}
}
