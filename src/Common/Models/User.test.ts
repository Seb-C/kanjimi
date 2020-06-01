import 'jasmine';
import User from 'Common/Models/User';
import Language from 'Common/Types/Language';

describe('User', function() {
	it('API formatting methods', function() {
		const now = new Date();
		const input = new User({
			id: 'uuid',
			email: 'someone@example.com',
			emailVerified: false,
			password: '123456',
			languages: [Language.FRENCH, Language.GERMAN],
			romanReading: true,
			jlpt: 2,
			createdAt: now,
		});

		const apiData = <any>(input.toApi());
		expect(apiData.password).toBe(null);
		expect(apiData.emailVerificationKey).not.toBeDefined();
		expect(apiData.passwordResetKey).not.toBeDefined();
		expect(apiData.passwordResetKeyExpiresAt).not.toBeDefined();

		const output = User.fromApi(JSON.parse(JSON.stringify(apiData)));
		expect(output.id).toBe('uuid');
		expect(output.email).toBe('someone@example.com');
		expect(output.emailVerified).toBe(false);
		expect(output.emailVerificationKey).toBe(null);
		expect(output.password).toBe(null);
		expect(output.passwordResetKey).toBe(null);
		expect(output.passwordResetKeyExpiresAt).toBe(null);
		expect(output.languages).toEqual([Language.FRENCH, Language.GERMAN]);
		expect(output.romanReading).toBe(true);
		expect(output.jlpt).toBe(2);
		expect(output.createdAt).toEqual(now);
	});
});
