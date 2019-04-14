import VerbFormType from 'Lexer/Verb/VerbFormType';

export default class VerbForm {
	readonly conjugation: string;
	readonly dictionaryForm: string;
	readonly type: VerbFormType;

	constructor (conjugation: string, dictionaryForm: string, type: VerbFormType) {
		this.conjugation = conjugation;
		this.dictionaryForm = dictionaryForm;
		this.type = type;
	}
}
