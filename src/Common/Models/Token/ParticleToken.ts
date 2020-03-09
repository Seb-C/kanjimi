import Token from 'Common/Models/Token/Token';

export default class ParticleToken extends Token {
	static isParticle(text: string): boolean {
		return (
			text.length === 1
			&& ['か', 'が', 'で', 'と', 'な', 'に', 'の', 'は', 'へ', 'も', 'や', 'を', 'お'].includes(text)
		);
	}

	constructor(text: string) {
		if (typeof text === 'string' && !ParticleToken.isParticle(text)) {
			throw new Error(`${text} is not a valid particle.`);
		}
		super(text);
	}
}