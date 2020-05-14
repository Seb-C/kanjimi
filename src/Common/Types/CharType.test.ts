import 'jasmine';
import CharType from 'Common/Types/CharType';

describe('CharType', () => {
	it('of method - Hiraganas', () => {
		Array.from(
			'あいうえおかがきぎくぐけげこごさざしじすずせぜそぞ'
			+ 'ただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷ'
			+ 'へべぺほぼぽまみむめもゃやゅゆょよらりるれろわん',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.HIRAGANA)
		));
	});
	it('of method - Katakanas', () => {
		Array.from(
			'アイウエオカガキギクグケゲコゴサザシジスズセゼソゾ'
			+ 'タダチヂツヅテデトドナニヌネノハバパヒビピフブプ'
			+ 'ヘベペホボポマミムメモャヤュユョヨラリルレロワヲンー',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.KATAKANA)
		));
	});
	it('of method - Punctuation', () => {
		Array.from(
			'、。〃〇〈〉《》「」『』【】〒〔〕〖〗〘〙〚〛〜〝〞〟〶〽',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.PUNCTUATION)
		));
	});
	it('of method - Kanji', () => {
		Array.from(
			'一二三四五六七八九十円百千万何日月明寺時'
			+ '火水木金土今分週年曜大中小少多上下右左石'
			+ '人入出口外目手足止歩音読訓音熟語能々',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.KANJI)
		));
	});
	it('of method - Others', () => {
		Array.from(
			'abcdefghijklmnopqrstuvwxyz'
			+ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.OTHER)
		));
	});
	it('isJapanese method', () => {
		Array.from('あア。時').forEach(char => (
			expect(CharType.isJapanese(char)).toBe(true)
		));
		Array.from('aA.1').forEach(char => (
			expect(CharType.isJapanese(char)).toBe(false)
		));
	});
	it('katakanaToHiragana method', () => {
		expect(CharType.katakanaToHiragana('アイウエオ')).toBe('あいうえお');
		expect(CharType.katakanaToHiragana('ンヴヵヶ')).toBe('んゔゕゖ');
		expect(CharType.katakanaToHiragana('ケーキ')).toBe('けーき');
		expect(CharType.katakanaToHiragana('トマトのパン')).toBe('とまとのぱん');
	});
	it('hiraganaToRomaji method', () => {
		expect(CharType.hiraganaToRomaji('がっこう')).toBe('gakkou');
		expect(CharType.hiraganaToRomaji('こうえん')).toBe('kouen');
		expect(CharType.hiraganaToRomaji('きょう')).toBe('kyou');
		expect(CharType.hiraganaToRomaji('っきゃ')).toBe('kkya');
		expect(CharType.hiraganaToRomaji('ふたつ・ことば')).toBe('futatsu・kotoba');
	});
});
