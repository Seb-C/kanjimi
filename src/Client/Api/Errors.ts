export class ApiError {
	public readonly type: ApiErrorType;
	public readonly data: any;

	constructor(type: ApiErrorType, data: any) {
		this.type = type;
		this.data = data;
	}
}

export enum ApiErrorType {
	VALIDATION = 'validation',
}
