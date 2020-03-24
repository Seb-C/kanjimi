import Word from 'Common/Models/Word';
import WordToken from 'Common/Models/Token/WordToken';

export default class ParticleToken extends WordToken {
	static isParticle(text: string): boolean {
		return text.length === 1 && [
			'か',
			'が',
			'で',
			'と',
			'な',
			'に',
			'の',
			'は',
			'へ',
			'も',
			'や',
			'を',
			'お',
			'し',
			'ぜ',
			'ぞ',
			'で',
			'でも',
			'とか',
			'とも',
			'ね',
			'ねえ',
			'ので',
			'のに',
			'よ',
		].includes(text);
	}

	constructor(text: string, words: ReadonlyArray<Word>) {
		if (typeof text === 'string' && !ParticleToken.isParticle(text)) {
			throw new Error(`${text} is not a valid particle.`);
		}
		super(text, words);
	}

	public toApi(): Object {
		return {
			...super.toApi(),
			type: 'ParticleToken',
		};
	}
}
