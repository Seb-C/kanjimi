import CharType from '../CharType'

export default class Token {
	protected text: string

	constructor(text: string) {
		this.text = text
	}

	getText() {
		return this.text
	}

	append(text: string) {
		this.text += text
	}

	getCharType(position: number): CharType {
		const code = this.text.charCodeAt(position)

		// TODO half width characters? full-width roman chars?
		if (code >= 0x3041 && code <= 0x3096) {
			return CharType.HIRAGANA
		} else if (code >= 0x30A1 && code <= 0x30FA) {
			return CharType.KATAKANA
		} else if (code >= 0x4E00 && code <= 0x9FAF) {
			return CharType.KANJI
		} else {
			return CharType.OTHER
		}
	}

	getLastCharType(): CharType {
		return this.getCharType(this.text.length - 1)
	}
}
