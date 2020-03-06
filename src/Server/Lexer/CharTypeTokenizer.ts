import CharTypeToken from 'Server/Lexer/Token/CharTypeToken';
import CharType from 'Common/Misc/CharType';

export default class CharTypeTokenizer {
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
}
