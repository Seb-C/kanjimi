import VerbForms from './Verb/VerbForms';
import VerbForm from './Verb/VerbForm';
import Token from './Token/Token';
import CharType from './CharType';
import VerbToken from './Token/VerbToken';
import ParticleToken from './Token/ParticleToken';
import PunctuationToken from './Token/PunctuationToken';
import WordToken from './Token/WordToken';
import Dictionary from '../Dictionary';
import Word from '../Dictionary/Word';

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
			const currentCharType = CharType.of(this.getLastChar(currentToken.text));

			let lastToken = this.getLastToken();
			const lastTokenComplete = (lastToken !== null && this.isTokenComplete(lastToken));
			if (lastToken !== null) {
				this.setLastToken(this.refineToken(lastToken));
			}
			if (lastToken === null || lastTokenComplete) {
				// Considering that the last token was recognized as complete
				// In that case, we start a new one to be sure that it will always be different
				lastToken = new Token('');
				this.tokens.push(lastToken);
			}

			const lastCharType = CharType.of(this.getLastChar(lastToken.text));
			if (lastCharType === currentCharType || lastToken.text === '') {
				this.setLastToken(new Token(lastToken.text + currentToken.text));
				continue;
			}

			if (lastCharType === CharType.KANJI && currentCharType === CharType.HIRAGANA) {
				const verbToken = this.getTokenIfVerbConjugation(lastToken.text, this.currentIndex);
				if (verbToken !== null) {
					this.currentIndex += verbToken.conjugation.length - 1;
					this.setLastToken(verbToken);
					continue;
				}
			}

			currentToken = this.refineToken(currentToken);

			this.tokens.push(currentToken);
		}

		const lastToken = this.getLastToken();
		if (lastToken !== null) {
			this.setLastToken(this.refineToken(lastToken));
		}

		return this.tokens;
	}

	protected refineToken(token: Token): Token {
		const charType = CharType.of(this.getLastChar(token.text));

		if (ParticleToken.isParticle(token.text)) {
			return new ParticleToken(token.text);
		}
		if (charType === CharType.PUNCTUATION) {
			return new PunctuationToken(token.text);
		}
		if (this.dictionary.has(token.text)) {
			return new WordToken(token.text, this.dictionary.get(token.text));
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

	protected getTokenIfVerbConjugation(verb: string, position: number): VerbToken|null {
		let conjugation = '';
		for (let i = 0; (
			i < VerbForms.getMaxConjugationLength()
			&& i + position < this.text.length
		); i++) {
			if (CharType.of(this.text[position + i]) !== CharType.HIRAGANA) {
				return null;
			}

			conjugation += this.text[position + i];
			if (VerbForms.hasForm(conjugation)) {
				const words: Word[] = [];
				const forms = VerbForms.getForms(conjugation);
				forms.forEach((form: VerbForm) => {
					words.push(...this.dictionary.get(verb + form.dictionaryForm));
				});

				return new VerbToken(verb, conjugation, forms, words);
			}
		}

		return null;
	}

	getLastChar(text: string): string {
		if (text.length === 0) {
			return '';
		}

		return text[text.length - 1];
	}
}
