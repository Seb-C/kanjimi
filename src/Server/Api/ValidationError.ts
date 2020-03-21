import * as Ajv from 'ajv';

export default class ValidationError {
	public readonly errors: Ajv.ErrorObject[];

	constructor(errors: Ajv.ErrorObject[]) {
		this.errors = errors;
	}
}
