import { query } from '../db';
import VerbForms from './Verb/VerbForms';
import VerbForm from './Verb/VerbForm';
import Token from './Token/Token';
import CharType from './CharType';
import VerbToken from './Token/VerbToken';
import ParticleToken from './Token/ParticleToken';

export default class Lexer {
	async tokenize (text: string): Promise<Token[]> {
		// console.log(await query.many('SELECT * FROM "Word" WHERE "word" LIKE \'申する%\''))

		const tokens: Token[] = [];
		for (let i = 0; i < text.length; i++) {
			const currentToken = new Token(text[i]);
			const currentType = currentToken.getLastCharType();

			let lastToken = i === 0 ? new Token('') : tokens[tokens.length - 1];
			if (lastToken.constructor !== Token) {
				// Considering that the last token was recognized as complete
				// In that case, we start a new one
				lastToken = new Token('');
				tokens.push(lastToken);
			}

			if (lastToken.getLastCharType() === currentType) {
				lastToken.append(currentToken.getText());
				if (ParticleToken.isParticle(lastToken.getText())) {
					tokens[tokens.length - 1] = new ParticleToken(lastToken.getText());
				}
			} else if (lastToken.getLastCharType() === CharType.KANJI && currentType === CharType.HIRAGANA) {
				const verbToken = this.getTokenIfVerbConjugation(text, i);
				if (verbToken !== null) {
					i += verbToken.getText().length - 1;
					verbToken.setVerb(lastToken.getText());
					tokens[tokens.length - 1] = verbToken;
				} else {
					tokens.push(currentToken);
				}
			} else {
				tokens.push(currentToken);
			}
		}

		return tokens;
	}

	getTokenIfVerbConjugation(text: string, position: number): VerbToken|null {
		const token = new VerbToken('', '');
		for (let i = 0; (
			i < VerbForms.getMaxConjugationLength()
			&& i + position < text.length
		); i++) {
			token.appendToConjugation(text[position + i]);

			if (token.getLastCharType() !== CharType.HIRAGANA) {
				return null;
			}

			if (VerbForms.hasForm(token.getText())) {
				return token;
			}
		}

		return null;
	}
}
