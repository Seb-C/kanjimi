import Language from 'Common/Types/Language';

export default class User {
	public readonly id: string;
	public readonly email: string;
	public readonly emailVerified: boolean;
	public readonly emailVerificationKey: string|null;
	public readonly password: string|null;
	public readonly passwordResetKey: string|null;
	public readonly passwordResetKeyExpiresAt: Date|null;
	public readonly languages: ReadonlyArray<Language>;
	public readonly createdAt: Date;
	public readonly romanReading: boolean;
	public readonly jlpt: number|null;

	constructor(attributes: any) {
		this.id = attributes.id;
		this.email = attributes.email;
		this.emailVerified = attributes.emailVerified;
		this.emailVerificationKey = attributes.emailVerificationKey || null;
		this.password = attributes.password;
		this.passwordResetKey = attributes.passwordResetKey || null;
		this.passwordResetKeyExpiresAt = attributes.passwordResetKeyExpiresAt || null;
		this.languages = [...attributes.languages];
		this.createdAt = attributes.createdAt;
		this.romanReading = attributes.romanReading;
		this.jlpt = attributes.jlpt;
	}

	toApi(): object {
		return {
			id: this.id,
			email: this.email,
			emailVerified: this.emailVerified,
			password: null,
			languages: this.languages,
			romanReading: this.romanReading,
			jlpt: this.jlpt,
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
