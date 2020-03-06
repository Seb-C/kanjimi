import ConjugationForms from 'Lexer/Conjugation/ConjugationForms';
import ConjugationForm from 'Lexer/Conjugation/ConjugationForm';
import Token from 'Lexer/Token/Token';
import CharType from 'Misc/CharType';
import VerbToken from 'Lexer/Token/VerbToken';
import ParticleToken from 'Lexer/Token/ParticleToken';
import PunctuationToken from 'Lexer/Token/PunctuationToken';
import WordToken from 'Lexer/Token/WordToken';
import CharTypeToken from 'Lexer/Token/CharTypeToken';
import CharTypeTokenizer from 'Lexer/CharTypeTokenizer';
import Dictionary from 'Dictionary/Dictionary';
import Word from 'Dictionary/Word';

export default class Lexer {
	protected readonly dictionary: Dictionary;
	protected readonly tokenizer: CharTypeTokenizer;

	constructor(dictionary: Dictionary) {
		this.dictionary = dictionary;
		this.tokenizer = new CharTypeTokenizer();
	}

	analyze (text: string): Token[] {
		const tokensByCharType: CharTypeToken[] = this.tokenizer.tokenizeByCharType(text);

		const tokens: Token[] = [];

		for (let i = 0; i < tokensByCharType.length; i++) {
			const currentToken = tokensByCharType[i];

			if (currentToken.charType === CharType.PUNCTUATION) {
				tokens.push(new PunctuationToken(currentToken.text));
				continue;
			}

			if (currentToken.charType === CharType.OTHER) {
				tokens.push(new Token(currentToken.text));
				continue;
			}

			// Katakanas should not be splitted
			if (currentToken.charType === CharType.KATAKANA) {
				const word = this.dictionary.get(currentToken.text);
				if (word.length > 0) {
					tokens.push(new WordToken(currentToken.text, word));
				} else {
					tokens.push(new Token(currentToken.text));
				}
				continue;
			}

			// Merging hiragana and kanji tokens
			let text = '';
			do {
				text += tokensByCharType[i].text;
				i++;
			} while (i < tokensByCharType.length && (
				tokensByCharType[i].charType === CharType.HIRAGANA
				|| tokensByCharType[i].charType === CharType.KANJI
			));
			i--; // We increased too much on the last iteration

			for (const token of this.splitByDictionarySearches(text)) {
				tokens.push(token);
			}
		}

		return tokens;
	}

	*splitByDictionarySearches (text: string): Iterable<Token> {
		for (let position = 0; position < text.length; position++) {
			for (let length = text.length - position; length > 0; length--) {
				const foundMeaning = this.searchMeaning(text.substring(position, position + length));
				if (foundMeaning !== null) {
					if (position > 0) {
						// Making the text preceding this word as a separate token
						yield this.makeUnknownToken(text.substring(0, position));
					}

					yield foundMeaning;

					if (text.length > (position + length)) {
						for (const token of this.splitByDictionarySearches(text.substring(position + length))) {
							yield token;
						}
					}

					return;
				}
			}
		}

		// Not found anything in the whole string
		yield this.makeUnknownToken(text);
	}

	makeUnknownToken (text: string): Token {
		if (ParticleToken.isParticle(text)) {
			return new ParticleToken(text);
		} else {
			return new Token(text);
		}
	}

	searchMeaning (text: string): Token|null {
		if (this.dictionary.has(text)) {
			return new WordToken(text, this.dictionary.get(text));
		}

		for (let i = 1; i < text.length ; i++) {
			const conjugation = text.substring(i);
			if (ConjugationForms.hasForm(conjugation)) {
				const forms = ConjugationForms.getForms(conjugation);
				const prefix = text.substring(0, i);

				const words: Word[] = [];
				forms.forEach((form: ConjugationForm) => {
					words.push(...this.dictionary.get(prefix + form.dictionaryForm));
				});

				if (words.length > 0) {
					return new VerbToken(prefix, conjugation, forms, words);
				}
			}
		}

		return null;
	}
}
