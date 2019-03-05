import SenseType from './SenseType';

export default class Translation {
	public readonly id: number;
	public readonly lang: string;
	public readonly translation: string;
	public readonly type: SenseType|null;

	constructor(attributes: Translation) {
		Object.assign(this, attributes);
	}
}
