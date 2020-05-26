import 'jasmine';
import CharType from 'Common/Types/CharType';

describe('CharType', function() {
	it('of method - Hiraganas', function() {
		Array.from(
			'あいうえおかがきぎくぐけげこごさざしじすずせぜそぞ'
			+ 'ただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷ'
			+ 'へべぺほぼぽまみむめもゃやゅゆょよらりるれろわん',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.HIRAGANA)
		));
	});
	it('of method - Katakanas', function() {
		Array.from(
			'アイウエオカガキギクグケゲコゴサザシジスズセゼソゾ'
			+ 'タダチヂツヅテデトドナニヌネノハバパヒビピフブプ'
			+ 'ヘベペホボポマミムメモャヤュユョヨラリルレロワヲンー',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.KATAKANA)
		));
	});
	it('of method - Punctuation', function() {
		Array.from(
			'、。〃〇〈〉《》「」『』【】〒〔〕〖〗〘〙〚〛〜〝〞〟〶〽',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.PUNCTUATION)
		));
	});
	it('of method - Kanji', function() {
		Array.from(
			'一二三四五六七八九十円百千万何日月明寺時'
			+ '火水木金土今分週年曜大中小少多上下右左石'
			+ '人入出口外目手足止歩音読訓音熟語能々',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.KANJI)
		));
	});
	it('of method - Others', function() {
		Array.from(
			'abcdefghijklmnopqrstuvwxyz'
			+ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.OTHER)
		));
	});
	it('isJapanese method', function() {
		Array.from('あア。時').forEach(char => (
			expect(CharType.isJapanese(char)).toBe(true)
		));
		Array.from('aA.1').forEach(char => (
			expect(CharType.isJapanese(char)).toBe(false)
		));
	});
	it('katakanaToHiragana method', function() {
		expect(CharType.katakanaToHiragana('アイウエオ')).toBe('あいうえお');
		expect(CharType.katakanaToHiragana('ンヴヵヶ')).toBe('んゔゕゖ');
		expect(CharType.katakanaToHiragana('ケーキ')).toBe('けーき');
		expect(CharType.katakanaToHiragana('トマトのパン')).toBe('とまとのぱん');
	});
	it('hiraganaToRoman method', function() {
		expect(CharType.hiraganaToRoman('がっこう')).toBe('gakkou');
		expect(CharType.hiraganaToRoman('こうえん')).toBe('kouen');
		expect(CharType.hiraganaToRoman('きょう')).toBe('kyou');
		expect(CharType.hiraganaToRoman('っきゃ')).toBe('kkya');
		expect(CharType.hiraganaToRoman('ふたつ・ことば')).toBe('futatsu・kotoba');
	});
});
