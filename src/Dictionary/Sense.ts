import PartOfSpeech from './PartOfSpeech';

export default class Sense {
	public readonly id: number;
	public readonly info: string|null;
	public readonly dialect: string[];
	public readonly context: string[];
	public readonly type: string[];
	public readonly partOfSpeech: PartOfSpeech[];

	constructor(attributes: Sense) {
		Object.assign(this, attributes);
	}
}
