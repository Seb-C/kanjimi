import 'jasmine';
import CharType from '../src/Lexer/CharType';

describe('CharType', () => {
	it('Hiraganas', async () => {
		Array.from(
			'あいうえおかがきぎくぐけげこごさざしじすずせぜそぞ'
			+ 'ただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷ'
			+ 'へべぺほぼぽまみむめもゃやゅゆょよらりるれろわん',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.HIRAGANA)
		));
	});
	it('Katakanas', async () => {
		Array.from(
			'アイウエオカガキギクグケゲコゴサザシジスズセゼソゾ'
			+ 'タダチヂツヅテデトドナニヌネノハバパヒビピフブプ'
			+ 'ヘベペホボポマミムメモャヤュユョヨラリルレロワヲン',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.KATAKANA)
		));
	});
	it('Punctuation', async () => {
		Array.from(
			'、。〃〇〈〉《》「」『』【】〒〔〕〖〗〘〙〚〛〜〝〞〟〶〽',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.PUNCTUATION)
		));
	});
	it('Kanji', async () => {
		Array.from(
			'一二三四五六七八九十円百千万何日月明寺時'
			+ '火水木金土今分週年曜大中小少多上下右左石'
			+ '人入出口外目手足止歩音読訓音熟語能々',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.KANJI)
		));
	});
	it('Others', async () => {
		Array.from(
			'abcdefghijklmnopqrstuvwxyz'
			+ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		).forEach(char => (
			expect(CharType.of(char)).toBe(CharType.OTHER)
		));
	});
});
