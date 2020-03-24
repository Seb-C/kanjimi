import CharType from 'Common/Types/CharType';
import PunctuationToken from 'Common/Models/Token/PunctuationToken';
import ParticleToken from 'Common/Models/Token/ParticleToken';
import VerbToken from 'Common/Models/Token/VerbToken';
import WordToken from 'Common/Models/Token/WordToken';

export default class Token {
	public readonly text: string;

	constructor(text: string) {
		this.text = text;
	}

	public getFurigana(): string {
		return '';
	}

	public getTranslation(): string {
		return '';
	}

	public toApi(): Object {
		return {
			type: 'Token',
			text: this.text,
		};
	}

	public static fromApi(data: Object): Token {
		const type: string = data.type;
		switch (type) {
			case 'Token':
				return new Token(<string>data.text);
			case 'VerbToken':
				return VerbToken.fromApi(data);
			case 'WordToken':
				return WordToken.fromApi(data);
			case 'ParticleToken':
				return ParticleToken.fromApi(data);
			case 'PunctuationToken':
				return PunctuationToken.fromApi(data);
		}
	}
}
