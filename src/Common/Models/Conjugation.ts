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

	public toApi(): any {
		return {
			conjugation: this.conjugation,
			dictionaryForm: this.dictionaryForm,
			type: this.type,
		};
	}

	public static fromApi(data: any): Conjugation {
		return new Conjugation(
			<string>data.conjugation,
			<string>data.dictionaryForm,
			<ConjugationType>data.type,
		);
	}
}
