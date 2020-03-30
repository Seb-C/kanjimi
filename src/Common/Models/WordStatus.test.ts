import 'jasmine';
import WordStatus from 'Common/Models/WordStatus';
import Language from 'Common/Types/Language';

describe('WordStatus', () => {
	it('API formatting methods', async () => {
		const now = new Date();
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
