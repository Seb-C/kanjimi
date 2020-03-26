import * as Crypto from 'crypto';
import Language from 'Common/Types/Language';

export default class User {
	static hashPassword(uuid: string, password: string): string {
		const hash = Crypto.createHash('sha256');
		hash.update(password + uuid);
		return hash.digest('base64');
	}

	public readonly id: string;
	public readonly email: string;
	public readonly emailVerified: boolean;
	public readonly password: string|null;
	public readonly languages: Language[];
	public readonly createdAt: Date;

	constructor(attributes: object) {
		Object.assign(this, attributes);
	}

	toApi(): object {
		return {
			id: this.id,
			email: this.email,
			emailVerified: this.emailVerified,
			password: null,
			languages: this.languages,
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
