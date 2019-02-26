import 'jasmine';
import Database from '../src/Database';

describe('Database', () => {
	it('Simple query', async () => {

		class TestObject {
			constructor (params?: Truc) {
			}
		}

		(async () => {
			console.log(
				await new Database().get(Truc),
				await new Database().exec(),
				await new Database().array(Truc),
				await new Database().iterate(Truc, async (t: Truc) => console.log(t)),
			);
		})();

		// TODO
		// expect(CharType.of(char)).toBe(CharType.HIRAGANA)
	});
});
