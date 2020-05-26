import 'jasmine';
import WordStatus from 'Common/Models/WordStatus';

describe('WordStatus', function() {
	it('API formatting methods', async function() {
		const input = new WordStatus({
			userId: 'useruuid',
			word: 'word',
			showFurigana: true,
			showTranslation: false,
		});
		const output = WordStatus.fromApi(JSON.parse(JSON.stringify(input.toApi())));

		expect(output.userId).toBe('useruuid');
		expect(output.word).toBe('word');
		expect(output.showFurigana).toBe(true);
		expect(output.showTranslation).toBe(false);
	});
});
