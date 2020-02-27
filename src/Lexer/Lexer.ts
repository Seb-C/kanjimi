import ConjugationForms from 'Lexer/Conjugation/ConjugationForms';
import ConjugationForm from 'Lexer/Conjugation/ConjugationForm';
import Token from 'Lexer/Token/Token';
import CharType from 'Misc/CharType';
import VerbToken from 'Lexer/Token/VerbToken';
import ParticleToken from 'Lexer/Token/ParticleToken';
import PunctuationToken from 'Lexer/Token/PunctuationToken';
import WordToken from 'Lexer/Token/WordToken';
import Dictionary from 'Dictionary/Dictionary';
import Word from 'Dictionary/Word';

export default class Lexer {
	protected dictionary: Dictionary;

	constructor(dictionary: Dictionary) {
		this.dictionary = dictionary;
	}

	tokenize (untrimmedText: string): Token[] {
		const text = untrimmedText.trim();
		const tokens: Token[] = [];

		for (let currentIndex = 0; currentIndex < text.length; currentIndex++) {
			let currentToken = new Token(text[currentIndex]);
			const currentCharType = CharType.of(this.getLastChar(currentToken.text));

			let lastToken = this.getLastToken(tokens);
			const lastTokenComplete = (lastToken !== null && this.isTokenComplete(lastToken));
			if (lastToken !== null) {
				this.setLastToken(this.refineToken(lastToken), tokens);
			}
			if (lastToken === null || lastTokenComplete) {
				// Considering that the last token was recognized as complete
				// In that case, we start a new one to be sure that it will always be different
				lastToken = new Token('');
				tokens.push(lastToken);
			}

			const lastCharType = CharType.of(this.getLastChar(lastToken.text));
			if (lastCharType === currentCharType || lastToken.text === '') {
				this.setLastToken(new Token(lastToken.text + currentToken.text), tokens);
				continue;
			}

			if (lastCharType === CharType.KANJI && currentCharType === CharType.HIRAGANA) {
				const verbToken = this.getTokenIfVerbConjugation(lastToken.text, currentIndex, text);
				if (verbToken !== null) {
					currentIndex += verbToken.conjugation.length - 1;
					this.setLastToken(verbToken, tokens);
					continue;
				}
			}

			if (
				lastCharType === CharType.KANJI
				&& currentCharType !== CharType.KANJI
				&& !lastTokenComplete
			) {
				const result = this.splitMultiKanjisSequence(lastToken);
				this.setLastToken(result, tokens);
			}

			currentToken = this.refineToken(currentToken);

			tokens.push(currentToken);
		}

		const lastToken = this.getLastToken(tokens);
		if (lastToken !== null) {
			if (
				CharType.of(this.getLastChar(lastToken.text)) === CharType.KANJI
				&& !this.isTokenComplete(lastToken)
			) {
				const result = this.splitMultiKanjisSequence(lastToken);
				this.setLastToken(result, tokens);
			} else {
				this.setLastToken(this.refineToken(lastToken), tokens);
			}
		}

		return tokens;
	}

	protected refineToken(token: Token): Token {
		const charType = CharType.of(this.getLastChar(token.text));

		if (ParticleToken.isParticle(token.text)) {
			return new ParticleToken(token.text);
		}
		if (charType === CharType.PUNCTUATION) {
			return new PunctuationToken(token.text);
		}

		const word = this.dictionary.get(token.text);
		if (word.length > 0) {
			// Simple dictionary lookup
			return new WordToken(token.text, word);
		}

		return token;
	}

	protected splitMultiKanjisSequence(token: Token): Token[] {
		const tokens: Token[] = [];

		let begin = 0;
		while (begin < token.text.length) {
			let length;
			for (length = token.text.length - begin; length > 0; length--) {
				const sub = token.text.substr(begin, length);
				const word = this.dictionary.get(sub);
				if (word.length > 0) {
					tokens.push(new WordToken(sub, word));
					begin += sub.length;
					break; // Inner for loop
				}
			}

			if (length === 0) {
				// Not found, creating a token with only one kanji
				tokens.push(new Token(token.text[0]));
				begin++;
			}
		}

		return tokens;
	}

	protected getLastToken(tokens: Token[]): Token|null {
		return tokens[tokens.length - 1] || null;
	}

	protected setLastToken(token: Token|Token[], tokens: Token[]): void {
		tokens.pop();

		if (token instanceof Array) {
			tokens.push(...token);
		} else {
			tokens.push(token);
		}
	}

	protected isTokenComplete(token: Token): boolean {
		return token.constructor !== Token;
	}

	protected getTokenIfVerbConjugation(verb: string, position: number, text: string): VerbToken|null {
		let conjugation = '';
		for (let i = 0; (
			i < ConjugationForms.getMaxConjugationLength()
			&& i + position < text.length
		); i++) {
			if (CharType.of(text[position + i]) !== CharType.HIRAGANA) {
				return null;
			}

			conjugation += text[position + i];
			if (ConjugationForms.hasForm(conjugation)) {
				const words: Word[] = [];
				const forms = ConjugationForms.getForms(conjugation);
				forms.map((form: ConjugationForm) => {
					words.push(...(
						this.dictionary.get(verb + form.dictionaryForm)
					));
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
