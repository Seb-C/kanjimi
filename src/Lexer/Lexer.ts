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
	protected dictionary: Dictionary;
	protected tokenizer: CharTypeTokenizer;

	constructor(dictionary: Dictionary) {
		this.dictionary = dictionary;
		this.tokenizer = new CharTypeTokenizer();
	}

	analyze (text: string): Token[] {
		// It is better to handle this function with a stack than an array
		const remainingTokensStack: CharTypeToken[] = this.tokenizer.tokenize(text).reverse();

		const tokens: Token[] = [];

		unstackTokensLoop: while (remainingTokensStack.length > 0) {
			const currentToken = <CharTypeToken>remainingTokensStack.pop();

			const nextToken = remainingTokensStack.length === 0
				? null
				: remainingTokensStack[remainingTokensStack.length - 1];
			if (
				nextToken !== null
				&& currentToken.charType === CharType.KANJI
				&& nextToken.charType === CharType.HIRAGANA
			) {
				let foundToken: VerbToken|null = null;
				for (let i = 0; i < nextToken.text.length; i++) {
					const conjugation = nextToken.text.substring(0, i + 1);
					if (ConjugationForms.hasForm(conjugation)) {
						const words: Word[] = [];
						const forms = ConjugationForms.getForms(conjugation);
						forms.map((form: ConjugationForm) => {
							words.push(...(
								this.dictionary.get(currentToken.text + form.dictionaryForm)
							));
						});

						foundToken = new VerbToken(currentToken.text, conjugation, forms, words);
						break;
					}
				}

				if (foundToken !== null) {
					tokens.push(foundToken);

					// Removing the conjugation token and adding the unhandled string to the stack
					remainingTokensStack.pop();
					if (nextToken.text.length > foundToken.conjugation.length) {
						remainingTokensStack.push(new CharTypeToken(
							nextToken.text.substring(foundToken.conjugation.length),
							nextToken.charType,
						));
					}

					continue;
				}
			}

			if (ParticleToken.isParticle(currentToken.text)) {
				tokens.push(new ParticleToken(currentToken.text));
				continue;
			}

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

			// Searching for dictionary words inside this token
			for (let begin = 0; begin < currentToken.text.length; begin++) {
				for (let length = currentToken.text.length - begin; length > 0; length--) {
					const sub = currentToken.text.substring(begin, begin + length);
					const word = this.dictionary.get(sub);
					if (word.length > 0) {
						if (begin > 0) {
							// Making the text preceding this word as a separate token
							const precedingText = currentToken.text.substring(0, begin);
							if (ParticleToken.isParticle(precedingText)) {
								tokens.push(new ParticleToken(precedingText));
							} else {
								tokens.push(new Token(precedingText));
							}
						}

						tokens.push(new WordToken(sub, word));

						if (currentToken.text.length > (begin + length)) {
							remainingTokensStack.push(new CharTypeToken(
								currentToken.text.substring(begin + length),
								currentToken.charType,
							));
						}

						continue unstackTokensLoop;
					}
				}
			}

			// Don't know what to do with this token...
			tokens.push(new Token(currentToken.text));
		}

		return tokens;
	}
}
