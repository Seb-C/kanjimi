import VerbForms from 'Lexer/Verb/VerbForms';
import VerbForm from 'Lexer/Verb/VerbForm';
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
	protected text: string;
	protected tokens: Token[];
	protected currentIndex: number;

	constructor(dictionary: Dictionary) {
		this.dictionary = dictionary;
	}

	async tokenize (text: string): Promise<Token[]> {
		this.text = text.trim();
		this.tokens = [];

		for (this.currentIndex = 0; this.currentIndex < this.text.length; this.currentIndex++) {
			let currentToken = new Token(this.text[this.currentIndex]);
			const currentCharType = CharType.of(this.getLastChar(currentToken.text));

			let lastToken = this.getLastToken();
			const lastTokenComplete = (lastToken !== null && this.isTokenComplete(lastToken));
			if (lastToken !== null) {
				this.setLastToken(await this.refineToken(lastToken));
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
				const verbToken = await this.getTokenIfVerbConjugation(lastToken.text, this.currentIndex);
				if (verbToken !== null) {
					this.currentIndex += verbToken.conjugation.length - 1;
					this.setLastToken(verbToken);
					continue;
				}
			}

			if (
				lastCharType === CharType.KANJI
				&& currentCharType !== CharType.KANJI
				&& !lastTokenComplete
			) {
				const result = await this.splitMultiKanjisSequence(lastToken);
				this.setLastToken(result);
			}

			currentToken = await this.refineToken(currentToken);

			this.tokens.push(currentToken);
		}

		const lastToken = this.getLastToken();
		if (lastToken !== null) {
			if (
				CharType.of(this.getLastChar(lastToken.text)) === CharType.KANJI
				&& !this.isTokenComplete(lastToken)
			) {
				const result = await this.splitMultiKanjisSequence(lastToken);
				this.setLastToken(result);
			} else {
				this.setLastToken(await this.refineToken(lastToken));
			}
		}

		return this.tokens;
	}

	protected async refineToken(token: Token): Promise<Token> {
		const charType = CharType.of(this.getLastChar(token.text));

		if (ParticleToken.isParticle(token.text)) {
			return new ParticleToken(token.text);
		}
		if (charType === CharType.PUNCTUATION) {
			return new PunctuationToken(token.text);
		}

		const word = await this.dictionary.get(token.text);
		if (word.length > 0) {
			// Simple dictionary lookup
			return new WordToken(token.text, word);
		}

		return token;
	}

	protected async splitMultiKanjisSequence(token: Token): Promise<Token[]> {
		const tokens: Token[] = [];

		let begin = 0;
		while (begin < token.text.length) {
			let length;
			for (length = token.text.length - begin; length > 0; length--) {
				const sub = token.text.substr(begin, length);
				const word = await this.dictionary.get(sub);
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

	protected getLastToken(): Token|null {
		return this.tokens[this.tokens.length - 1] || null;
	}

	protected setLastToken(token: Token|Token[]): void {
		this.tokens.pop();

		if (token instanceof Array) {
			this.tokens.push(...token);
		} else {
			this.tokens.push(token);
		}
	}

	protected isTokenComplete(token: Token): boolean {
		return token.constructor !== Token;
	}

	protected async getTokenIfVerbConjugation(
		verb: string,
		position: number,
	): Promise<VerbToken|null> {
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
				await Promise.all(forms.map(async (form: VerbForm) => {
					words.push(...(
						await this.dictionary.get(verb + form.dictionaryForm)
					));
				}));

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
