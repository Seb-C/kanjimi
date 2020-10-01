import 'jasmine';
import Structure from 'Common/Models/Kanjis/Structure';
import KanjiPartPosition from 'Common/Types/KanjiPartPosition';

describe('Structure', function() {
	it('API formatting methods', function() {
		const input = new Structure('kanji', KanjiPartPosition.TOP, [
			'stroke',
			new Structure('kanji2', KanjiPartPosition.BOTTOM, []),
			'stroke2',
		]);
		const output = Structure.fromApi(JSON.parse(JSON.stringify(input.toApi())));

		expect(input).toEqual(output);
		expect(input.element).toBe(output.element);
		expect(input.position).toBe(output.position);
		expect(input.components).toEqual(output.components);
	});

	it('Parsing with missing properties', function() {
		const output = Structure.fromApi({
			element: 'kanji',
		});

		expect(output.element).toBe('kanji');
		expect(output.position).toBe(null);
		expect(output.components).toEqual([]);
	});

	it('getDirectSubStructures', function() {
		const structure = new Structure('kanji', KanjiPartPosition.TOP, [
			'stroke',
			new Structure('kanji2', KanjiPartPosition.BOTTOM, []),
			'stroke2',
			new Structure('kanji3', KanjiPartPosition.BOTTOM, [
				'stroke3',
				new Structure('kanji4', KanjiPartPosition.BOTTOM, []),
			]),
		]);

		const result = structure.getDirectSubStructures();
		expect(result.map(s => s.element)).toEqual(['kanji2', 'kanji3']);
	});
});
