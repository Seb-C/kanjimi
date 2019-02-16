import { query } from './db'
import { VerbForms, VerbForm } from './verbs'

// TODO properly organize packages
enum CharType {
	KATAKANA,
	HIRAGANA,
	KANJI,
	OTHER,
}

class Token {
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

class VerbToken extends Token {
	protected verb: string
	protected conjugation: string

	constructor(verb: string, conjugation: string) {
		super('')
		this.verb = verb
		this.conjugation = conjugation
		this.computeText()
	}

	private computeText() {
		this.text = this.verb + this.conjugation
	}

	getVerbForm(): VerbForm[] {
		return VerbForms.getForms(this.conjugation)
	}

	appendToConjugation (text: string) {
		this.conjugation += text
		this.computeText()
	}

	setVerb (verb: string) {
		this.verb = verb
		this.computeText()
	}
}

// TODO tests
export default class Lexer {
	async tokenize (text: string): Promise<Token[]> {
		//console.log(await query.many('SELECT * FROM "Word" WHERE "word" LIKE \'申する%\''))

		const tokens: Token[] = []
		for (let i = 0; i < text.length; i++) {
			const currentToken = new Token(text[i])
			const currentType = currentToken.getLastCharType()

			const lastToken = i == 0 ? new Token('') : tokens[tokens.length - 1]
			const lastType = lastToken.getLastCharType()

			if (lastType === currentType) {
				lastToken.append(currentToken.getText())
			} else if (lastType == CharType.KANJI && currentType == CharType.HIRAGANA) {
				var verbToken = this.getTokenIfVerbConjugation(text, i)
				if (verbToken !== null) {
					i += verbToken.getText().length - 1
					verbToken.setVerb(lastToken.getText())
					tokens[tokens.length - 1] = verbToken
				} else {
					tokens.push(currentToken)
				}
			} else {
				tokens.push(currentToken)
			}
		}

		return tokens
	}

	getTokenIfVerbConjugation(text: string, position: number): VerbToken|null {
		const token = new VerbToken("", "")
		for (var i = 0; (
			i < VerbForms.getMaxConjugationLength()
			&& i + position < text.length
		); i++) {
			token.appendToConjugation(text[position + i])

			if (token.getLastCharType() != CharType.HIRAGANA) {
				return null
			}

			if (VerbForms.hasForm(token.getText())) {
				return token
			}
		}

		return null
	}
}
