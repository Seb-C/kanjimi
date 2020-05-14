enum Language {
	GERMAN = 'de',
	ENGLISH = 'en',
	SPANISH = 'es',
	FRENCH = 'fr',
	HUNGARIAN = 'hu',
	DUTCH = 'nl',
	PORTUGUESE = 'pt',
	RUSSIAN = 'ru',
	SLOVENIAN = 'sl',
	SWEDISH = 'sv',
}

namespace Language {
	export const LIST = <Language[]>Object.values(Language);
	export function toUnicodeFlag(lang: Language): string {
		let langCode: string;
		switch (lang) {
			case Language.ENGLISH:
				langCode = 'GB';
				break;
			case Language.SLOVENIAN:
				langCode = 'SI';
				break;
			case Language.SWEDISH:
				langCode = 'SE';
				break;
			default:
				langCode = (<string>lang).toUpperCase();
				break;
		}

		const unicodeOffset = 127397;
		const firstCharCode = <number>langCode.codePointAt(0) + unicodeOffset;
		const secondCharCode = <number>langCode.codePointAt(1) + unicodeOffset;

		return String.fromCodePoint(firstCharCode) + String.fromCodePoint(secondCharCode);
	};
}

export default Language;
