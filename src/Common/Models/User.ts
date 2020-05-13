import Language from 'Common/Types/Language';

export default class User {
	public readonly id: string;
	public readonly email: string;
	public readonly emailVerified: boolean;
	public readonly password: string|null;
	public readonly languages: ReadonlyArray<Language>;
	public readonly createdAt: Date;
	public readonly romanReading: boolean;

	constructor(attributes: any) {
		this.id = attributes.id;
		this.email = attributes.email;
		this.emailVerified = attributes.emailVerified;
		this.password = attributes.password;
		this.languages = [...attributes.languages];
		this.createdAt = attributes.createdAt;
		this.romanReading = attributes.romanReading;
	}

	toApi(): object {
		return {
			id: this.id,
			email: this.email,
			emailVerified: this.emailVerified,
			password: null,
			languages: this.languages,
			romanReading: this.romanReading,
			createdAt: this.createdAt.toISOString(),
		};
	}

	public static fromApi(data: any): User {
		return new User({
			...data,
			createdAt: new Date(data.createdAt),
		});
	}
}
