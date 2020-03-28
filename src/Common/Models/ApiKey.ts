export default class ApiKey {
	public readonly id: string;
	public readonly key: string;
	public readonly userId: string;
	public readonly createdAt: Date;
	public readonly expiresAt: Date;

	constructor(attributes: object) {
		Object.assign(this, attributes);
	}

	toApi(): object {
		return {
			id: this.id,
			key: this.key,
			userId: this.userId,
			createdAt: this.createdAt.toISOString(),
			expiresAt: this.expiresAt.toISOString(),
		};
	}

	public static fromApi(data: any): ApiKey {
		return new ApiKey({
			...data,
			createdAt: new Date(data.createdAt),
			expiresAt: new Date(data.expiresAt),
		});
	}
}
