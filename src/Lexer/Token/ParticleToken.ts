import Token from './Token';

export default class ParticleToken extends Token {
	static isParticle(text: string): boolean {
		return ['か', 'が', 'で', 'と', 'な', 'に', 'の', 'は', 'へ', 'も', 'や', 'を'].includes(text);
	}

	constructor(text: string) {
		if (typeof text === 'string' && !ParticleToken.isParticle(text)) {
			throw new Error(`${text} is not a valid particle.`);
		}
		super(text);
	}
}
