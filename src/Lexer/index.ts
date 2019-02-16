import { query } from '../db' // TODO dependency injection?
import VerbForms from './Verb/VerbForms'
import VerbForm from './Verb/VerbForm'
import Token from './Token/Token'
import CharType from './CharType'
import VerbToken from './Token/VerbToken'

// TODO adjectives? https://en.wikipedia.org/wiki/Japanese_verb_conjugation

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
