import Token from 'Lexer/Token/Token';
import CharType from 'Misc/CharType';

export default class CharTypeTokenizer {
	tokenize (text: string): Token[] {
		if (text.length === 0) {
			return [];
		}

		const tokens: Token[] = [];

		let currentTokenCharType: CharType = CharType.of(text[0]);
		let currentTokenStartIndex = 0;

		for (let currentIndex = 1; currentIndex < text.length; currentIndex++) {
			const currentCharType = CharType.of(text[currentIndex]);
			if (currentTokenCharType !== null && currentCharType !== currentTokenCharType) {
				tokens.push(new Token(
					text.substring(currentTokenStartIndex, currentIndex),
				));
				currentTokenCharType = currentCharType;
				currentTokenStartIndex = currentIndex;
			}
		}

		tokens.push(new Token(text.substring(currentTokenStartIndex)));

		return tokens;
	}
}
