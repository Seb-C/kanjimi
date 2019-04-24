import 'jasmine';
import ConjugationForm from 'Lexer/Conjugation/ConjugationForm';
import ConjugationForms from 'Lexer/Conjugation/ConjugationForms';
import ConjugationType from 'Lexer/Conjugation/ConjugationType';

describe('Lexer', async () => {
	it('existing verb forms', async () => {
		const checkForm = (conjugation: string, plain: string, type: ConjugationType) => {
			const forms = ConjugationForms.getForms(conjugation);
			expect(forms.map((form: ConjugationForm): boolean => {
				return (
					form.type === type
					&& form.dictionaryForm === plain
					&& form.conjugation === conjugation
				);
			})).toContain(
				true,
				`Form ${conjugation} was not found for type ${ConjugationType[type]}.`,
			);
		};

		const util = require('util');
		console.log(util.inspect(ConjugationForms, { showHidden: false, depth: null }));

		checkForm('りませんでした',   'る', ConjugationType.POLITE_NEGATIVE_PAST);
		checkForm('りません',         'る', ConjugationType.POLITE_NEGATIVE);
		checkForm('って',             'る', ConjugationType.TE);
		checkForm('らなかった',       'る', ConjugationType.NEGATIVE_PAST);
		checkForm('れ',               'る', ConjugationType.IMPERATIVE);
		checkForm('るな',             'る', ConjugationType.PROHIBITIVE);
		checkForm('れば',             'る', ConjugationType.CONDITIONAL);
		checkForm('ろう',             'る', ConjugationType.VOLITIONAL);
		checkForm('った',             'る', ConjugationType.PAST);
		checkForm('ります',           'る', ConjugationType.POLITE);
		checkForm('らない',           'る', ConjugationType.NEGATIVE);
		checkForm('られる',           'る', ConjugationType.PASSIVE);
		checkForm('らせる',           'る', ConjugationType.CAUSATIVE);
		checkForm('れる',             'る', ConjugationType.POTENTIAL);
		checkForm('る',               'る', ConjugationType.PLAIN);
		checkForm('らせない',         'る', ConjugationType.CAUSATIVE_NEGATIVE);
		checkForm('らせなかった',     'る', ConjugationType.CAUSATIVE_NEGATIVE_PAST);
		checkForm('らせた',           'る', ConjugationType.CAUSATIVE_PAST);
		checkForm('らせます',         'る', ConjugationType.CAUSATIVE_POLITE);
		checkForm('らせません',       'る', ConjugationType.CAUSATIVE_POLITE_NEGATIVE);
		checkForm('らせませんでした', 'る', ConjugationType.CAUSATIVE_POLITE_NEGATIVE_PAST);
		checkForm('らせました',       'る', ConjugationType.CAUSATIVE_POLITE_PAST);
		checkForm('られない',         'る', ConjugationType.PASSIVE_NEGATIVE);
		checkForm('られなかった',     'る', ConjugationType.PASSIVE_NEGATIVE_PAST);
		checkForm('られた',           'る', ConjugationType.PASSIVE_PAST);
		checkForm('られます',         'る', ConjugationType.PASSIVE_POLITE);
		checkForm('られません',       'る', ConjugationType.PASSIVE_POLITE_NEGATIVE);
		checkForm('られませんでした', 'る', ConjugationType.PASSIVE_POLITE_NEGATIVE_PAST);
		checkForm('られました',       'る', ConjugationType.PASSIVE_POLITE_PAST);
		checkForm('りました',         'る', ConjugationType.POLITE_PAST);
		checkForm('りましょう',       'る', ConjugationType.POLITE_VOLITIONAL);
		checkForm('れない',           'る', ConjugationType.POTENTIAL_NEGATIVE);
		checkForm('れなかった',       'る', ConjugationType.POTENTIAL_NEGATIVE_PAST);
		checkForm('れた',             'る', ConjugationType.POTENTIAL_PAST);
		checkForm('れます',           'る', ConjugationType.POTENTIAL_POLITE);
		checkForm('れません',         'る', ConjugationType.POTENTIAL_POLITE_NEGATIVE);
		checkForm('れませんでした',   'る', ConjugationType.POTENTIAL_POLITE_NEGATIVE_PAST);
		checkForm('れました',         'る', ConjugationType.POTENTIAL_POLITE_PAST);
	});
});
