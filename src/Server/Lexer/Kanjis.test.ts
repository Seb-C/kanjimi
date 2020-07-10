import 'jasmine';
import Meaning from 'Common/Models/Kanjis/Meaning';
import Reading from 'Common/Models/Kanjis/Reading';
import Structure from 'Common/Models/Kanjis/Structure';
import Kanji from 'Common/Models/Kanjis/Kanji';
import Kanjis from 'Server/Lexer/Kanjis';
import Language from 'Common/Types/Language';

describe('Kanjis', async function() {
	it('get (normal use case)', async function() {
		const meaning = new Meaning('食', 'meaning', Language.ENGLISH);
		const reading = new Reading('食', 'reading');
		const structure = new Structure('食', null, []);

		const kanjis = new Kanjis();
		kanjis.addMeaning(meaning);
		kanjis.addReading(reading);
		kanjis.addStructure(structure);

		const kanji = kanjis.get('食', null);
		expect(kanji).not.toBe(null);
		expect(kanji).toBeInstanceOf(Kanji);
		expect((<Kanji>kanji).kanji).toBe('食');
		expect((<Kanji>kanji).meanings).toEqual([meaning]);
		expect((<Kanji>kanji).readings).toEqual([reading]);
		expect((<Kanji>kanji).structure).toEqual(structure);
		expect((<Kanji>kanji).fileUrl).toBe('https://localhost:3000/img/KanjiVG/098df.svg');
	});

	it('get (no meanings case)', async function() {
		const kanjis = new Kanjis();
		kanjis.addReading(new Reading('食', 'reading'));
		kanjis.addStructure(new Structure('食', null, []));

		const kanji = kanjis.get('食', null);
		expect(kanji).not.toBe(null);
		expect((<Kanji>kanji).meanings).toEqual([]);
	});

	it('get (meanings without specific langs)', async function() {
		const meaningEn = new Meaning('食', 'meaning', Language.ENGLISH);
		const meaningFr = new Meaning('食', 'meaning', Language.FRENCH);

		const kanjis = new Kanjis();
		kanjis.addMeaning(meaningEn);
		kanjis.addMeaning(meaningFr);

		const kanji = kanjis.get('食', null);
		expect((<Kanji>kanji).meanings).toEqual([meaningEn, meaningFr]);
	});

	it('get (meanings with specific ordered langs)', async function() {
		const meaningEn = new Meaning('食', 'meaning', Language.ENGLISH);
		const meaningFr = new Meaning('食', 'meaning', Language.FRENCH);
		const meaningEs = new Meaning('食', 'meaning', Language.SPANISH);

		const kanjis = new Kanjis();
		kanjis.addMeaning(meaningEn);
		kanjis.addMeaning(meaningFr);
		kanjis.addMeaning(meaningEs);

		const kanji = kanjis.get('食', [Language.SPANISH, Language.ENGLISH]);
		expect((<Kanji>kanji).meanings).toEqual([meaningEs, meaningEn]);
	});

	it('get (no readings case)', async function() {
		const kanjis = new Kanjis();
		kanjis.addMeaning(new Meaning('食', 'meaning', Language.ENGLISH));
		kanjis.addStructure(new Structure('食', null, []));

		const kanji = kanjis.get('食', null);
		expect(kanji).not.toBe(null);
		expect((<Kanji>kanji).readings).toEqual([]);
	});

	it('get (no structures case)', async function() {
		const kanjis = new Kanjis();
		kanjis.addMeaning(new Meaning('食', 'meaning', Language.ENGLISH));
		kanjis.addReading(new Reading('食', 'reading'));

		const kanji = kanjis.get('食', null);
		expect(kanji).not.toBe(null);
		expect((<Kanji>kanji).structure).toEqual(new Structure('食', null, []));
	});

	it('get (unknown kanji case)', async function() {
		const kanjis = new Kanjis();

		const kanji = kanjis.get('食', null);
		expect(kanji).toBe(null);
	});

	it('has (unknown kanji case)', async function() {
		const kanjis = new Kanjis();

		expect(kanjis.has('食')).toBe(false);
	});

	it('has (meaning defined case)', async function() {
		const kanjis = new Kanjis();
		kanjis.addMeaning(new Meaning('食', 'meaning', Language.ENGLISH));

		expect(kanjis.has('食')).toBe(true);
	});

	it('has (reading defined case)', async function() {
		const kanjis = new Kanjis();
		kanjis.addReading(new Reading('食', 'reading'));

		expect(kanjis.has('食')).toBe(true);
	});

	it('has (structure defined case)', async function() {
		const kanjis = new Kanjis();
		kanjis.addStructure(new Structure('食', null, []));

		expect(kanjis.has('食')).toBe(true);
	});
});
