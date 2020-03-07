import Conjugations from 'Server/Lexer/Conjugations';
import Conjugation from 'Common/Models/Conjugation';
import Token from 'Common/Models/Token/Token';
import CharType from 'Common/Types/CharType';
import VerbToken from 'Common/Models/Token/VerbToken';
import ParticleToken from 'Common/Models/Token/ParticleToken';
import PunctuationToken from 'Common/Models/Token/PunctuationToken';
import WordToken from 'Common/Models/Token/WordToken';
import CharTypeToken from 'Common/Models/Token/CharTypeToken';
import Dictionary from 'Server/Lexer/Dictionary';
import Word from 'Common/Models/Word';

export default class Lexer {
	protected readonly dictionary: Dictionary;

	constructor(dictionary: Dictionary) {
		this.dictionary = dictionary;
	}

	analyze (text: string): Token[] {
		const tokensByCharType: CharTypeToken[] = this.tokenizeByCharType(text);

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

	tokenizeByCharType (text: string): CharTypeToken[] {
		if (text.length === 0) {
			return [];
		}

		const tokens: CharTypeToken[] = [];

		let currentTokenCharType: CharType = CharType.of(text[0]);
		let currentTokenStartIndex = 0;

		for (let currentIndex = 1; currentIndex < text.length; currentIndex++) {
			const currentCharType = CharType.of(text[currentIndex]);
			if (currentTokenCharType !== null && currentCharType !== currentTokenCharType) {
				tokens.push(new CharTypeToken(
					text.substring(currentTokenStartIndex, currentIndex),
					currentTokenCharType,
				));
				currentTokenCharType = currentCharType;
				currentTokenStartIndex = currentIndex;
			}
		}

		tokens.push(new CharTypeToken(
			text.substring(currentTokenStartIndex),
			currentTokenCharType,
		));

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
		if (ParticleToken.isParticle(text)) {
			return new ParticleToken(text);
		}

		if (this.dictionary.has(text)) {
			return new WordToken(text, this.dictionary.get(text));
		}

		for (let i = 1; i < text.length ; i++) {
			const conjugation = text.substring(i);
			if (Conjugations.hasForm(conjugation)) {
				const forms = Conjugations.getForms(conjugation);
				const prefix = text.substring(0, i);

				const words: Word[] = [];
				forms.forEach((form: Conjugation) => {
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
