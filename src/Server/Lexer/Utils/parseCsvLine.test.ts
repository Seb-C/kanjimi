import 'jasmine';
import parseCsvLine from 'Server/Lexer/Utils/parseCsvLine';

describe('parseCsvLine', async function() {
	it('parseCsvLine', async function() {
		const columns = parseCsvLine(
			'あいうえお,aiueo,"""definition""","tag1/tag2/"""""',
		);

		expect(columns).toEqual([
			'あいうえお',
			'aiueo',
			'"definition"',
			'tag1/tag2/""',
		]);
	});
});
