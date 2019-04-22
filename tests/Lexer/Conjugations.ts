import 'jasmine';
import VerbForm from 'Lexer/Verb/VerbForm';
import VerbForms from 'Lexer/Verb/VerbForms';
import VerbFormType from 'Lexer/Verb/VerbFormType';

describe('Lexer', async () => {
	it('existing verb forms', async () => {
		const checkForm = (conjugation: string, plain: string, type: VerbFormType) => {
			const forms = VerbForms.getForms(conjugation);
			expect(forms.map((form: VerbForm): boolean => {
				return (
					form.type === type
					&& form.dictionaryForm === plain
					&& form.conjugation === conjugation
				);
			})).toContain(
				true,
				`Form ${conjugation} was not found for type ${VerbFormType[type]}.`,
			);
		};

		const util = require('util');
		console.log(util.inspect(VerbForms, { showHidden: false, depth: null }));

		checkForm('りませんでした',   'る', VerbFormType.POLITE_NEGATIVE_PAST);
		checkForm('りません',         'る', VerbFormType.POLITE_NEGATIVE);
		checkForm('って',             'る', VerbFormType.TE);
		checkForm('らなかった',       'る', VerbFormType.NEGATIVE_PAST);
		checkForm('れ',               'る', VerbFormType.IMPERATIVE);
		checkForm('るな',             'る', VerbFormType.PROHIBITIVE);
		checkForm('れば',             'る', VerbFormType.CONDITIONAL);
		checkForm('ろう',             'る', VerbFormType.VOLITIONAL);
		checkForm('った',             'る', VerbFormType.PAST);
		checkForm('ります',           'る', VerbFormType.POLITE);
		checkForm('らない',           'る', VerbFormType.NEGATIVE);
		checkForm('られる',           'る', VerbFormType.PASSIVE);
		checkForm('らせる',           'る', VerbFormType.CAUSATIVE);
		checkForm('れる',             'る', VerbFormType.POTENTIAL);
		checkForm('る',               'る', VerbFormType.PLAIN);
		checkForm('らせない',         'る', VerbFormType.CAUSATIVE_NEGATIVE);
		checkForm('らせなかった',     'る', VerbFormType.CAUSATIVE_NEGATIVE_PAST);
		checkForm('らせた',           'る', VerbFormType.CAUSATIVE_PAST);
		checkForm('らせます',         'る', VerbFormType.CAUSATIVE_POLITE);
		checkForm('らせません',       'る', VerbFormType.CAUSATIVE_POLITE_NEGATIVE);
		checkForm('らせませんでした', 'る', VerbFormType.CAUSATIVE_POLITE_NEGATIVE_PAST);
		checkForm('らせました',       'る', VerbFormType.CAUSATIVE_POLITE_PAST);
		checkForm('られない',         'る', VerbFormType.PASSIVE_NEGATIVE);
		checkForm('られなかった',     'る', VerbFormType.PASSIVE_NEGATIVE_PAST);
		checkForm('られた',           'る', VerbFormType.PASSIVE_PAST);
		checkForm('られます',         'る', VerbFormType.PASSIVE_POLITE);
		checkForm('られません',       'る', VerbFormType.PASSIVE_POLITE_NEGATIVE);
		checkForm('られませんでした', 'る', VerbFormType.PASSIVE_POLITE_NEGATIVE_PAST);
		checkForm('られました',       'る', VerbFormType.PASSIVE_POLITE_PAST);
		checkForm('りました',         'る', VerbFormType.POLITE_PAST);
		checkForm('りましょう',       'る', VerbFormType.POLITE_VOLITIONAL);
		checkForm('れない',           'る', VerbFormType.POTENTIAL_NEGATIVE);
		checkForm('れなかった',       'る', VerbFormType.POTENTIAL_NEGATIVE_PAST);
		checkForm('れた',             'る', VerbFormType.POTENTIAL_PAST);
		checkForm('れます',           'る', VerbFormType.POTENTIAL_POLITE);
		checkForm('れません',         'る', VerbFormType.POTENTIAL_POLITE_NEGATIVE);
		checkForm('れませんでした',   'る', VerbFormType.POTENTIAL_POLITE_NEGATIVE_PAST);
		checkForm('れました',         'る', VerbFormType.POTENTIAL_POLITE_PAST);
	});
});
