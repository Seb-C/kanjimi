import hiraganaToRomajiTable from 'Common/Types/data/hiragaToRomajiTable';

enum CharType {
	KATAKANA = 'katakana',
	HIRAGANA = 'hiragana',
	KANJI = 'kanji',
	PUNCTUATION = 'punctuation',
	OTHER = 'other',
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

	export function katakanaToHiragana(text: string): string {
		let newText = '';
		for (let i = 0; i < text.length; i++) {
			const code = text.charCodeAt(i);

			if (code >= 0x30A1 && code <= 0x30F6) {
				newText += String.fromCharCode(code - 96);
			} else {
				newText += text[i];
			}
		}

		return newText
	}

	export function hiraganaToRomaji(text: string): string {
		let result = '';
		let i = 0;
		while (i < text.length) {
			let l = 3;
			while (l > 0) {
				const part = text.substring(i, i + l);
				if (hiraganaToRomajiTable[part]) {
					result += hiraganaToRomajiTable[part];
					i += l;
					break;
				} else {
					l--;
				}
			}

			if (l == 0) {
				// Not a hiragana, keeping it
				result += text[i];
				i++;
			}
		}

		return result;
	}
}

export default CharType;
