enum TokenType {
	UNKNOWN = 'unknown',
	PUNCTUATION = 'punctuation',
	PARTICLE = 'particle',
	WORD = 'word',
	VERB = 'verb',
}

namespace TokenType {
	export function isParticle(text: string): boolean {
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
}

export default TokenType;
