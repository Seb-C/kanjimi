type FieldError = {
	dataPath: string,
	keyword: string,
	message: string,
	params: {
		limit: number,
		format: string
	},
};

export default class Validation {
	public readonly data: FieldError[];

	constructor(data: FieldError[]) {
		this.data = data;
	}

	getFormErrors(): { [key: string]: string } {
		const errors = <{ [key: string]: string }>{};

		this.data.forEach((error) => {
			if (error.dataPath) {
				const fieldName = error.dataPath.substring(1);
				if (!errors[fieldName]) {
					errors[fieldName] = this.getErrorMessage(error);
				}
			}
		});

		return errors;
	}

	getErrorMessage(error: FieldError): string {
		if (error.keyword === 'minLength' && error.params.limit === 1) {
			return 'This field is required';
		}

		if (error.keyword === 'minItems' && error.params.limit === 1) {
			return 'Please select at least one';
		}

		if (error.keyword === 'format' && error.params.format === 'email') {
			return 'Please enter a valid email';
		}

		console.log(error); // For debug purposes

		return error.message;
	}
}
