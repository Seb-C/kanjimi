import VerbForms from './Verb/VerbForms';
import VerbForm from './Verb/VerbForm';
import Token from './Token/Token';
import CharType from './CharType';
import VerbToken from './Token/VerbToken';
import ParticleToken from './Token/ParticleToken';
import PunctuationToken from './Token/PunctuationToken';
import WordToken from './Token/WordToken';
import Dictionary from '../Dictionary';

export default class Lexer {
	protected dictionary: Dictionary;
	protected text: string;
	protected tokens: Token[];
	protected currentIndex: number;

	constructor(dictionary: Dictionary) {
		this.dictionary = dictionary;
	}

	tokenize (text: string): Token[] {
		this.text = text.trim();
		this.tokens = [];

		for (this.currentIndex = 0; this.currentIndex < this.text.length; this.currentIndex++) {
			let currentToken = new Token(this.text[this.currentIndex]);
			const currentCharType = CharType.of(currentToken.getLastChar());

			let lastToken = this.getLastToken();
			if (lastToken === null || this.isTokenComplete(lastToken)) {
				if (lastToken !== null) {
					this.setLastToken(this.refineToken(lastToken));
				}

				// Considering that the last token was recognized as complete
				// In that case, we start a new one to be sure that it will always be different
				lastToken = new Token('');
				this.tokens.push(lastToken);
			}
			const lastCharType = CharType.of(lastToken.getLastChar());

			if (lastCharType === currentCharType || lastToken.getText() === '') {
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

			currentToken = this.refineToken(currentToken);

			this.tokens.push(currentToken);
		}

		const lastToken = this.getLastToken();
		if (lastToken !== null) {
			this.tokens[this.tokens.length - 1] = this.refineToken(lastToken);
		}

		return this.tokens;
	}

	protected refineToken(token: Token): Token {
		const charType = CharType.of(token.getLastChar());
		const text = token.getText();

		if (ParticleToken.isParticle(text)) {
			return new ParticleToken(text);
		}
		if (charType === CharType.PUNCTUATION) {
			return new PunctuationToken(text);
		}
		if (this.dictionary.has(text)) {
			return new WordToken(text, this.dictionary.get(text));
		}

		return token;
	}

	protected getLastToken(): Token|null {
		return this.tokens[this.tokens.length - 1] || null;
	}

	protected setLastToken(token: Token): void {
		this.tokens[this.tokens.length - 1] = token;
	}

	protected isTokenComplete(token: Token): boolean {
		return token.constructor !== Token;
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
