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

		while (remainingTokensStack.length > 0) {
			const currentToken = remainingTokensStack.pop();
			const nextToken = remainingTokensStack.length === 0
				? null
				: remainingTokensStack[remainingTokensStack.length - 1];

			if (
				nextToken !== null
				&& currentToken.charType === CharType.KANJI
				&& nextToken.charType === CharType.HIRAGANA
			) {
				let foundToken: Token = null;
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
					tokens.pop();
					tokens.push(new CharTypeToken(
						nextToken.text.substring(foundToken.text.length),
						nextToken.charType,
					));

					continue;
				}
			}

			if (ParticleToken.isParticle(token.text)) {
				tokens.push(new ParticleToken(token.text));
				continue;
			}

			if (currentToken.charType === CharType.PUNCTUATION) {
				tokens.push(new PunctuationToken(token.text));
				continue;
			}

			// TODO merge the kanji split with the dictionary search
			if (currentToken.charType === CharType.KANJI) {
				tokens.push(...this.splitMultiKanjisSequence(currentToken));
				continue;
			}
			const word = this.dictionary.get(currentToken.text);
			if (word.length > 0) {
				tokens.push(new WordToken(currentToken.text, word));
				continue;
			}

			tokens.push(currentToken);
		}

		return tokens;
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
}
