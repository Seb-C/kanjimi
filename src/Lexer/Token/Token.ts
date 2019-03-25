import CharType from '../../Misc/CharType';

export default class Token {
	public readonly text: string;

	constructor(text: string) {
		this.text = text;

		// When built from the API unserializer
		if ((<any>text) instanceof Object) {
			Object.assign(this, text);
		}
	}
}
