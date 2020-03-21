import * as Crypto from 'crypto';
import Language from 'Common/Types/Language';

export default class User {
	static hashPassword(password: string): string {
		const hash = Crypto.createHash('sha256');
		hash.update(password);
		return hash.digest('base64');
	}

	public readonly id: number;
	public readonly email: string;
	public readonly emailVerified: boolean;
	public readonly password: string|null;
	public readonly languages: Language[];
	public readonly createdAt: Date;

	constructor(attributes: object) {
		Object.assign(this, attributes);
	}
}
