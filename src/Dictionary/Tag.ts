export default class Tag {
	public readonly tag: string;
	public readonly description: string;

	constructor(attributes: Tag) {
		Object.assign(this, attributes);
	}
}
