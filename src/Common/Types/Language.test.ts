import 'jasmine';
import Language from 'Common/Types/Language';

describe('Language', () => {
	it('toUnicodeFlag', () => {
		expect(Language.toUnicodeFlag(Language.GERMAN)).toBe('🇩🇪');
		expect(Language.toUnicodeFlag(Language.ENGLISH)).toBe('🇬🇧');
		expect(Language.toUnicodeFlag(Language.SPANISH)).toBe('🇪🇸');
		expect(Language.toUnicodeFlag(Language.HUNGARIAN)).toBe('🇭🇺');
		expect(Language.toUnicodeFlag(Language.DUTCH)).toBe('🇳🇱');
		expect(Language.toUnicodeFlag(Language.PORTUGUESE)).toBe('🇵🇹');
		expect(Language.toUnicodeFlag(Language.RUSSIAN)).toBe('🇷🇺');
		expect(Language.toUnicodeFlag(Language.SLOVENIAN)).toBe('🇸🇮');
		expect(Language.toUnicodeFlag(Language.SWEDISH)).toBe('🇸🇪');
	});
	it('LIST', () => {
		expect(Language.LIST).toContain(Language.GERMAN);
		expect(Language.LIST).toContain(Language.SWEDISH);
		expect(Language.LIST).toContain(Language.FRENCH);
		expect(Language.LIST).toContain(Language.ENGLISH);

		// Checking that we do not have unwanted properties
		expect(Math.max(...Language.LIST.map(l => l.length))).toBe(2);
	});
});
