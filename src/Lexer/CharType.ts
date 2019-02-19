enum CharType {
	KATAKANA,
	HIRAGANA,
	KANJI,
	PUNCTUATION,
	OTHER,
}

namespace CharType {
	export function of(char: string): CharType {
		const code = char.charCodeAt(0);

		if (code >= 0x3041 && code <= 0x3096) {
			return CharType.HIRAGANA;
		} else if (code >= 0x30A1 && code <= 0x30FA) {
			return CharType.KATAKANA;
		} else if (code >= 0x4E00 && code <= 0x9FAF) {
			return CharType.KANJI;
		} else if (code >= 0x3001 && code <= 0x303D || code === 0x30FB) {
			return CharType.PUNCTUATION;
		} else {
			return CharType.OTHER;
		}
	}
}

export default CharType;
