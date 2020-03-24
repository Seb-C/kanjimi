import Conjugations from 'Server/Lexer/Conjugations';
import Conjugation from 'Common/Models/Conjugation';
import Token from 'Common/Models/Token';
import CharType from 'Common/Types/CharType';
import TokenType from 'Common/Types/TokenType';
import Language from 'Common/Types/Language';
import Dictionary from 'Server/Lexer/Dictionary';
import Word from 'Common/Models/Word';

interface CharTypeText {
	readonly text: string;
	readonly type: CharType;
}

export default class Lexer {
	protected readonly dictionary: Dictionary;

	constructor(dictionary: Dictionary) {
		this.dictionary = dictionary;
	}

	analyze (text: string, langs: Language[]|null = null): Token[] {
		const textsByCharType: CharTypeText[] = this.splitTextByCharType(text);

		const tokens: Token[] = [];

		for (let i = 0; i < textsByCharType.length; i++) {
			const currentText = textsByCharType[i];

			if (currentText.type === CharType.PUNCTUATION) {
				tokens.push(new Token(currentText.text, TokenType.PUNCTUATION));
				continue;
			}

			if (currentText.type === CharType.OTHER) {
				tokens.push(new Token(currentText.text, TokenType.UNKNOWN));
				continue;
			}

			// Katakanas should not be splitted
			if (currentText.type === CharType.KATAKANA) {
				const word = this.dictionary.get(currentText.text, langs);
				if (word.length > 0) {
					tokens.push(new Token(currentText.text, TokenType.WORD, word));
				} else {
					tokens.push(new Token(currentText.text, TokenType.UNKNOWN));
				}
				continue;
			}

			// Merging hiragana and kanji tokens
			let text = '';
			do {
				text += textsByCharType[i].text;
				i++;
			} while (i < textsByCharType.length && (
				textsByCharType[i].type === CharType.HIRAGANA
				|| textsByCharType[i].type === CharType.KANJI
			));
			i--; // We increased too much on the last iteration

			for (const token of this.splitByDictionarySearches(text, langs)) {
				tokens.push(token);
			}
		}

		return tokens;
	}

	splitTextByCharType (text: string): CharTypeText[] {
		if (text.length === 0) {
			return [];
		}

		const texts: CharTypeText[] = [];

		let currentTokenCharType: CharType = CharType.of(text[0]);
		let currentTokenStartIndex = 0;

		for (let currentIndex = 1; currentIndex < text.length; currentIndex++) {
			const currentCharType = CharType.of(text[currentIndex]);
			if (currentTokenCharType !== null && currentCharType !== currentTokenCharType) {
				texts.push(<CharTypeText>{
					text: text.substring(currentTokenStartIndex, currentIndex),
					type: currentTokenCharType,
				});
				currentTokenCharType = currentCharType;
				currentTokenStartIndex = currentIndex;
			}
		}

		texts.push(<CharTypeText>{
			text: text.substring(currentTokenStartIndex),
			type: currentTokenCharType,
		});

		return texts;
	}

	*splitByDictionarySearches (text: string, langs: Language[]|null = null): Iterable<Token> {
		for (let position = 0; position < text.length; position++) {
			for (let length = text.length - position; length > 0; length--) {
				const foundMeaning = this.searchMeaning(
					text.substring(position, position + length),
					langs,
				);
				if (foundMeaning !== null) {
					if (position > 0) {
						// Making the text preceding this word as a separate token
						yield this.makeUnknownToken(text.substring(0, position), langs);
					}

					yield foundMeaning;

					if (text.length > (position + length)) {
						for (const token of this.splitByDictionarySearches(
							text.substring(position + length),
							langs,
						)) {
							yield token;
						}
					}

					return;
				}
			}
		}

		// Not found anything in the whole string
		yield this.makeUnknownToken(text, langs);
	}

	makeUnknownToken (text: string, langs: Language[]|null = null): Token {
		if (TokenType.isParticle(text)) {
			return new Token(
				text,
				TokenType.PARTICLE,
				this.dictionary.get(text, langs),
			);
		} else {
			return new Token(text, TokenType.UNKNOWN);
		}
	}

	searchMeaning (text: string, langs: Language[]|null = null): Token|null {
		if (TokenType.isParticle(text)) {
			return new Token(
				text,
				TokenType.PARTICLE,
				this.dictionary.get(text, langs),
			);
		}

		if (this.dictionary.has(text)) {
			return new Token(text, TokenType.WORD, this.dictionary.get(text, langs));
		}

		for (let i = 0; i < text.length ; i++) {
			const conjugation = text.substring(i);
			if (Conjugations.hasForm(conjugation)) {
				const forms = Conjugations.getForms(conjugation);
				const prefix = text.substring(0, i);

				const words: Word[] = [];
				forms.forEach((form: Conjugation) => {
					words.push(...this.dictionary.get(prefix + form.dictionaryForm, langs));
					words.push(...this.dictionary.getReading(prefix + form.dictionaryForm, langs));
				});

				if (words.length > 0) {
					return new Token(
						prefix + conjugation,
						TokenType.VERB,
						words,
						prefix,
						conjugation,
						forms,
					);
				}
			}
		}

		if (this.dictionary.hasReading(text)) {
			return new Token(text, TokenType.WORD, this.dictionary.getReading(text, langs));
		}

		return null;
	}
}
