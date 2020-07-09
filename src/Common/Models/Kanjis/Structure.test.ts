import 'jasmine';
import Structure from 'Common/Models/Kanjis/Structure';

describe('Structure', function() {
	it('API formatting methods', function() {
		const input = new Structure('kanji', 'top', [
			'stroke',
			new Structure('kanji2', 'bottom', []),
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
});
