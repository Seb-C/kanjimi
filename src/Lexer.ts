import { query } from './db'

enum CharType {
	KATAKANA,
	HIRAGANA,
	KANJI,
	OTHER,
	NONE,
}

class Token {
	text: string = ""
	type: CharType = CharType.NONE

	extendWith(token: Token) {
		this.text += token.text
	}
}

// TODO tests
export default class Lexer {
	getCharType(char: string): CharType {
		const code = char.charCodeAt(0)

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

	async tokenize (text: string): Promise<Token[]> {
		console.log(await query.many('SELECT * FROM "Word" LIMIT 3'))
		const tokens: Token[] = []

		var lastToken = new Token()
		for (let i = 0; i < text.length; i++) {
			const token = new Token()
			token.text = text[i]
			token.type = this.getCharType(token.text) // TODO

			if (lastToken.type === token.type) {
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
