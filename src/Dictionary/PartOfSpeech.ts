export default class PartOfSpeech {
	public readonly tag: string;
	public readonly description: string;

	constructor(attributes: PartOfSpeech) {
		Object.assign(this, attributes);
	}
}
