import { query } from './db'
import { VerbForms } from './verbs'

// TODO properly organize packages

console.log(VerbForms)

enum CharType {
	KATAKANA,
	HIRAGANA,
	KANJI,
	OTHER,
}

class Token {
	text: string

	constructor(text: string) {
		this.text = text
	}

	extendWith(token: Token) {
		this.text += token.text
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

// TODO tests
export default class Lexer {
	async tokenize (text: string): Promise<Token[]> {
		//console.log(await query.many('SELECT * FROM "Word" WHERE "word" LIKE \'申する%\''))
		const tokens: Token[] = []

		var lastToken = new Token("")
		for (let i = 0; i < text.length; i++) {
			const token = new Token(text[i])

			const currentType = token.getLastCharType()
			const lastType = lastToken.getLastCharType()

			if (lastType === currentType) {
				lastToken.extendWith(token)
			} else if (lastType == CharType.KANJI && currentType == CharType.HIRAGANA) {
				lastToken.extendWith(token)
			} else {
				tokens.push(token)
				lastToken = token
			}

			// TODO
		}

		return tokens
	}
}
