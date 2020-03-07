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
		} else if (code >= 0x30A1 && code <= 0x30FA || code === 0x30FC) {
			return CharType.KATAKANA;
		} else if ((code >= 0x4E00 && code <= 0x9FAF) || code === 0x3005) {
			return CharType.KANJI;
		} else if ((code >= 0x3001 && code <= 0x303D) || code === 0x30FB) {
			return CharType.PUNCTUATION;
		} else {
			return CharType.OTHER;
		}
	}

	export function isJapanese(char: string): boolean {
		return CharType.of(char) !== CharType.OTHER;
	}

	export function containsJapanese(text: string): boolean {
		// Note: arbitrarily limiting the number of characters for performance reason
		for (let i = 0; i < text.length && i < 20; i++) {
			if (CharType.isJapanese(text[i])) {
				return true;
			}
		}

		return false;
	}
}

export default CharType;
