import { query } from '../db';
import VerbForms from './Verb/VerbForms';
import VerbForm from './Verb/VerbForm';
import Token from './Token/Token';
import CharType from './CharType';
import VerbToken from './Token/VerbToken';
import ParticleToken from './Token/ParticleToken';
import PunctuationToken from './Token/PunctuationToken';

export default class Lexer {
	protected text: string;
	protected tokens: Token[];
	protected currentIndex: number;

	async tokenize (text: string): Promise<Token[]> {
		this.text = text;
		this.tokens = [];

		for (this.currentIndex = 0; this.currentIndex < this.text.length; this.currentIndex++) {
			let currentToken = new Token(this.text[this.currentIndex]);
			const lastToken = this.getLastIncompleteToken();
			const lastCharType = CharType.of(lastToken.getLastChar());
			const currentCharType = CharType.of(currentToken.getLastChar());

			if (lastCharType === currentCharType) {
				lastToken.append(currentToken.getText());
				continue;
			}

			if (lastCharType === CharType.KANJI && currentCharType === CharType.HIRAGANA) {
				const verbToken = this.getTokenIfVerbConjugation(this.currentIndex);
				if (verbToken !== null) {
					this.currentIndex += verbToken.getText().length - 1;
					verbToken.setVerb(lastToken.getText());
					this.tokens[this.tokens.length - 1] = verbToken;
					continue;
				}
			}

			if (ParticleToken.isParticle(currentToken.getText())) {
				currentToken = new ParticleToken(currentToken.getText());
			}
			if (currentCharType === CharType.PUNCTUATION) {
				currentToken = new PunctuationToken(currentToken.getText());
			}

			this.tokens.push(currentToken);
		}

		return this.tokens;
	}

	protected getLastIncompleteToken(): Token {
		let lastToken = this.currentIndex === 0 ? new Token('') : this.tokens[this.tokens.length - 1];
		if (lastToken.constructor !== Token) {
			// Considering that the last token was recognized as complete
			// In that case, we start a new one to be sure that it will always be different
			lastToken = new Token('');
		}

		return lastToken;
	}

	protected getTokenIfVerbConjugation(position: number): VerbToken|null {
		const token = new VerbToken('', '');
		for (let i = 0; (
			i < VerbForms.getMaxConjugationLength()
			&& i + position < this.text.length
		); i++) {
			token.appendToConjugation(this.text[position + i]);

			if (CharType.of(token.getLastChar()) !== CharType.HIRAGANA) {
				return null;
			}

			if (VerbForms.hasForm(token.getText())) {
				return token;
			}
		}

		return null;
	}
}
